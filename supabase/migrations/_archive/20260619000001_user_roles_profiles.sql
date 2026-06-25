-- ============================================================
-- Migración: 20260619000001_user_roles_profiles.sql
-- Roles, profiles, enums y trigger handle_new_user.
--
-- HISTORIAL:
--   Originalmente creada como 20260524112351_editor_perfil.sql para
--   sincronizar con el estado remoto de Supabase. Renombrada el
--   2026-06-19 (v3.0.5) porque el timestamp 20260524112351 colisionaba
--   con una migración anterior ya registrada en schema_migrations,
--   causando el mismo error de versión duplicada que se corrigió en
--   la fase anterior.
--
-- Contenido: enums app_role / artist_category / artist_plan,
--   tablas user_roles y profiles, trigger handle_new_user.
-- NOTA: Las tablas principales de TUESDI v3.0 (artists, events, etc.)
--   están en 001_inicial_tuesdi.sql. Esta migración corresponde al
--   esquema de roles/profiles que coexiste en la BD.
--
-- v3.0.1 — 2026-06-16: Corrección crítica
--   + handle_new_user ahora también crea entrada en tabla artists.
--     Antes solo creaba en profiles/user_roles, causando
--     "Perfil no encontrado" en el Dashboard tras registro.
-- ============================================================

-- Roles enum
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'artist', 'organizer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tabla de roles por usuario
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función de verificación de rol
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Policy: cada usuario ve solo sus propios roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

-- Categorías artísticas
DO $$ BEGIN
    CREATE TYPE public.artist_category AS ENUM (
        'musica', 'teatro', 'magia', 'comedia', 'danza', 'dj', 'circo', 'arte', 'foto_video'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Plan enum
DO $$ BEGIN
    CREATE TYPE public.artist_plan AS ENUM ('spark', 'spotlight', 'headliner');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tabla profiles (esquema alternativo coexistente)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE,
    display_name TEXT NOT NULL,
    category public.artist_category,
    city TEXT,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    price_from NUMERIC(10,2),
    rating NUMERIC(2,1) DEFAULT 0,
    reviews_count INTEGER NOT NULL DEFAULT 0,
    plan public.artist_plan NOT NULL DEFAULT 'spark',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (is_published = true OR auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Función y trigger updated_at para profiles
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Función handle_new_user: crea perfil, rol Y entrada en artists
-- al registrarse un nuevo usuario.
--
-- CORRECCIÓN v3.0.1:
--   Antes solo creaba entrada en profiles y user_roles.
--   El frontend usa la tabla artists como fuente de datos
--   principal. Sin entrada en artists, el Dashboard mostraba
--   "Perfil no encontrado" tras el registro.
-- ============================================================
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

    -- Generar slug único
    v_slug := LOWER(REGEXP_REPLACE(v_name, '[^a-zA-Z0-9\s]', '', 'g'));
    v_slug := REGEXP_REPLACE(v_slug, '\s+', '-', 'g');
    v_slug := TRIM(BOTH '-' FROM v_slug);
    IF v_slug = '' THEN
        v_slug := 'artista-' || LEFT(NEW.id::TEXT, 8);
    END IF;

    -- Asegurar unicidad del slug
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
