-- Aplicada vía MCP. Rate limiting de creación de eventos (anti-spam, C-2).
create table if not exists public.event_submission_log (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_event_submission_log_email_time
  on public.event_submission_log (email, created_at desc);
create index if not exists idx_event_submission_log_time
  on public.event_submission_log (created_at desc);

create or replace function public.check_event_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare email_count int; global_count int;
begin
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

drop trigger if exists trg_event_rate_limit on public.events;
create trigger trg_event_rate_limit
  before insert on public.events
  for each row execute function public.check_event_rate_limit();

create or replace function public.cleanup_event_submission_log()
returns void language sql security definer set search_path = public as $$
  delete from public.event_submission_log where created_at < now() - interval '24 hours';
$$;
