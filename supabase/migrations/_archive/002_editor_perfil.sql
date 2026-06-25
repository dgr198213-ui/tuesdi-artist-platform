-- ============================================================
-- TUESDI v3.0 — Migración 002
-- Editor de Perfil: bucket de Storage + políticas
-- Ejecutar en Supabase → SQL Editor → New query → Run
--
-- v3.0.1 — 2026-06-16: Correcciones aplicadas
--   + cover_image ya está en 001, se mantiene el ADD IF NOT EXISTS
--   + Añadida política para uploads anónimos en events/
--     (PublicarEvento.tsx sube imágenes sin autenticación)
-- ============================================================

-- 1. Columna de portada del perfil (ya en 001, pero por si se ejecuta 002 solo)
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. Bucket público para fotos de perfil / portada / eventos
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-media', 'artist-media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de acceso al bucket

-- 3a. Lectura pública (el bucket es público, cualquiera ve las imágenes)
DROP POLICY IF EXISTS "artist-media lectura publica" ON storage.objects;
CREATE POLICY "artist-media lectura publica"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'artist-media');

-- 3b. Usuarios autenticados: subir/editar/borrar dentro de su carpeta
--     artist-media/<user_id>/...
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

-- 3c. CRÍTICO: Política para uploads anónimos en la carpeta events/
--     PublicarEvento.tsx sube imágenes sin estar autenticado.
--     La ruta es: events/<timestamp>.<ext>
--     Se permite INSERT a cualquiera en la carpeta "events".
DROP POLICY IF EXISTS "artist-media eventos publicos" ON storage.objects;
CREATE POLICY "artist-media eventos publicos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'artist-media'
        AND (storage.foldername(name))[1] = 'events'
    );