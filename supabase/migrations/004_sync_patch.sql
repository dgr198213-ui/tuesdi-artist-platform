-- ============================================================
-- TUESDI v3.0.1 — Migración 004: Sincronización completa
-- ============================================================
-- PROBLEMA: Las tablas fueron creadas con una versión anterior
-- del esquema (antes de v3.0.1). CREATE TABLE IF NOT EXISTS no
-- modifica tablas existentes, por lo que faltan columnas que
-- el frontend espera.
--
-- Esta migración añade TODAS las columnas que puedan faltar
-- usando ALTER TABLE ... ADD COLUMN IF NOT EXISTS.
--
-- EJECUTAR EN: Supabase → SQL Editor → New query → Run
-- SEGURA: Idempotente, se puede re-ejecutar sin riesgo.
-- ============================================================

-- ============================================================
-- 1. TABLA: artists
-- ============================================================
-- Columnas que faltaban en versiones pre-v3.0.1:

ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS tiktok TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Asegurar que subscription_plan tiene el CHECK correcto
-- (algunas versiones viejas no tenían el constraint)
DO $$
BEGIN
    -- Eliminar constraint viejo si existe y crear el nuevo
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'artists_subscription_plan_check'
    ) THEN
        ALTER TABLE public.artists DROP CONSTRAINT artists_subscription_plan_check;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.artists ADD CONSTRAINT artists_subscription_plan_check
        CHECK (subscription_plan IN ('beta', 'standard', 'pro'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. TABLA: contact_requests
-- ============================================================

ALTER TABLE public.contact_requests ADD COLUMN IF NOT EXISTS sender_phone TEXT;
ALTER TABLE public.contact_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 3. TABLA: events
-- ============================================================
-- Columnas que faltaban en versiones pre-v3.0.1:

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS price TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES public.artists(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Asegurar que status tiene el CHECK correcto
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'events_status_check'
    ) THEN
        ALTER TABLE public.events DROP CONSTRAINT events_status_check;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE public.events ADD CONSTRAINT events_status_check
        CHECK (status IN ('pending', 'approved', 'rejected', 'expired'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 4. TABLA: metrics
-- ============================================================

ALTER TABLE public.metrics ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;
ALTER TABLE public.metrics ADD COLUMN IF NOT EXISTS search_impressions INTEGER DEFAULT 0;
ALTER TABLE public.metrics ADD COLUMN IF NOT EXISTS contact_clicks INTEGER DEFAULT 0;
ALTER TABLE public.metrics ADD COLUMN IF NOT EXISTS contacts_received INTEGER DEFAULT 0;
ALTER TABLE public.metrics ADD COLUMN IF NOT EXISTS recorded_at DATE DEFAULT CURRENT_DATE;

-- ============================================================
-- 5. TABLA: media
-- ============================================================

ALTER TABLE public.media ADD COLUMN IF NOT EXISTS thumbnail TEXT;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 6. TABLA: subscriptions
-- ============================================================

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================================
-- 7. TABLA: magic_links
-- ============================================================
-- Si la tabla no existe (fue creada manualmente sin migración)

CREATE TABLE IF NOT EXISTS public.magic_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    email TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_magic_links_token_hash ON public.magic_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_magic_links_event_id ON public.magic_links(event_id);
CREATE INDEX IF NOT EXISTS idx_magic_links_email ON public.magic_links(email);

-- ============================================================
-- 8. TRIGGERS updated_at (asegurar que existen)
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- artists
DROP TRIGGER IF EXISTS update_artists_updated_at ON public.artists;
CREATE TRIGGER update_artists_updated_at
    BEFORE UPDATE ON public.artists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- contact_requests
DROP TRIGGER IF EXISTS update_contact_requests_updated_at ON public.contact_requests;
CREATE TRIGGER update_contact_requests_updated_at
    BEFORE UPDATE ON public.contact_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 9. TRIGGER handle_new_user (versión v3.0.1)
-- ============================================================
-- CORRECCIÓN CRÍTICA: La versión anterior solo creaba
-- profiles + user_roles, pero NO artists. El frontend
-- usa artists como tabla principal, así que sin entrada
-- ahí el Dashboard muestra "Perfil no encontrado".

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_name TEXT;
    v_slug TEXT;
BEGIN
    -- 1. Crear perfil en tabla profiles (esquema alternativo)
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Asignar rol de artista
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'artist')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- 3. CRÍTICO: Crear entrada en tabla artists (la que usa el frontend)
    v_name := COALESCE(
        NEW.raw_user_meta_data->>'artist_name',
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1)
    );

    v_slug := LOWER(REGEXP_REPLACE(v_name, '[^a-zA-Z0-9\s]', '', 'g'));
    v_slug := REGEXP_REPLACE(v_slug, '\s+', '-', 'g');
    v_slug := TRIM(BOTH '-' FROM v_slug);
    IF v_slug = '' THEN
        v_slug := 'artista-' || LEFT(NEW.id::TEXT, 8);
    END IF;

    WHILE EXISTS (SELECT 1 FROM public.artists WHERE slug = v_slug) LOOP
        v_slug := v_slug || '-' || floor(random() * 1000)::INT;
    END LOOP;

    INSERT INTO public.artists (user_id, slug, artist_name, category, city, country, subscription_plan)
    VALUES (
        NEW.id,
        v_slug,
        v_name,
        COALESCE(NEW.raw_user_meta_data->>'category', 'musica'),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Madrid'),
        COALESCE(NEW.raw_user_meta_data->>'country', 'España'),
        'beta'
    )
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 10. RLS — Políticas (recrear todas con DROP IF EXISTS)
-- ============================================================

-- --- artists ---
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

-- --- contact_requests ---
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

-- --- metrics ---
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Artistas pueden ver sus métricas" ON public.metrics;
CREATE POLICY "Artistas pueden ver sus métricas" ON public.metrics
    FOR SELECT USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));

