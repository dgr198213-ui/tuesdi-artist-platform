-- ============================================================
-- Script de alineación de esquema: Tuesdi
-- Ejecutar completo en Supabase -> SQL Editor -> New query -> Run
-- Es seguro re-ejecutarlo (usa IF NOT EXISTS)
--
-- NOTA: price se mantiene NUMERIC (el formulario actual envía
-- parseFloat(formData.price), por lo que NUMERIC es correcto).
-- ============================================================

-- 1. events: columnas que el frontend lee/escribe y que pueden faltar
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS artist_id UUID REFERENCES public.artists(id);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS attendees INTEGER DEFAULT 0;

-- 2. artists: ampliar al esquema completo que usan
--    ExplorarArtistas / ArtistaProfile / Dashboard
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
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
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. CRÍTICO: crear tabla inquiries
--    Dashboard.tsx consulta esta tabla para "Consultas Recientes" y
--    la pestaña de Inquiries. Sin ella, esa parte del panel falla.
--    También es donde ArtistaProfile.tsx inserta los mensajes de
--    "Contactar" / "Solicitar Consulta".
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.artists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RLS deshabilitada en inquiries para que el formulario público
--    de contacto (usuario no autenticado) pueda insertar mensajes,
--    igual que en artists/events.
ALTER TABLE public.inquiries DISABLE ROW LEVEL SECURITY;
