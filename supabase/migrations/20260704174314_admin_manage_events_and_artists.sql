-- Permite a los admins (public.admin_users) gestionar TODOS los eventos y artistas
-- desde el panel /system, y exime a los admins del rate limit de creación de eventos.

-- === EVENTOS: control total para admins ===
drop policy if exists "Admins ven todos los eventos" on public.events;
create policy "Admins ven todos los eventos" on public.events
  for select using (public.is_admin());

drop policy if exists "Admins gestionan todos los eventos" on public.events;
create policy "Admins gestionan todos los eventos" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- === ARTISTAS: admins ven y borran cualquiera ===
drop policy if exists "Admins ven todos los artistas" on public.artists;
create policy "Admins ven todos los artistas" on public.artists
  for select using (public.is_admin());

drop policy if exists "Admins gestionan todos los artistas" on public.artists;
create policy "Admins gestionan todos los artistas" on public.artists
  for all using (public.is_admin()) with check (public.is_admin());

-- === RATE LIMIT: eximir a admins ===
create or replace function public.check_event_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare email_count int; global_count int;
begin
  -- Los admins no tienen límite (crean contenido desde el panel)
  if public.is_admin() then
    return new;
  end if;

  select count(*) into email_count from public.event_submission_log
  where email = new.organizer_email and created_at > now() - interval '1 hour';
  if email_count >= 3 then
    raise exception 'Has alcanzado el límite de eventos por hora. Inténtalo más tarde.'
      using errcode = 'check_violation';
  end if;

  select count(*) into global_count from public.event_submission_log
  where created_at > now() - interval '1 hour';
  if global_count >= 20 then
    raise exception 'El sistema está recibiendo muchas solicitudes. Inténtalo en unos minutos.'
      using errcode = 'check_violation';
  end if;

  insert into public.event_submission_log (email) values (new.organizer_email);
  return new;
end;
$$;
