do $$
begin
  if exists (
    select 1
    from public.sales_admin_users a
    left join auth.users u on u.id = a.user_id
    where u.id is null or lower(u.email) <> 'finnrubber@gmail.com'
  ) then
    raise exception 'sales_admin_users contains an account outside the CyberPop admin allowlist';
  end if;
end
$$;

create or replace function public.enforce_sales_admin_email_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1
    from auth.users u
    where u.id = new.user_id
      and lower(u.email) = 'finnrubber@gmail.com'
  ) then
    raise exception 'This account is not allowed to be a CyberPop admin.';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_sales_admin_email_allowlist() from public, anon, authenticated;

drop trigger if exists sales_admin_email_allowlist_guard on public.sales_admin_users;
create trigger sales_admin_email_allowlist_guard
before insert or update of user_id on public.sales_admin_users
for each row
execute function public.enforce_sales_admin_email_allowlist();
