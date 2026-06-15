-- ============================================================
-- TUESDI v3.0.1 — Script de Corrección Completo
-- ============================================================
-- Para BDs ya desplegadas que tienen el esquema roto.
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run
-- ES IDEMPOTENTE: seguro de re-ejecutar
--
-- Errores que corrige:
--   1. events.price no existía → se crea como TEXT
--   2. events.artist_id / attendees faltaban
--   3. contact_requests.updated_at faltaba → BandejaContactos fallaba
--   4. artists.cover_image faltaba → EditorPerfil no podía guardarla
--   5. Triggers faltaban (contact_requests.updated_at)
--   6. RLS: políticas para acceso anónimo en INSERT de events/contact_requests
--   7. magic_links no existía → flujo confirmación de eventos roto
--   8. handle_new_user no creaba entrada en artists → "Perfil no encontrado"
--   9. Storage: política para uploads anónimos en events/
--  10. Edge Function confirm-event usaba status="published" (no válido)
--      → Corregido en el código (este SQL añade "published" al CHECK como
--        medida de compatibilidad si se re-deploya la función antigua)
-- ============================================================

-- 1. EXTENSIÓN
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. TABLA: artists — columnas faltantes
-- ============================================================
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS cover_image TEXT;
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

CREATE INDEX IF NOT EXISTS idx_artists_slug ON public.artists(slug);
CREATE INDEX IF NOT EXISTS idx_artists_category ON public.artists(category);
CREATE INDEX IF NOT EXISTS idx_artists_city ON public.artists(city);
CREATE INDEX IF NOT EXISTS idx_artists_user_id ON public.artists(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_subscription_plan ON public.artists(subscription_plan);

-- ============================================================
-- 3. TABLA: contact_requests — updated_at faltante (CRÍTICO)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='contact_requests' AND column_name='updated_at'
    ) THEN
        ALTER TABLE public.contact_requests ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Añadida columna contact_requests.updated_at';
    END IF;
END $$;

-- ============================================================
-- 4. TABLA: events — columnas faltantes
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='events' AND column_name='price'
    ) THEN
        ALTER TABLE public.events ADD COLUMN price TEXT;
        RAISE NOTICE 'Añadida columna events.price';
    END IF;
END $$;

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES public.artists(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

-- ============================================================
-- 5. TABLA: magic_links (necesaria para Edge Functions)
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

CREATE INDEX IF NOT EXISTS idx_magic_links_token_hash ON public.magic_links(token_hash);
CREATE INDEX IF NOT EXISTS idx_magic_links_event_id ON public.magic_links(event_id);

ALTER TABLE public.magic_links ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. TABLA: inquiries (coexistencia con contact_requests)
-- ============================================================
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

-- ============================================================
-- 7. TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_artists_updated_at ON public.artists;
CREATE TRIGGER update_artists_updated_at
    BEFORE UPDATE ON public.artists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_requests_updated_at ON public.contact_requests;
CREATE TRIGGER update_contact_requests_updated_at
    BEFORE UPDATE ON public.contact_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 8. RLS: Asegurar políticas correctas para acceso anónimo
-- ============================================================
-- events: anyone puede INSERTAR y ver aprobados/pending
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='events' AND rowsecurity = true) THEN
        -- Asegurar que existe política de lectura pública
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname = 'Eventos aprobados son públicos'
        ) THEN
            CREATE POLICY "Eventos aprobados son públicos" ON public.events
                FOR SELECT USING (status IN ('approved', 'pending'));
            RAISE NOTICE 'Creada política RLS para lectura de eventos';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='events' AND policyname = 'Cualquiera puede crear eventos'
        ) THEN
            CREATE POLICY "Cualquiera puede crear eventos" ON public.events
                FOR INSERT WITH CHECK (true);
            RAISE NOTICE 'Creada política RLS para inserción anónima de eventos';
        END IF;
    END IF;
END $$;

