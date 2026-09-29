alter table public.service_requests
  add column if not exists customer_payment_reported_at timestamptz,
  add column if not exists customer_payment_note text;

alter table public.service_requests
  add constraint service_requests_customer_payment_note_length
  check (customer_payment_note is null or char_length(customer_payment_note)<=500);

create or replace function public.customer_report_payment(p_request_id uuid,p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path to 'pg_catalog','public','auth'
as $function$
declare
  v_user uuid := auth.uid();
  v_request public.service_requests;
  v_reported timestamptz;
begin
  if v_user is null then raise exception 'Sign in required'; end if;
  select * into v_request from public.service_requests
    where id=p_request_id and user_id=v_user for update;
  if v_request.id is null then raise exception 'Request not found'; end if;
  if v_request.status<>'payment_requested'
     or nullif(btrim(coalesce(v_request.payoneer_payment_url,'')),'') is null then
    raise exception 'A payment request is not available for this order yet';
  end if;
  v_reported:=coalesce(v_request.customer_payment_reported_at,now());
  update public.service_requests set
    customer_payment_reported_at=v_reported,
    customer_payment_note=left(nullif(btrim(coalesce(p_note,'')),''),500),
    updated_at=now()
  where id=v_request.id;
  return jsonb_build_object('request_code',v_request.request_code,'reported_at',v_reported);
end;
$function$;

revoke all on function public.customer_report_payment(uuid,text) from public,anon;
grant execute on function public.customer_report_payment(uuid,text) to authenticated;
