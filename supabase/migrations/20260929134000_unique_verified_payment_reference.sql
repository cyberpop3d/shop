-- A Payoneer transaction may settle only one completed collection order.
create unique index if not exists service_requests_unique_settled_payment_reference
  on public.service_requests (payment_reference)
  where payment_reference is not null and status in ('paid','fulfilled') and request_type='collection_access';
