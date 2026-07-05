-- ============================================================
-- TUESDI v3.0 — Script de alineación de esquema
-- Ejecutar completo en Supabase → SQL Editor → New query → Run
-- Es seguro re-ejecutarlo (usa IF NOT EXISTS / DO $$ EXCEPTION)
--
-- v3.0.1 — 2026-06-16: Correcciones aplicadas
--   + ALTER COLUMN price ahora usa bloque seguro (columna puede no existir)
--   + Eliminadas ADD COLUMN redundantes (ya están en 001)
--   + Comentarios corregidos (frontend usa contact_requests, no inquiries)
-- ============================================================

-- 0. CRÍTICO: price como texto libre (formulario anónimo + Magic Link)
--    El formulario envía "15€" o "Entrada libre", por lo que debe ser TEXT.
--    Si la columna no existe, se crea. Si existe como NUMERIC, se convierte.
DO $$
BEGIN
    -- Crear la columna si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='events' AND column_name='price'
    ) THEN
        ALTER TABLE public.events ADD COLUMN price TEXT;
    -- Si ya existe como NUMERIC, convertirla a TEXT
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='events'
          AND column_name='price' AND data_type='numeric'
    ) THEN
        ALTER TABLE public.events ALTER COLUMN price TYPE TEXT USING price::TEXT;
    END IF;
END $$;

-- 1. events: columnas adicionales que pueden faltar en BD existentes
--    (en 001 ya están, pero este script es para alinear BDs antiguas)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES public.artists(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 0;

-- 2. artists: columnas adicionales del esquema extendido
--    (coexisten con las columnas principales del frontend)
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS reviews INTEGER DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS gallery_urls TEXT[];
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS spotify_url TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS price_from TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS followers INTEGER DEFAULT 0;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS events_count INTEGER DEFAULT 0;

-- 3. Tabla inquiries (coexistencia con contact_requests)
--    NOTA: El frontend actual usa contact_requests, no inquiries.
--    Se mantiene por compatibilidad con posibles componentes futuros.
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY;

-- 4. CRÍTICO: tabla magic_links — necesaria para create-magic-link /
--    confirm-event (flujo de confirmación de eventos por email).
CREATE TABLE IF NOT EXISTS public.magic_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    email TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_magic_links_token_hash ON public.magic_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_magic_links_event_id ON public.magic_links(event_id);

-- RLS activado y SIN policies: solo el service_role (Edge Functions)
-- puede leer/escribir. El cliente no necesita acceso directo.
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;