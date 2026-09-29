create table if not exists public.membership_collection_delivery_codes (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null unique references public.membership_collections(id) on delete cascade,
  cults_code text,
  cults_url text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_collection_delivery_codes_value_check check (
    nullif(btrim(coalesce(cults_code,'')),'') is not null
    or nullif(btrim(coalesce(cults_url,'')),'') is not null
  )
);

alter table public.membership_collection_delivery_codes enable row level security;
revoke all on public.membership_collection_delivery_codes from anon, authenticated;
grant select, insert, update, delete on public.membership_collection_delivery_codes to authenticated;

create policy "collection delivery codes entitled read"
on public.membership_collection_delivery_codes for select to authenticated
using (
  exists (
    select 1 from public.membership_entitlements e
    where e.collection_id=membership_collection_delivery_codes.collection_id
      and e.user_id=(select auth.uid()) and e.status='active' and e.revoked_at is null
  )
  or exists (select 1 from public.sales_admin_users a where a.user_id=(select auth.uid()))
);

create policy "collection delivery codes admin insert"
on public.membership_collection_delivery_codes for insert to authenticated
with check (exists (select 1 from public.sales_admin_users a where a.user_id=(select auth.uid())));

create policy "collection delivery codes admin update"
on public.membership_collection_delivery_codes for update to authenticated
using (exists (select 1 from public.sales_admin_users a where a.user_id=(select auth.uid())))
with check (exists (select 1 from public.sales_admin_users a where a.user_id=(select auth.uid())));

create policy "collection delivery codes admin delete"
on public.membership_collection_delivery_codes for delete to authenticated
using (exists (select 1 from public.sales_admin_users a where a.user_id=(select auth.uid())));
