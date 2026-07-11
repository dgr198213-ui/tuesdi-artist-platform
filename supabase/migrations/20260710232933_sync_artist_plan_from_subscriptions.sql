-- Elimina la doble fuente de verdad del plan.
--
-- Antes: el frontend entero lee artists.subscription_plan, pero los triggers
-- de límites/poda y el webhook de Stripe operan sobre subscriptions. Tras un
-- pago, la BD ya permitía los límites nuevos pero la UI seguía mostrando el
-- plan viejo (y viceversa en el downgrade).
--
-- Modelo resultante: subscriptions es la fuente canónica (ahí escribe Stripe);
-- artists.subscription_plan pasa a ser una caché denormalizada mantenida por
-- este trigger. Semántica idéntica a prune_media_on_plan_change: solo
-- active/trialing cuentan; cualquier otro estado (o ausencia de fila) = beta.

create or replace function public.sync_artist_plan()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_artist_id uuid;
  v_plan text;
begin
  v_artist_id := coalesce(new.artist_id, old.artist_id);

  -- Recalcular siempre desde la tabla (no desde NEW): es idempotente y
  -- correcto aunque existan varias filas históricas por artista.
  select s.plan into v_plan
  from public.subscriptions s
  where s.artist_id = v_artist_id
    and s.status in ('active', 'trialing')
  order by s.created_at desc
  limit 1;

  update public.artists
  set subscription_plan = coalesce(v_plan, 'beta')
  where id = v_artist_id
    and subscription_plan is distinct from coalesce(v_plan, 'beta');

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_artist_plan on public.subscriptions;
create trigger trg_sync_artist_plan
  after insert or update of plan, status or delete on public.subscriptions
  for each row
  execute function public.sync_artist_plan();

-- Backfill: alinear los artistas existentes con su suscripción real.
update public.artists a
set subscription_plan = coalesce(
  (select s.plan from public.subscriptions s
   where s.artist_id = a.id and s.status in ('active','trialing')
   order by s.created_at desc limit 1),
  'beta')
where a.subscription_plan is distinct from coalesce(
  (select s.plan from public.subscriptions s
   where s.artist_id = a.id and s.status in ('active','trialing')
   order by s.created_at desc limit 1),
  'beta');
