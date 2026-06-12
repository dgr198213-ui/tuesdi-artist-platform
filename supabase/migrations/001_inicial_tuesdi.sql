-- ============================================
-- TUESDI - Tu Escenario Digital v3.0
-- Esquema de Base de Datos Supabase
-- Fecha: Junio 2026
-- Autor: Daniel García
-- ============================================

-- Extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: artists
-- Perfiles públicos de artistas
-- ============================================
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
    subscription_plan TEXT DEFAULT 'beta' CHECK (subscription_plan IN ('beta', 'standard', 'pro')),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas
CREATE INDEX idx_artists_slug ON public.artists(slug);
CREATE INDEX idx_artists_category ON public.artists(category);
CREATE INDEX idx_artists_city ON public.artists(city);
CREATE INDEX idx_artists_subscription_plan ON public.artists(subscription_plan);

-- ============================================
-- TABLA: contact_requests
-- Solicitudes de contacto de visitantes a artistas
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas frecuentes
CREATE INDEX idx_contact_requests_artist_id ON public.contact_requests(artist_id);
CREATE INDEX idx_contact_requests_status ON public.contact_requests(status);

-- ============================================
-- TABLA: metrics
-- Métricas de rendimiento de artistas
-- ============================================
CREATE TABLE IF NOT EXISTS public.metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    profile_views INTEGER DEFAULT 0,
    search_impressions INTEGER DEFAULT 0,
    contact_clicks INTEGER DEFAULT 0,
    contacts_received INTEGER DEFAULT 0,
    recorded_at DATE DEFAULT CURRENT_DATE
);

-- Índice para análisis temporal
CREATE INDEX idx_metrics_artist_id ON public.metrics(artist_id);
CREATE INDEX idx_metrics_recorded_at ON public.metrics(recorded_at);

-- ============================================
-- TABLA: subscriptions
-- Suscripciones de artistas (gestión Stripe)
-- ============================================
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

-- Índice para consultas de estado
CREATE INDEX idx_subscriptions_artist_id ON public.subscriptions(artist_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ============================================
-- TABLA: media
-- Multimedia de artistas (fotos y vídeos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
    url TEXT NOT NULL,
    thumbnail TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para ordenamiento
CREATE INDEX idx_media_artist_id ON public.media(artist_id);
CREATE INDEX idx_media_type ON public.media(type);

-- ============================================
-- TABLA: events
-- Eventos culturales y artísticos
-- ============================================
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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas frecuentes
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_city ON public.events(city);
CREATE INDEX idx_events_category ON public.events(category);

-- ============================================
-- FUNCIÓN: Actualizar timestamp updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para artists
CREATE TRIGGER update_artists_updated_at
    BEFORE UPDATE ON public.artists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para subscriptions
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCIÓN: Generar slug desde artist_name
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_artist_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Convertir a minúsculas y reemplazar caracteres especiales
    base_slug := LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'));
    base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
    base_slug := TRIM(BOTH '-' FROM base_slug);

    final_slug := base_slug;

    -- Verificar si el slug ya existe
    WHILE EXISTS (SELECT 1 FROM public.artists WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Caducar eventos automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION public.expire_old_events()
RETURNS void AS $$
BEGIN
    UPDATE public.events
    SET status = 'expired'
    WHERE status = 'approved'
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SEGURIDAD RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Políticas para artists
CREATE POLICY "Artistas públicos son visibles para todos"
    ON public.artists FOR SELECT
    USING (true);

CREATE POLICY "Artistas pueden ver su propio perfil"
    ON public.artists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Artistas pueden actualizar su perfil"
    ON public.artists FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Usuarios autenticados pueden crear artistas"
    ON public.artists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Políticas para contact_requests
CREATE POLICY "Artistas pueden ver sus solicitudes"
    ON public.contact_requests FOR SELECT
    USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
    );

CREATE POLICY "Cualquiera puede enviar solicitudes"
    ON public.contact_requests FOR INSERT
    WITH CHECK (true);

-- Políticas para metrics
CREATE POLICY "Artistas pueden ver sus métricas"
    ON public.metrics FOR SELECT
    USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
    );

CREATE POLICY "Solo el sistema puede insertar métricas"
    ON public.metrics FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Solo el sistema puede actualizar métricas"
    ON public.metrics FOR UPDATE
    USING (true);

-- Políticas para subscriptions
CREATE POLICY "Artistas pueden ver su suscripción"
    ON public.subscriptions FOR SELECT
    USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
    );

-- Políticas para media
CREATE POLICY "Media de artistas es pública"
    ON public.media FOR SELECT
    USING (true);

CREATE POLICY "Artistas pueden gestionar su media"
    ON public.media FOR ALL
    USING (
        artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
    );

-- Políticas para events
CREATE POLICY "Eventos aprobados son públicos"
    ON public.events FOR SELECT
    USING (status = 'approved' OR status = 'pending');

CREATE POLICY "Cualquiera puede crear eventos"
    ON public.events FOR INSERT
    WITH CHECK (true);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de artistas con métricas resumidas
CREATE OR REPLACE VIEW public.artists_with_metrics AS
SELECT
    a.*,
    COALESCE(SUM(m.profile_views), 0) as total_views,
    COALESCE(SUM(m.contacts_received), 0) as total_contacts
FROM public.artists a
LEFT JOIN public.metrics m ON a.id = m.artist_id
GROUP BY a.id;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE public.artists IS 'Perfiles públicos de artistas en TUESDI';
COMMENT ON TABLE public.contact_requests IS 'Solicitudes de contacto de visitantes';
COMMENT ON TABLE public.metrics IS 'Métricas de rendimiento de artistas';
COMMENT ON TABLE public.subscriptions IS 'Suscripciones gestionadas con Stripe';
COMMENT ON TABLE public.media IS 'Contenido multimedia de artistas (fotos y vídeos)';
COMMENT ON TABLE public.events IS 'Eventos culturales y artísticos';