-- ============================================================
-- TUESDI v3.0 — Migración 003: Tabla magic_links
-- Necesaria para las Edge Functions create-magic-link y confirm-event.
-- Estas funciones usan service_role (bypass RLS), pero la tabla
-- debe existir en el esquema para que los inserts/queries funcionen.
--
-- v3.0.1 — 2026-06-16: Migración faltante agregada al repositorio.
--   Esta tabla fue creada manualmente en la BD pero no tenía archivo
--   de migración, causando errores al reprovisionar desde cero.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.magic_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    email TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS habilitado pero las Edge Functions usan service_role (bypass)
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

-- Índices para las búsquedas de las Edge Functions
CREATE INDEX IF NOT EXISTS idx_magic_links_token_hash ON public.magic_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_magic_links_event_id ON public.magic_links(event_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON public.magic_links(email);