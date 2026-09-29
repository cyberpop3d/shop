drop policy if exists "collection delivery codes entitled read" on public.membership_collection_delivery_codes;
create policy "collection delivery codes entitled read"
on public.membership_collection_delivery_codes for select to authenticated
using (
  exists (
    select 1 from public.membership_entitlements e
    where e.collection_id=membership_collection_delivery_codes.collection_id
      and e.user_id=(select auth.uid()) and e.status='active' and e.revoked_at is null
  )
  or exists (
    select 1 from public.membership_collections c
    join public.membership_subscriptions s on s.user_id=(select auth.uid())
    where c.id=membership_collection_delivery_codes.collection_id
      and s.status='active' and s.billing_months=12
      and c.starts_on >= date_trunc('month',s.current_period_start)::date
      and c.starts_on < s.current_period_end
  )
  or exists (select 1 from public.sales_admin_users a where a.user_id=(select auth.uid()))
);