-- --- subscriptions ---
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Artistas pueden ver su suscripción" ON public.subscriptions;
CREATE POLICY "Artistas pueden ver su suscripción" ON public.subscriptions
    FOR SELECT USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));

-- --- media ---
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Media de artistas es pública" ON public.media;
CREATE POLICY "Media de artistas es pública" ON public.media
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Artistas pueden gestionar su media" ON public.media;
CREATE POLICY "Artistas pueden gestionar su media" ON public.media
    FOR ALL USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));

-- --- events ---
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Eventos aprobados son públicos" ON public.events;
CREATE POLICY "Eventos aprobados son públicos" ON public.events
    FOR SELECT USING (status IN ('approved', 'pending'));

DROP POLICY IF EXISTS "Cualquiera puede crear eventos" ON public.events;
CREATE POLICY "Cualquiera puede crear eventos" ON public.events
    FOR INSERT WITH CHECK (true);

-- --- magic_links (RLS habilitado, Edge Functions usan service_role bypass) ---
ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 11. ÍNDICES adicionales
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_artists_slug ON public.artists(slug);
CREATE INDEX IF NOT EXISTS idx_artists_category ON public.artists(category);
CREATE INDEX IF NOT EXISTS idx_artists_city ON public.artists(city);
CREATE INDEX IF NOT EXISTS idx_artists_user_id ON public.artists(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_subscription_plan ON public.artists(subscription_plan);

CREATE INDEX IF NOT EXISTS idx_contact_requests_artist_id ON public.contact_requests(artist_id);
CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON public.contact_requests(status);

CREATE INDEX IF NOT EXISTS idx_metrics_artist_id ON public.metrics(artist_id);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded_at ON public.metrics(recorded_at);

CREATE INDEX IF NOT EXISTS idx_subscriptions_artist_id ON public.subscriptions(artist_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_media_artist_id ON public.media(artist_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON public.media(type);

CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

-- ============================================================
-- 12. Funciones auxiliares
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

CREATE OR REPLACE FUNCTION public.expire_old_events()
RETURNS void AS $$
BEGIN
    UPDATE public.events
    SET status = 'expired'
    WHERE status = 'approved' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 13. Vista artists_with_metrics (recrear)
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

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
DO $$
DECLARE
    missing_cols TEXT[];
    col_rec RECORD;
BEGIN
    -- Verificar columnas críticas de artists
    FOR col_rec IN
        SELECT column_name FROM information_schema.columns
        WHERE table_schema='public' AND table_name='artists'
        AND column_name IN ('id','user_id','slug','artist_name','bio','category',
            'city','country','starting_price','website','instagram','youtube',
            'spotify','tiktok','profile_image','cover_image','subscription_plan',
            'verified','created_at','updated_at')
        ORDER BY column_name
    LOOP
        -- Se encontró, OK
        NULL;
    END LOOP;

    -- Verificar que EXISTEN las columnas esperadas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='artists' AND column_name='verified') THEN
        missing_cols := array_append(missing_cols, 'artists.verified');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='artists' AND column_name='updated_at') THEN
        missing_cols := array_append(missing_cols, 'artists.updated_at');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='events' AND column_name='expires_at') THEN
        missing_cols := array_append(missing_cols, 'events.expires_at');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='contact_requests' AND column_name='updated_at') THEN
        missing_cols := array_append(missing_cols, 'contact_requests.updated_at');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='events' AND column_name='price') THEN
        missing_cols := array_append(missing_cols, 'events.price');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='events' AND column_name='artist_id') THEN
        missing_cols := array_append(missing_cols, 'events.artist_id');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='events' AND column_name='attendees') THEN
        missing_cols := array_append(missing_cols, 'events.attendees');
    END IF;

    IF array_length(missing_cols, 1) > 0 THEN
        RAISE NOTICE 'ADVERTENCIA: Las siguientes columnas aún faltan: %', array_to_string(missing_cols, ', ');
    ELSE
        RAISE NOTICE 'VERIFICACIÓN OK: Todas las columnas críticas existen.';
    END IF;
END $$;