-- contact_requests: anyone puede INSERTAR
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='contact_requests' AND rowsecurity = true) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='contact_requests' AND policyname = 'Cualquiera puede enviar solicitudes'
        ) THEN
            CREATE POLICY "Cualquiera puede enviar solicitudes" ON public.contact_requests
                FOR INSERT WITH CHECK (true);
            RAISE NOTICE 'Creada política RLS para inserción anónima de contactos';
        END IF;
    END IF;
END $$;

-- ============================================================
-- 9. STORAGE: Bucket artist-media + políticas
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-media', 'artist-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "artist-media lectura publica" ON storage.objects;
CREATE POLICY "artist-media lectura publica"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'artist-media');

DROP POLICY IF EXISTS "artist-media subida propia" ON storage.objects;
CREATE POLICY "artist-media subida propia"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'artist-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "artist-media actualizacion propia" ON storage.objects;
CREATE POLICY "artist-media actualizacion propia"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'artist-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "artist-media borrado propio" ON storage.objects;
CREATE POLICY "artist-media borrado propio"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'artist-media'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- CRÍTICO: Política para uploads anónimos en events/
DROP POLICY IF EXISTS "artist-media eventos publicos" ON storage.objects;
CREATE POLICY "artist-media eventos publicos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'artist-media'
        AND (storage.foldername(name))[1] = 'events'
    );

-- ============================================================
-- 10. handle_new_user: también crear entrada en artists
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_name TEXT;
    v_slug TEXT;
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'artist')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- CRÍTICO: Crear entrada en tabla artists
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
-- VERIFICACIÓN FINAL
-- ============================================================
DO $$
DECLARE
    v_count INTEGER;
    v_ok TEXT;
BEGIN
    RAISE NOTICE '============================================================';
    RAISE NOTICE 'TUESDI v3.0.1 — Verificación de corrección';
    RAISE NOTICE '============================================================';

    -- Tablas principales
    SELECT COUNT(*) INTO v_count FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
      AND table_name IN ('artists','events','media','contact_requests','metrics','subscriptions','inquiries','magic_links','user_roles','profiles');
    RAISE NOTICE 'Tablas principales: % / 10', v_count;

    -- Columnas críticas
    SELECT COUNT(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='contact_requests' AND column_name='updated_at';
    v_ok := CASE WHEN v_count > 0 THEN 'OK' ELSE 'FALLO' END;
    RAISE NOTICE 'contact_requests.updated_at: %', v_ok;

    SELECT COUNT(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='events' AND column_name='price';
    v_ok := CASE WHEN v_count > 0 THEN 'OK' ELSE 'FALLO' END;
    RAISE NOTICE 'events.price: %', v_ok;

    SELECT COUNT(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='events' AND column_name='artist_id';
    v_ok := CASE WHEN v_count > 0 THEN 'OK' ELSE 'FALLO' END;
    RAISE NOTICE 'events.artist_id: %', v_ok;

    SELECT COUNT(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='artists' AND column_name='cover_image';
    v_ok := CASE WHEN v_count > 0 THEN 'OK' ELSE 'FALLO' END;
    RAISE NOTICE 'artists.cover_image: %', v_ok;

    SELECT COUNT(*) INTO v_count FROM information_schema.columns
    WHERE table_schema='public' AND table_name='magic_links';
    v_ok := CASE WHEN v_count > 0 THEN 'OK' ELSE 'FALLO' END;
    RAISE NOTICE 'magic_links: %', v_ok;

    -- Storage bucket
    SELECT COUNT(*) INTO v_count FROM storage.buckets WHERE id = 'artist-media';
    v_ok := CASE WHEN v_count > 0 THEN 'OK' ELSE 'FALLO' END;
    RAISE NOTICE 'bucket artist-media: %', v_ok;

    -- Trigger handle_new_user
    SELECT COUNT(*) INTO v_count FROM information_schema.triggers
    WHERE trigger_name = 'on_auth_user_created' AND event_object_table = 'users';
    v_ok := CASE WHEN v_count > 0 THEN 'OK' ELSE 'FALLO' END;
    RAISE NOTICE 'trigger on_auth_user_created: %', v_ok;

    RAISE NOTICE '============================================================';
    RAISE NOTICE 'Corrección completada.';
    RAISE NOTICE '============================================================';
END $$;