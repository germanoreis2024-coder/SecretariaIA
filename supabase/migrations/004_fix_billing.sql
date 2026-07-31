-- =============================================
-- AtendeIA - Fix Billing Columns
-- Adiciona stripe_customer_id (faltava na 003)
-- =============================================

alter table public.organizations
  add column if not exists stripe_customer_id text;
