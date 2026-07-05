-- Subida nativa de vídeo (decisión de producto: descentralización — no enviar
-- al usuario a YouTube). Se mantiene también la opción de enlace externo.
-- Control de coste: límite de 100 MB por archivo en el bucket + carga diferida
-- en el frontend (preload="none").

-- 1) El validador de vídeos acepta ahora también URLs del propio Storage
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
  if public.is_admin() then
    return new;
  end if;

  if new.type = 'video' then
    if new.url is null or (
      new.url !~* '^https://((www\.)?youtube\.com|youtu\.be|(www\.)?vimeo\.com)/'
      and new.url !~* '^https://xseupkmaosjdrgdsdpmj\.supabase\.co/storage/'
    ) then
      raise exception 'Solo se admiten vídeos subidos a TUESDI o enlaces de YouTube/Vimeo.'
        using errcode = 'check_violation';
    end if;
  end if;

  select s.plan into v_plan
  from public.subscriptions s
  where s.artist_id = new.artist_id
    and s.status in ('active', 'trialing')
  order by s.created_at desc
  limit 1;

  v_plan := coalesce(v_plan, 'beta');

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

-- 2) Límite duro de 100 MB por archivo en el bucket (server-side)
update storage.buckets
set file_size_limit = 104857600
where id = 'artist-media';
