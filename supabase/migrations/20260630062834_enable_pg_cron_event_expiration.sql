-- Aplicada vía MCP. Habilita pg_cron y expiración automática de eventos.
create extension if not exists pg_cron with schema extensions;

create or replace function public.expire_old_events()
returns void language sql security definer set search_path = public as $$
  update public.events set status = 'expired'
  where status = 'approved' and event_date < now() - interval '1 day';
$$;

-- Nota: cron.schedule se ejecutó vía MCP; no se re-crea aquí para evitar
-- duplicados. Jobs activos: expire-old-events (hourly), cleanup-magic-links (3am).
