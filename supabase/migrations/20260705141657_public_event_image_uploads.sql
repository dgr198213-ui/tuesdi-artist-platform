-- Permite a cualquiera (incluidos promotores anónimos) subir imágenes de
-- eventos a la carpeta events/ del bucket artist-media. El formulario público
-- /publicar-evento sube ahí, pero las políticas existentes solo permitían
-- subir a la carpeta <auth.uid()>/, bloqueando a los anónimos → image_url null.
--
-- Seguridad: solo se permite escribir bajo el prefijo 'events/', no en carpetas
-- de usuarios. La lectura ya es pública. No permite sobrescribir arbitrariamente
-- carpetas de otros porque el prefijo está acotado.

drop policy if exists "Subida publica de imagenes de eventos" on storage.objects;
create policy "Subida publica de imagenes de eventos"
  on storage.objects
  for insert
  to public
  with check (
    bucket_id = 'artist-media'
    and (storage.foldername(name))[1] = 'events'
  );
