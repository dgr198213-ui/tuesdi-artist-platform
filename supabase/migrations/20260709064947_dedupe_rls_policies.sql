-- Las políticas RLS permisivas se combinan con OR: tener duplicados exactos no
-- cambia el resultado, pero obliga a Postgres a evaluarlos todos en cada fila y
-- confunde cualquier auditoría. Se elimina un ejemplar de cada par redundante,
-- conservando siempre el equivalente. No se amplía ningún acceso.

-- artists: dos SELECT públicos idénticos (qual = true) -> conservar "Lectura pública de artistas"
drop policy if exists "Artistas públicos son visibles para todos" on public.artists;
-- "Admins gestionan todos los artistas" es ALL; el SELECT dedicado es redundante
drop policy if exists "Admins ven todos los artistas" on public.artists;
-- "Artistas gestionan su perfil" es ALL sobre (auth.uid() = user_id); UPDATE/DELETE dedicados son redundantes
drop policy if exists "Artistas pueden actualizar su perfil" on public.artists;
drop policy if exists "Artistas pueden borrar su perfil" on public.artists;

-- events: "Admins gestionan todos los eventos" es ALL; el SELECT dedicado es redundante
drop policy if exists "Admins ven todos los eventos" on public.events;
-- "Artistas gestionan sus eventos" es ALL; el SELECT dedicado es redundante
drop policy if exists "Artistas pueden ver sus eventos" on public.events;

-- media: SELECT público duplicado -> conservar "Lectura pública de media"
drop policy if exists "Media de artistas es pública" on public.media;
-- ALL sobre media propia duplicado -> conservar "Artistas gestionan su media"
drop policy if exists "Artistas pueden gestionar su media" on public.media;

-- contact_requests: tres INSERT públicos idénticos -> conservar "Envío público de solicitudes de contacto"
drop policy if exists "Cualquiera puede enviar contactos" on public.contact_requests;
drop policy if exists "Cualquiera puede enviar solicitudes" on public.contact_requests;
-- tres SELECT equivalentes (artista dueño) -> conservar "Artistas leen sus mensajes"
drop policy if exists "Artistas gestionan sus contactos" on public.contact_requests;
drop policy if exists "Artistas pueden ver sus solicitudes" on public.contact_requests;
-- tres UPDATE equivalentes -> conservar "Artistas actualizan sus mensajes"
drop policy if exists "Artistas actualizan sus contactos" on public.contact_requests;
drop policy if exists "Artistas pueden actualizar sus solicitudes" on public.contact_requests;

-- metrics: dos SELECT equivalentes -> conservar "Lectura de métricas propias"
drop policy if exists "Artistas pueden ver sus métricas" on public.metrics;

-- subscriptions: dos SELECT equivalentes -> conservar "Lectura de suscripciones propias"
drop policy if exists "Artistas pueden ver su suscripción" on public.subscriptions;
