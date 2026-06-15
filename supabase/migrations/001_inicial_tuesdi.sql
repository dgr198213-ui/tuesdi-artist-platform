-- ============================================================
-- TUESDI v3.0 — Migración 001: Esquema Principal
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- Idempotente: seguro de re-ejecutar
--
-- v3.0.1 — 2026-06-16: Correcciones aplicadas
--   + Añadido updated_at a contact_requests (BandejaContactos fallaba)
--   + Añadido price, artist_id, attendees a events
--   + Añadido cover_image a artists (antes en 002)
--   + Índices con IF NOT EXISTS
--   + Triggers con DROP IF EXISTS
--   + Políticas RLS con DROP IF EXISTS + acceso anónimo
-- ============================================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: artists
-- ============================================================
CREATE TABLE IF NOT EXISTS public.artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    artist_name TEXT NOT NULL,
    bio TEXT,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'España',
    starting_price TEXT,
    website TEXT,
    instagram TEXT,
    youtube TEXT,
    spotify TEXT,
    tiktok TEXT,
    profile_image TEXT,
    cover_image TEXT,
    subscription_plan TEXT DEFAULT 'beta' CHECK (subscription_plan IN ('beta', 'standard', 'pro')),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artists_slug ON public.artists(slug);
CREATE INDEX IF NOT EXISTS idx_artists_category ON public.artists(category);
CREATE INDEX IF NOT EXISTS idx_artists_city ON public.artists(city);
CREATE INDEX IF NOT EXISTS idx_artists_user_id ON public.artists(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_subscription_plan ON public.artists(subscription_plan);

-- ============================================================
-- TABLA: contact_requests
-- IMPORTANTE: updated_at es necesaria para BandejaContactos.tsx
--   que hace .update({ status, updated_at: new Date().toISOString() })
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Añadir updated_at si la tabla ya existía sin ella (migración previa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='contact_requests' AND column_name='updated_at'
    ) THEN
        ALTER TABLE public.contact_requests ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contact_requests_artist_id ON public.contact_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON public.contact_requests(status);

-- ============================================================
-- TABLA: metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS public.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    profile_views INTEGER DEFAULT 0,
    search_impressions INTEGER DEFAULT 0,
    contact_clicks INTEGER DEFAULT 0,
    contacts_received INTEGER DEFAULT 0,
    recorded_at DATE DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_metrics_artist_id ON public.metrics(artist_id);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON public.metrics(recorded_at);

-- ============================================================
-- TABLA: subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT DEFAULT 'beta' CHECK (plan IN ('beta', 'standard', 'pro')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'paused')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_artist_id ON public.subscriptions(artist_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- ============================================================
-- TABLA: media
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
    url TEXT NOT NULL,
    thumbnail TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_artist_id ON public.media(artist_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);

-- ============================================================
-- TABLA: events
-- v3.0.1: Añadidos price, artist_id, attendees
--   - price: TEXT para "15€", "Entrada libre", etc.
--   - artist_id: relación opcional (eventos anónimos no tienen)
--   - attendees: contador futuro
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT DEFAULT 'España',
    event_date DATE NOT NULL,
    event_time TEXT,
    image_url TEXT,
    organizer_name TEXT,
    organizer_email TEXT NOT NULL,
    price TEXT,
    artist_id UUID REFERENCES public.artists(id),
    attendees INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Añadir columnas si la tabla ya existía sin ellas
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES public.artists(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: artists.updated_at
DROP TRIGGER IF EXISTS update_artists_updated_at ON public.artists;
CREATE TRIGGER update_artists_updated_at
    BEFORE UPDATE ON public.artists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: subscriptions.updated_at
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: contact_requests.updated_at
DROP TRIGGER IF EXISTS update_contact_requests_updated_at ON public.contact_requests;
CREATE TRIGGER update_contact_requests_updated_at
    BEFORE UPDATE ON public.contact_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- FUNCIÓN: generate_artist_slug
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_artist_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    base_slug := LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);
    final_slug := base_slug;

    WHILE EXISTS (SELECT 1 FROM public.artists WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCIÓN: expire_old_events
-- ============================================================
CREATE OR REPLACE FUNCTION public.expire_old_events()
RETURNS void AS $$
BEGIN
    UPDATE public.events
    SET status = 'expired'
    WHERE status = 'approved' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SEGURIDAD RLS
-- ============================================================
-- Las tablas principales se gestionan con RLS ACTIVADO + políticas
-- que permiten acceso anónimo de lectura e inserción donde needed.
-- Esto es más seguro que DISABLE ROW LEVEL SECURITY.

-- Tabla: artists
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artistas públicos son visibles para todos" ON public.artists;
CREATE POLICY "Artistas públicos son visibles para todos" ON public.artists
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Artistas pueden actualizar su perfil" ON public.artists;
CREATE POLICY "Artistas pueden actualizar su perfil" ON public.artists
    FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear artistas" ON public.artists;
CREATE POLICY "Usuarios autenticados pueden crear artistas" ON public.artists
    FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Artistas pueden borrar su perfil" ON public.artists;
CREATE POLICY "Artistas pueden borrar su perfil" ON public.artists
    FOR DELETE USING (auth.uid() = user_id);

-- Tabla: contact_requests
-- CRÍTICO: anyone (anónimo) debe poder INSERTAR (formulario de contacto)
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artistas pueden ver sus solicitudes" ON public.contact_requests;
CREATE POLICY "Artistas pueden ver sus solicitudes" ON public.contact_requests
    FOR SELECT USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));
DROP POLICY IF EXISTS "Cualquiera puede enviar solicitudes" ON public.contact_requests;
CREATE POLICY "Cualquiera puede enviar solicitudes" ON public.contact_requests
    FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Artistas pueden actualizar sus solicitudes" ON public.contact_requests;
CREATE POLICY "Artistas pueden actualizar sus solicitudes" ON public.contact_requests
    FOR UPDATE USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));

