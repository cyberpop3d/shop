-- An admin verifies Payoneer externally, then this single transaction records the
-- payment and grants the exact requested package. No customer-side write path exists.
alter table public.membership_access_grants
  drop constraint membership_access_grants_months_check;
alter table public.membership_access_grants
  add constraint membership_access_grants_months_check check (months in (1,3,6,12));

create or replace function public.admin_grant_collection_term(
  p_user_id uuid,p_start_on date,p_months integer,p_source_type text,
  p_source_reference text default null,p_service_request_id uuid default null,
  p_patreon_member_id text default null
) returns jsonb language plpgsql set search_path to 'pg_catalog','public' as $function$
declare
  v_admin uuid := auth.uid(); v_start date := date_trunc('month',p_start_on)::date;
  v_i integer; v_date date; v_collection_id uuid; v_entitlement_source text;
  v_grant_id uuid; v_count integer := 0;
begin
  if v_admin is null or not exists(select 1 from public.sales_admin_users a where a.user_id=v_admin) then raise exception 'Admin authorization required'; end if;
  if p_months not in (1,3,6,12) then raise exception 'Months must be 1, 3, 6 or 12'; end if;
  if v_start < date '2026-04-01' then raise exception 'Collection access starts from April 2026'; end if;
  if p_source_type not in ('manual_payment','patreon','gift','manual') then raise exception 'Invalid grant source'; end if;
  if p_source_type='manual_payment' and nullif(btrim(coalesce(p_source_reference,'')),'') is null then raise exception 'Payment reference required for paid access'; end if;
  if p_source_type='patreon' and nullif(btrim(coalesce(p_patreon_member_id,'')),'') is null then raise exception 'Patreon member required'; end if;
  insert into public.membership_access_grants(user_id,service_request_id,source_type,source_reference,patreon_member_id,start_on,months,granted_by)
  values(p_user_id,p_service_request_id,p_source_type,nullif(btrim(p_source_reference),''),nullif(btrim(p_patreon_member_id),''),v_start,p_months,v_admin)
  returning id into v_grant_id;
  v_entitlement_source:=case when p_source_type='patreon' then 'migration' when p_source_type='manual_payment' then 'monthly_payment' else 'manual' end;
  for v_i in 0..p_months-1 loop
    v_date:=(v_start+make_interval(months=>v_i))::date;
    select id into v_collection_id from public.membership_collections where year=extract(year from v_date)::int and month=extract(month from v_date)::int limit 1;
    if v_collection_id is null then
      insert into public.membership_collections(year,month,slug,display_name,starts_on,is_published,featured)
      values(extract(year from v_date)::int,extract(month from v_date)::int,to_char(v_date,'YYYY-MM'),trim(to_char(v_date,'Month'))||' '||extract(year from v_date)::int::text,v_date,false,false)
      returning id into v_collection_id;
    end if;
    insert into public.membership_entitlements(user_id,collection_id,source_kind,status,granted_at,revoked_at,admin_note)
    values(p_user_id,v_collection_id,v_entitlement_source,'active',now(),null,'Grant '||v_grant_id::text||' · '||p_source_type||coalesce(' · '||nullif(btrim(p_source_reference),''),''))
    on conflict(user_id,collection_id) do update set source_kind=excluded.source_kind,status='active',revoked_at=null,admin_note=excluded.admin_note,updated_at=now();
    v_count:=v_count+1;
  end loop;
  return jsonb_build_object('grant_id',v_grant_id,'user_id',p_user_id,'start_on',v_start,'months',p_months,'collections_granted',v_count);
end;
$function$;

create or replace function public.admin_confirm_payment_and_grant(
  p_request_id uuid,p_start_on date,p_payment_reference text
) returns jsonb language plpgsql set search_path to 'pg_catalog','public' as $function$
declare
  v_request public.service_requests; v_admin uuid := auth.uid(); v_reference text := nullif(btrim(p_payment_reference),'');
  v_result jsonb;
begin
  if v_admin is null or not exists(select 1 from public.sales_admin_users where user_id=v_admin) then raise exception 'Admin authorization required'; end if;
  select * into v_request from public.service_requests where id=p_request_id for update;
  if v_request.id is null or v_request.request_type<>'collection_access' then raise exception 'Collection order not found'; end if;
  if v_request.status not in ('payment_requested','paid') then raise exception 'Send the Payoneer payment request before confirming payment'; end if;
  if v_request.user_id is null or not exists(
    select 1 from auth.users u where u.id=v_request.user_id and u.email_confirmed_at is not null and lower(u.email)=lower(v_request.email)
  ) then raise exception 'Verified account and order email must match'; end if;
  if nullif(btrim(coalesce(v_request.payoneer_payment_url,'')),'') is null then raise exception 'Save the Payoneer payment request URL first'; end if;
  if v_reference is null then raise exception 'Verified Payoneer payment reference is required'; end if;
  if exists(select 1 from public.service_requests s where s.id<>v_request.id and s.payment_reference=v_reference and s.status in ('paid','fulfilled')) then
    raise exception 'Payment reference is already used by another order';
  end if;
  update public.service_requests set status='paid',payment_reference=v_reference,updated_at=now() where id=v_request.id;
  if coalesce(v_request.request_metadata->>'package_slug',v_request.plan_slug) is not null then
    v_result:=public.admin_grant_package_from_request(v_request.id,p_start_on);
  else
    v_result:=public.admin_grant_access_from_request(v_request.id,p_start_on);
  end if;
  return v_result || jsonb_build_object('payment_reference',v_reference,'confirmed_by',v_admin,'confirmed_at',now());
end;
$function$;
revoke all on function public.admin_confirm_payment_and_grant(uuid,date,text) from public,anon;
grant execute on function public.admin_confirm_payment_and_grant(uuid,date,text) to authenticated;
