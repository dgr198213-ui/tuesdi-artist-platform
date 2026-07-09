-- Limpieza de esquema muerto heredado del scaffold inicial (mayo 2026).
-- Ninguno de estos objetos es referenciado por el frontend ni por las
-- Edge Functions, ni está enganchado a ningún trigger o job de cron.

-- 1) Funciones muertas.
--    enforce_media_plan_limits: NO está asociada a ningún trigger (el vivo es
--    check_media_plan_limit). Además usa nombres de plan obsoletos
--    ('spark'/'spotlight') y lee profiles.plan, contradiciendo la política
--    de planes vigente (Beta/Standard/Pro sobre artists.subscription_plan).
drop function if exists public.enforce_media_plan_limits() cascade;

--    run_retention_cleanup: no está programada en cron.job (los jobs activos son
--    expire_old_events, cleanup_expired_magic_links y cleanup_event_submission_log).
drop function if exists public.run_retention_cleanup() cascade;

-- 2) Tablas muertas del esquema alternativo.
--    messages: contradice el ADN del proyecto (no hay chat interno). 0 filas.
drop table if exists public.messages cascade;

--    favorites: nunca implementado en el frontend. 0 filas.
drop table if exists public.favorites cascade;