-- Tabla: metrics
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artistas pueden ver sus métricas" ON public.metrics;
CREATE POLICY "Artistas pueden ver sus métricas" ON public.metrics
    FOR SELECT USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));

-- Tabla: subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artistas pueden ver su suscripción" ON public.subscriptions;
CREATE POLICY "Artistas pueden ver su suscripción" ON public.subscriptions
    FOR SELECT USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));

-- Tabla: media (lectura pública, escritura solo propia)
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Media de artistas es pública" ON public.media;
CREATE POLICY "Media de artistas es pública" ON public.media
    FOR SELECT USING (true);
DROP POLICY IF EXISTS "Artistas pueden gestionar su media" ON public.media;
CREATE POLICY "Artistas pueden gestionar su media" ON public.media
    FOR ALL USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));

-- Tabla: events (lectura de aprobados/pending, inserción anónima)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eventos aprobados son públicos" ON public.events;
CREATE POLICY "Eventos aprobados son públicos" ON public.events
    FOR SELECT USING (status IN ('approved', 'pending'));
DROP POLICY IF EXISTS "Cualquiera puede crear eventos" ON public.events;
CREATE POLICY "Cualquiera puede crear eventos" ON public.events
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- VISTA: artists_with_metrics
-- ============================================================
CREATE OR REPLACE VIEW public.artists_with_metrics
WITH (security_invoker = true)
AS
SELECT
    a.id, a.user_id, a.slug, a.artist_name, a.bio, a.category, a.city, a.country,
    a.starting_price, a.website, a.instagram, a.youtube, a.spotify, a.tiktok,
    a.profile_image, a.cover_image, a.subscription_plan, a.verified, a.created_at, a.updated_at,
    COALESCE(SUM(m.profile_views), 0) as total_views,
    COALESCE(SUM(m.contacts_received), 0) as total_contacts
FROM public.artists a
LEFT JOIN public.metrics m ON a.id = m.artist_id
GROUP BY a.id;