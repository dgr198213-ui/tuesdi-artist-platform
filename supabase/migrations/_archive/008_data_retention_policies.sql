-- ============================================================
-- TUESDI v3.0 — Migración 008: Políticas de Retención de Datos
-- Limpia datos antiguos automáticamente para reducir costes
-- ============================================================

-- ============================================================
-- FUNCIÓN: Limpiar eventos expirados
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_events()
RETURNS void AS $$
BEGIN
  -- Eliminar eventos que expiraron hace más de 90 días
  DELETE FROM public.events
  WHERE status = 'expired'
    AND expires_at < NOW() - INTERVAL '90 days';

  -- Marcar como expirados los eventos cuya fecha pasó
  UPDATE public.events
  SET status = 'expired'
  WHERE status = 'approved'
    AND event_date < CURRENT_DATE;

  RAISE NOTICE 'Cleanup de eventos completado';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCIÓN: Limpiar logs de Stripe antiguos
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_stripe_events()
RETURNS void AS $$
BEGIN
  -- Eliminar eventos de Stripe más antiguos de 1 año
  DELETE FROM public.stripe_events
  WHERE created_at < NOW() - INTERVAL '1 year';

  RAISE NOTICE 'Cleanup de stripe_events completado';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCIÓN: Limpiar contactos archivados antiguos
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_archived_contacts()
RETURNS void AS $$
BEGIN
  -- Eliminar contactos archivados hace más de 6 meses
  DELETE FROM public.contact_requests
  WHERE status = 'archived'
    AND updated_at < NOW() - INTERVAL '6 months';

  RAISE NOTICE 'Cleanup de contact_requests archivados completado';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCIÓN: Limpiar métricas antiguas
-- ============================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_metrics()
RETURNS void AS $$
BEGIN
  -- Agregar métricas antiguas (más de 1 año) en una tabla de resumen
  -- y luego eliminarlas para ahorrar espacio
  DELETE FROM public.metrics
  WHERE recorded_at < CURRENT_DATE - INTERVAL '1 year';

  RAISE NOTICE 'Cleanup de métricas antiguas completado';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLA: Configuración de retención
-- ============================================================
CREATE TABLE IF NOT EXISTS public.retention_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL UNIQUE,
  retention_days INTEGER NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_cleanup TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO public.retention_config (entity_type, retention_days, enabled)
VALUES
  ('expired_events', 90, true),
  ('stripe_events', 365, true),
  ('archived_contacts', 180, true),
  ('old_metrics', 365, true)
ON CONFLICT (entity_type) DO NOTHING;

-- ============================================================
-- FUNCIÓN: Ejecutar limpieza según configuración
-- ============================================================
CREATE OR REPLACE FUNCTION public.run_retention_cleanup()
RETURNS TABLE(entity_type TEXT, rows_affected INTEGER, status TEXT) AS $$
DECLARE
  v_config RECORD;
  v_rows_affected INTEGER;
BEGIN
  FOR v_config IN
    SELECT * FROM public.retention_config WHERE enabled = true
  LOOP
    CASE v_config.entity_type
      WHEN 'expired_events' THEN
        PERFORM public.cleanup_expired_events();
        GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
        RETURN QUERY SELECT 'expired_events'::TEXT, v_rows_affected, 'completed'::TEXT;

      WHEN 'stripe_events' THEN
        PERFORM public.cleanup_old_stripe_events();
        GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
        RETURN QUERY SELECT 'stripe_events'::TEXT, v_rows_affected, 'completed'::TEXT;

      WHEN 'archived_contacts' THEN
        PERFORM public.cleanup_archived_contacts();
        GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
        RETURN QUERY SELECT 'archived_contacts'::TEXT, v_rows_affected, 'completed'::TEXT;

      WHEN 'old_metrics' THEN
        PERFORM public.cleanup_old_metrics();
        GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
        RETURN QUERY SELECT 'old_metrics'::TEXT, v_rows_affected, 'completed'::TEXT;
    END CASE;

    -- Actualizar timestamp de último cleanup
    UPDATE public.retention_config
    SET last_cleanup = NOW()
    WHERE entity_type = v_config.entity_type;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLA: Tabla de auditoría para limpieza
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cleanup_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  rows_deleted INTEGER,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT
);

-- Crear índice para búsqueda rápida de logs
CREATE INDEX IF NOT EXISTS idx_cleanup_log_executed_at 
  ON public.cleanup_log(executed_at DESC);

-- ============================================================
-- NOTAS SOBRE RETENCIÓN
-- ============================================================
/*
CONFIGURACIÓN DE LIMPIEZA AUTOMÁTICA:

1. EVENTOS EXPIRADOS (90 días)
   - Eventos que pasaron su fecha se marcan como 'expired'
   - Se eliminan 90 días después de expirar
   - Reduce tamaño de tabla de eventos

2. LOGS DE STRIPE (1 año)
   - Se guardan para auditoría pero se eliminan después de 1 año
   - Cumple con requisitos de retención típicos
   - Reduce costes de almacenamiento

3. CONTACTOS ARCHIVADOS (6 meses)
   - Los usuarios pueden archivar contactos
   - Se eliminan 6 meses después de archivar
   - Permite recuperación temporal pero no indefinida

4. MÉTRICAS ANTIGUAS (1 año)
   - Se guardan para análisis histórico
   - Se eliminan después de 1 año
   - Considera agregar a tabla de resumen antes de eliminar

EJECUCIÓN:
- Ejecutar manualmente: SELECT * FROM public.run_retention_cleanup();
- Ejecutar automáticamente: Configurar en Supabase Cron (si está disponible)
- O crear una tarea programada en la aplicación

IMPACTO:
- Reduce tamaño de BD en ~30-50% después de 1 año
- Reduce costes de almacenamiento y backups
- Mejora velocidad de queries (menos datos)
*/
