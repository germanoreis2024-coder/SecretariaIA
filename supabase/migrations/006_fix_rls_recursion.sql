-- =============================================
-- AtendeIA - Fix RLS infinite recursion
--
-- As políticas de org_members/organizations se
-- consultavam recursivamente, fazendo QUALQUER
-- query de um usuário autenticado falhar com:
--   HTTP 500 "infinite recursion detected in
--   policy for relation org_members"
--
-- Isso deixava orgId sempre null no app ("Organização
-- ainda não carregada") e quebrava canais, agentes, etc.
--
-- Correção: get_user_org_id() como security definer
-- (a subquery interna ignora RLS, sem recursão) e
-- reescrita das políticas que consultavam org_members
-- diretamente.
-- =============================================

-- 1) get_user_org_id() como security definer
create or replace function public.get_user_org_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select org_id from public.org_members
  where user_id = auth.uid()
  limit 1;
$$;

-- 2) Org Members: ver membros apenas da própria org
drop policy if exists "Members can view org members" on public.org_members;
create policy "Members can view org members"
  on public.org_members for select
  using (org_id = public.get_user_org_id());

-- 3) Organizations: ver apenas a própria org
drop policy if exists "Members can view their organizations" on public.organizations;
create policy "Members can view their organizations"
  on public.organizations for select
  using (id = public.get_user_org_id());

-- 4) Organizations: update de billing apenas da própria org
drop policy if exists "Members can update organization billing" on public.organizations;
create policy "Members can update organization billing"
  on public.organizations for update
  using (id = public.get_user_org_id());
