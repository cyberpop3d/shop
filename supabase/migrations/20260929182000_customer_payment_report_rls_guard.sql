create or replace function public.guard_customer_payment_report_update()
returns trigger
language plpgsql
set search_path to 'pg_catalog','public','auth'
as $function$
declare
  v_uid uuid := auth.uid();
  v_admin boolean := false;
begin
  if v_uid is null then return new; end if;
  select exists(select 1 from public.sales_admin_users a where a.user_id=v_uid) into v_admin;
  if v_admin then return new; end if;
  if old.user_id is distinct from v_uid
     or old.status<>'payment_requested'
     or nullif(btrim(coalesce(old.payoneer_payment_url,'')),'') is null then
    raise exception 'Only the owner of an open Payoneer request may report payment';
  end if;
  if (to_jsonb(new)-'customer_payment_reported_at'-'customer_payment_note'-'updated_at')
     is distinct from
     (to_jsonb(old)-'customer_payment_reported_at'-'customer_payment_note'-'updated_at') then
    raise exception 'Customers may only report payment; request and payment fields are admin controlled';
  end if;
  if new.customer_payment_reported_at is null then
    raise exception 'Payment report cannot be removed by the customer';
  end if;
  return new;
end;
$function$;

drop trigger if exists guard_customer_payment_report_update on public.service_requests;
create trigger guard_customer_payment_report_update
before update on public.service_requests
for each row execute function public.guard_customer_payment_report_update();

drop policy if exists "Service requests customer reports payment" on public.service_requests;
create policy "Service requests customer reports payment"
on public.service_requests for update to authenticated
using (
  user_id=(select auth.uid()) and status='payment_requested'
  and nullif(btrim(coalesce(payoneer_payment_url,'')),'') is not null
)
with check (
  user_id=(select auth.uid()) and status='payment_requested'
  and nullif(btrim(coalesce(payoneer_payment_url,'')),'') is not null
);

create or replace function public.customer_report_payment(p_request_id uuid,p_note text default null)
returns jsonb
language plpgsql
security invoker
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
revoke all on function public.guard_customer_payment_report_update() from public,anon,authenticated;
