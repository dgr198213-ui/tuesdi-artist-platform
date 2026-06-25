-- =============================================================================
-- BASELINE MIGRATION — Estado real verificado de la BD (25 jun 2026)
-- =============================================================================
-- Esta migración NO ejecuta nada que no sea idempotente (IF NOT EXISTS).
-- Documenta el estado actual de la BD que fue construido progresivamente
-- a través de SQL directo y migraciones con nombres UUID en Supabase.
--
-- Las migraciones originales del repo (001_inicial_tuesdi.sql ... etc.)
-- no coincidían con las aplicadas en Supabase y han sido archivadas en
-- supabase/migrations/_archive/. Esta es la nueva fuente de verdad.
--
-- Para inspeccionar el esquema completo usar:
--   supabase db dump --linked > schema.sql
-- =============================================================================

-- Enums
do $$ begin
  create type artist_category as enum ('musica','teatro','magia','comedia','danza','dj','circo','arte','foto_video','otro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type artist_plan as enum ('beta','standard','pro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type app_role as enum ('admin','artist','organizer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type media_type_enum as enum ('photo','video');
exception when duplicate_object then null; end $$;

-- Función de admin
create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- Tabla admin_users (creada 23 jun 2026)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role    text not null default 'admin' check (role in ('owner','admin')),
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
create policy if not exists "Solo admins pueden verse"
  on public.admin_users for select using (auth.uid() = user_id);

-- Nota: el resto de tablas (artists, events, magic_links, media, metrics,
-- profiles, user_roles, contact_requests, inquiries, subscriptions,
-- stripe_events, stripe_payments, stripe_invoices, favorites, messages,
-- retention_config) existen y están correctas en la BD.
-- No se redefinen aquí para evitar conflictos con lo ya aplicado.
-- Usar supabase db diff --linked para detectar desviaciones futuras.
