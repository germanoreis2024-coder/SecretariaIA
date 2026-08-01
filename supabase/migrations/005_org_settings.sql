-- =============================================
-- AtendeIA - Org Settings (credenciais por org)
-- =============================================

create table if not exists public.org_settings (
  org_id uuid not null references public.organizations(id) on delete cascade,
  key text not null,
  value text,
  updated_at timestamptz default now(),
  primary key (org_id, key)
);

alter table public.org_settings enable row level security;

create policy "Members can view org settings"
  on public.org_settings for select
  using (org_id = public.get_user_org_id());

create policy "Members can insert org settings"
  on public.org_settings for insert
  with check (org_id = public.get_user_org_id());

create policy "Members can update org settings"
  on public.org_settings for update
  using (org_id = public.get_user_org_id());
