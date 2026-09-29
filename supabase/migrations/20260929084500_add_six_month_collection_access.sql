create or replace function private.submit_collection_package_request_impl(
  p_package_slug text,
  p_collection_slugs text[] default '{}'::text[],
  p_note text default null,
  p_coupon_code text default null
) returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog','public','auth','private'
as $function$
declare
  v_uid uuid := auth.uid(); v_email text; v_verified timestamptz; v_country text;
  v_coupon public.discount_coupons; v_coupon_code text := nullif(upper(btrim(coalesce(p_coupon_code,''))),'');
  v_package text := lower(btrim(coalesce(p_package_slug,''))); v_input_count integer;
  v_valid_slugs text[]; v_selected_count integer := 0; v_months integer; v_price numeric(12,2);
  v_subject text; v_id uuid := gen_random_uuid();
  v_code text := 'CPA-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)); v_now timestamptz := now();
begin
  if v_uid is null then raise exception 'Sign in required'; end if;
  select email,email_confirmed_at into v_email,v_verified from auth.users where id=v_uid;
  if v_email is null or v_verified is null then raise exception 'Verified email required'; end if;
  select count(distinct s) into v_input_count from unnest(coalesce(p_collection_slugs,'{}'::text[])) s where nullif(btrim(s),'') is not null;
  select coalesce(array_agg(c.slug order by c.starts_on),'{}'::text[]) into v_valid_slugs
  from public.membership_collections c where c.slug=any(coalesce(p_collection_slugs,'{}'::text[]))
    and c.is_published=true and c.starts_on < date_trunc('month',current_date)::date;
  v_selected_count := cardinality(v_valid_slugs);
  if v_selected_count <> v_input_count then raise exception 'One or more selected past collections are unavailable'; end if;
  if v_package='monthly-drop' then
    if v_selected_count<>0 then raise exception 'Monthly Drop does not accept past collection selections'; end if;
    v_months:=1; v_price:=20; v_subject:='CyberPop Monthly Drop';
  elsif v_package='six-month' then
    if v_selected_count<>0 then raise exception 'Six Month Access does not include past collection selections'; end if;
    v_months:=6; v_price:=100; v_subject:='CyberPop Six Month Access';
  elsif v_package='past-collections' then
    if v_selected_count<1 or v_selected_count>12 then raise exception 'Choose between 1 and 12 past collections'; end if;
    v_months:=null; v_price:=30*v_selected_count; v_subject:='CyberPop Past Collections · '||v_selected_count;
  elsif v_package='annual-plus-3' then
    if v_selected_count<>3 then raise exception 'Annual access includes exactly 3 selected past collections'; end if;
    v_months:=12; v_price:=200; v_subject:='CyberPop Annual Access + 3 Past Collections';
  else raise exception 'Package unavailable'; end if;
  if v_coupon_code is not null then
    select * into v_coupon from public.discount_coupons where upper(code)=v_coupon_code and is_active=true
      and (valid_from is null or valid_from<=v_now) and (valid_until is null or valid_until>=v_now) limit 1;
    if v_coupon.id is null then raise exception 'Coupon code not recognized'; end if;
  end if;
  select country_code into v_country from public.member_profiles where user_id=v_uid;
  insert into public.service_requests(id,request_code,user_id,email,country_code,request_type,subject,brief,status,currency,plan_slug,plan_months,plan_list_price,coupon_code,request_metadata,created_at,updated_at)
  values(v_id,v_code,v_uid,lower(v_email),v_country,'collection_access',v_subject,left(coalesce(nullif(btrim(p_note),''),'Collection access request'),5000),'submitted','USD',v_package,v_months,v_price,v_coupon_code,jsonb_build_object('package_slug',v_package,'collection_slugs',to_jsonb(v_valid_slugs),'unit_price_past_collection',30),v_now,v_now);
  return jsonb_build_object('id',v_id,'request_code',v_code,'package_slug',v_package,'months',v_months,'collection_slugs',v_valid_slugs,'list_price',v_price,'currency','USD','coupon',v_coupon_code,'status','submitted');
end;
$function$;

create or replace function public.admin_grant_package_from_request(p_request_id uuid,p_start_on date)
returns jsonb language plpgsql set search_path to 'pg_catalog','public' as $function$
declare
  v_admin uuid := auth.uid(); v_request public.service_requests; v_package text; v_slug text;
  v_collection public.membership_collections; v_base jsonb := '{}'::jsonb; v_bonus_count integer := 0; v_expected_months integer;
begin
  if v_admin is null or not exists(select 1 from public.sales_admin_users a where a.user_id=v_admin) then raise exception 'Admin authorization required'; end if;
  select * into v_request from public.service_requests where id=p_request_id for update;
  if v_request.id is null then raise exception 'Request not found'; end if;
  if v_request.request_type<>'collection_access' then raise exception 'Not a collection access request'; end if;
  if v_request.user_id is null then raise exception 'Link the request to a CyberPop account first'; end if;
  if v_request.status<>'paid' then raise exception 'Mark the request as Paid before granting access'; end if;
  if nullif(btrim(coalesce(v_request.payment_reference,'')),'') is null then raise exception 'Payment reference is required'; end if;
  v_package:=coalesce(v_request.request_metadata->>'package_slug',v_request.plan_slug);
  v_expected_months:=case v_package when 'monthly-drop' then 1 when 'six-month' then 6 when 'annual-plus-3' then 12 else null end;
  if v_expected_months is not null then
    if v_request.plan_months<>v_expected_months then raise exception 'Invalid package term'; end if;
    v_base:=public.admin_grant_collection_term(v_request.user_id,p_start_on,v_expected_months,'manual_payment',v_request.payment_reference,v_request.id,null);
  elsif v_package<>'past-collections' then raise exception 'Unsupported package request'; end if;
  for v_slug in select jsonb_array_elements_text(coalesce(v_request.request_metadata->'collection_slugs','[]'::jsonb)) loop
    select * into v_collection from public.membership_collections where slug=v_slug and is_published=true limit 1;
    if v_collection.id is null then raise exception 'Selected collection % is unavailable',v_slug; end if;
    perform public.admin_grant_collection_term(v_request.user_id,v_collection.starts_on,1,'manual_payment',v_request.payment_reference,v_request.id,null);
    v_bonus_count:=v_bonus_count+1;
  end loop;
  update public.service_requests set status='fulfilled',updated_at=now() where id=v_request.id;
  return v_base || jsonb_build_object('request_id',v_request.id,'status','fulfilled','package_slug',v_package,'selected_collections_granted',v_bonus_count);
end;
$function$;
