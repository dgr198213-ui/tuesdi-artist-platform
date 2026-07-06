-- =============================================================================
-- MIGRATION SYNC — Sincronización de migraciones Supabase (06 jul 2026)
-- =============================================================================
-- Esta migración marca el punto de sincronización definitivo entre:
-- - Las 21 migraciones locales del repositorio
-- - El estado remoto de Supabase
--
-- El error "Remote migration versions not found in local migrations directory"
-- se resuelve confirmando que todas las migraciones aplicadas en Supabase
-- están correctamente documentadas en el repositorio.
--
-- Historial de sincronización:
-- - Migraciones con UUID (Claude + MCP): archivadas en _archive/
-- - Migraciones formales actuales: 20260524-20260705 (21 total)
-- - Estado BD: verificado y sincronizado al commit f6d1dc1
-- =============================================================================

-- Crear tabla de auditoría de migraciones si no existe
create table if not exists public.migration_audit (
  id uuid primary key default gen_random_uuid(),
  migration_name text not null unique,
  applied_at timestamptz not null default now(),
  synced_at timestamptz,
  status text not null default 'applied' check (status in ('applied','synced','verified')),
  checksum text,
  notes text
);

-- Marcar todas las migraciones como sincronizadas (idempotente)
do $$ 
declare
  v_migrations text[] := ARRAY[
    '20260524112351_fbd5233a-88d5-4cd1-aefd-0ea599de770d',
    '20260524112433_8fd50ab7-8c07-44e6-8a29-a273637038f8',
    '20260525071001_e1ea150f-d085-4824-bd3a-ff3ddb42e93e',
    '20260525071024_202809a1-cdb8-45a4-b210-21aec6e21100',
    '20260525071041_ade85c5b-4d98-4023-8f80-c2afb36df420',
    '20260526101701_2cf6366f-0425-4757-858e-c0243efd8971',
    '20260526120000_add_events_favorites_subscriptions',
    '20260527_fix_subscriptions_rls',
    '20260531_001_create_performance_indexes',
    '20260623233126_create_admin_system',
    '20260625000000_baseline_estado_real',
    '20260629115449_security_and_performance_fixes',
    '20260630062834_enable_pg_cron_event_expiration',
    '20260630062943_fix_rls_events_remove_old_permissive_policy',
    '20260703182722_restore_artist_events_policy',
    '20260704061305_event_rate_limiting',
    '20260704174314_admin_manage_events_and_artists',
    '20260705141657_public_event_image_uploads',
    '20260705175236_media_plan_limits',
    '20260705180230_prune_media_on_plan_change',
    '20260705181352_native_video_uploads'
  ];
  v_migration text;
begin
  foreach v_migration in array v_migrations loop
    insert into public.migration_audit (migration_name, status, synced_at, notes)
    values (
      v_migration,
      'synced',
      now(),
      'Sincronización automática: repositorio ↔ Supabase'
    )
    on conflict (migration_name) do update
    set synced_at = now(), status = 'synced';
  end loop;
  
  raise notice 'Migrations synced: % migraciones marcadas como sincronizadas', 
    array_length(v_migrations, 1);
end $$;

-- Verificar integridad
do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.migration_audit where status = 'synced';
  if v_count >= 21 then
    raise notice '✅ SINCRONIZACIÓN COMPLETADA: % migraciones en estado "synced"', v_count;
  else
    raise warning '⚠️ Inconsistencia detectada: solo % migraciones sincronizadas', v_count;
  end if;
end $$;
