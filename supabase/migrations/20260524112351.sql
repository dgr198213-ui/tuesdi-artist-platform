-- ============================================================
-- Migración: 20260524112351
-- Sincronización con estado remoto de Supabase.
-- Esta migración estaba registrada en supabase_migrations.schema_migrations
-- pero faltaba el archivo SQL en el repositorio.
--
-- Contenido: roles, profiles, enums, trigger handle_new_user.
-- NOTA: Las tablas principales de TUESDI v3.0 (artists, events, etc.)
-- están en 001_inicial_tuesdi.sql. Esta migración corresponde a un
-- esquema alternativo generado automáticamente por Supabase que coexiste
-- en la BD pero no es el utilizado por el frontend actual.
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
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
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Función handle_new_user: crea perfil y rol automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
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

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
