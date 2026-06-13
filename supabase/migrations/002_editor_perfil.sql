-- ============================================================
-- TUESDI v3.0 — Migración 002
-- Editor de Perfil: imagen de portada + bucket de Storage
-- Ejecutar en Supabase -> SQL Editor -> New query -> Run
-- ============================================================

-- 1. Columna de portada del perfil (no estaba en 001)
ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- 2. Bucket público para fotos de perfil / portada
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-media', 'artist-media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de acceso al bucket
--    Lectura pública (el bucket es público, cualquiera ve las imágenes)
DROP POLICY IF EXISTS "artist-media lectura publica" ON storage.objects;
CREATE POLICY "artist-media lectura publica"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'artist-media');

--    Cada usuario autenticado solo puede subir/editar/borrar dentro de
--    su propia carpeta: artist-media/<user_id>/...
DROP POLICY IF EXISTS "artist-media subida propia" ON storage.objects;
CREATE POLICY "artist-media subida propia"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'artist-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "artist-media actualizacion propia" ON storage.objects;
CREATE POLICY "artist-media actualizacion propia"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'artist-media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "artist-media borrado propio" ON storage.objects;
CREATE POLICY "artist-media borrado propio"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'artist-media' AND (storage.foldername(name))[1] = auth.uid()::text);
