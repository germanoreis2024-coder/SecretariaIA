-- =============================================
-- AtendeIA - Stripe Billing
-- =============================================

alter table public.organizations
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text default 'inactive';

-- Update RLS to allow admin operations (service role bypasses RLS)
-- Members can update org billing info
create policy "Members can update organization billing"
  on public.organizations for update
  using (
    id in (
      select org_id from public.org_members
      where user_id = auth.uid()
    )
  );
