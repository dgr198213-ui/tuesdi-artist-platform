-- El bucket artist-media aceptaba cualquier tipo de archivo (allowed_mime_types
-- era NULL): un usuario con sesión podía subir .exe/.zip vía API directa,
-- saltándose la validación del cliente y consumiendo storage. El límite de
-- 100 MB sí existía; ahora también se restringen los formatos a los mismos
-- que valida el frontend (fotos JPG/PNG/WebP, vídeos MP4/WebM/MOV).
update storage.buckets
set allowed_mime_types = array[
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime'
]
where id = 'artist-media';
