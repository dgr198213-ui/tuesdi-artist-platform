-- Aplicada vía MCP. Elimina política permisiva antigua (qual=true) que
-- exponía todos los eventos, y corrige la política de artistas.
drop policy if exists "Lectura pública de eventos" on public.events;

drop policy if exists "Artistas pueden ver sus eventos" on public.events;
create policy "Artistas pueden ver sus eventos" on public.events
  for select using (
    exists (select 1 from public.artists
            where artists.id = events.artist_id and artists.user_id = auth.uid())
  );
