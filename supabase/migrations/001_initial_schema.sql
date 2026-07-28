-- =============================================
-- AtendeIA - Initial Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- PROFILES
-- =============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- ORGANIZATIONS
-- =============================================
create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  owner_id uuid references public.profiles(id) on delete set null,
  plan text default 'free' check (plan in ('free','starter','pro','enterprise')),
  plan_expires_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz default now()
);

-- Auto-create org on profile creation
create or replace function public.handle_new_profile()
returns trigger as $$
declare
  org_name text;
  org_slug text;
begin
  org_name := coalesce(new.company_name, new.full_name, 'Minha Empresa');
  org_slug := lower(replace(regexp_replace(org_name, '[^a-zA-Z0-9\s-]', '', 'g'), ' ', '-'));
  org_slug := org_slug || '-' || substr(new.id::text, 1, 8);

  insert into public.organizations (name, slug, owner_id)
  values (org_name, org_slug, new.id);

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile();

-- =============================================
-- ORG MEMBERS
-- =============================================
create table public.org_members (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references public.organizations(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- Auto-add owner as member
create or replace function public.handle_new_org()
returns trigger as $$
begin
  insert into public.org_members (org_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_org_created
  after insert on public.organizations
  for each row execute function public.handle_new_org();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;

-- Profiles: users can read/update their own
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Organizations: members can read, owner can update
create policy "Members can view their organizations"
  on public.organizations for select
  using (
    id in (
      select org_id from public.org_members
      where user_id = auth.uid()
    )
  );

create policy "Owner can update organization"
  on public.organizations for update
  using (owner_id = auth.uid());

-- Org Members: members can see other members in same org
create policy "Members can view org members"
  on public.org_members for select
  using (
    org_id in (
      select org_id from public.org_members
      where user_id = auth.uid()
    )
  );

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();
