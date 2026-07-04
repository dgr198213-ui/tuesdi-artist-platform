-- Aplicada vía MCP. Restaura la política ALL de gestión de eventos de artistas.
drop policy if exists "Artistas gestionan sus eventos" on public.events;
create policy "Artistas gestionan sus eventos" on public.events
  for all to public
  using (
    exists (select 1 from public.artists
            where artists.id = events.artist_id and artists.user_id = auth.uid())
  );
