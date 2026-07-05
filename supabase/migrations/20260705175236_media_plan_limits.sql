-- Hace cumplir en la BD los límites de media por plan (hoy solo se validaban
-- en el cliente: un usuario con la consola podía saltárselos) y valida que
-- los vídeos sean solo enlaces de YouTube/Vimeo.
-- Límites espejo de PLAN_LIMITS (client/src/lib/constants.ts):
--   beta: 1 foto / 0 vídeos · standard: 3/1 · pro: 3/3
-- Los admins están exentos (gestión desde /system).

create or replace function public.check_media_plan_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_count int;
  v_limit int;
begin
  -- Admins exentos
  if public.is_admin() then
    return new;
  end if;

  -- Validación de dominio para vídeos (solo YouTube/Vimeo)
  if new.type = 'video' then
    if new.url is null
       or new.url !~* '^https://((www\.)?youtube\.com|youtu\.be|(www\.)?vimeo\.com)/' then
      raise exception 'Solo se admiten vídeos de YouTube o Vimeo.'
        using errcode = 'check_violation';
    end if;
  end if;

  -- Plan activo del artista (sin suscripción activa => beta)
  select s.plan into v_plan
  from public.subscriptions s
  where s.artist_id = new.artist_id
    and s.status in ('active', 'trialing')
  order by s.created_at desc
  limit 1;

  v_plan := coalesce(v_plan, 'beta');

  -- Límite según tipo y plan (espejo de PLAN_LIMITS del frontend)
  if new.type = 'photo' then
    v_limit := case v_plan when 'pro' then 3 when 'standard' then 3 else 1 end;
  elsif new.type = 'video' then
    v_limit := case v_plan when 'pro' then 3 when 'standard' then 1 else 0 end;
  else
    raise exception 'Tipo de media no válido.' using errcode = 'check_violation';
  end if;

  select count(*) into v_count
  from public.media
  where artist_id = new.artist_id and type = new.type;

  if v_count >= v_limit then
    raise exception 'Tu plan % permite un máximo de % %(s).', v_plan, v_limit, new.type
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_media_plan_limit on public.media;
create trigger trg_media_plan_limit
  before insert on public.media
  for each row
  execute function public.check_media_plan_limit();
