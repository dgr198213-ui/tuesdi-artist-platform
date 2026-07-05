-- Política de downgrade (decisión de producto, cubierta en Condiciones de Uso):
-- los planes tienen validez mensual; al cambiar el plan de un artista (o al
-- cancelarse/expirar la suscripción => beta), se eliminan automáticamente los
-- vídeos y fotos que excedan el límite del nuevo plan, borrando LOS MÁS
-- ANTIGUOS y conservando los más recientes (el último se asume el más actual).

create or replace function public.prune_media_on_plan_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  photo_limit int;
  video_limit int;
begin
  v_plan := coalesce(new.plan, 'beta');
  if new.status is distinct from 'active' and new.status is distinct from 'trialing' then
    v_plan := 'beta';
  end if;

  photo_limit := case v_plan when 'pro' then 3 when 'standard' then 3 else 1 end;
  video_limit := case v_plan when 'pro' then 3 when 'standard' then 1 else 0 end;

  -- Fotos: conservar las N más recientes, borrar el resto
  delete from public.media m
  where m.artist_id = new.artist_id and m.type = 'photo'
    and m.id not in (
      select id from public.media
      where artist_id = new.artist_id and type = 'photo'
      order by created_at desc
      limit photo_limit
    );

  -- Vídeos: mismo criterio
  delete from public.media m
  where m.artist_id = new.artist_id and m.type = 'video'
    and m.id not in (
      select id from public.media
      where artist_id = new.artist_id and type = 'video'
      order by created_at desc
      limit video_limit
    );

  return new;
end;
$$;

drop trigger if exists trg_prune_media_on_plan_change on public.subscriptions;
create trigger trg_prune_media_on_plan_change
  after insert or update of plan, status on public.subscriptions
  for each row
  execute function public.prune_media_on_plan_change();
