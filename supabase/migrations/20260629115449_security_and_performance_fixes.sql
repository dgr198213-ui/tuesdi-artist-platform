-- Aplicada vía MCP. Fixes de seguridad y rendimiento (auditoría).
-- Idempotente: segura de re-ejecutar.

drop policy if exists "Eventos aprobados son públicos" on public.events;
drop policy if exists "Public events are viewable by everyone" on public.events;
create policy "Eventos aprobados son públicos" on public.events
  for select using (status = 'approved');

create unique index if not exists idx_magic_links_token_hash
  on public.magic_links (token_hash) where used = false;

create index if not exists idx_events_status_expires
  on public.events (status, event_date) where status = 'approved';

create index if not exists idx_magic_links_active
  on public.magic_links (event_id, used, expires_at) where used = false;

create or replace function public.cleanup_expired_magic_links()
returns void language sql security definer set search_path = public as $$
  delete from public.magic_links where expires_at < now() - interval '24 hours';
$$;
