-- ============================================================
-- TUESDI v3.0 — Migración 007: Índices de Rendimiento
-- Optimiza consultas frecuentes y reduce latencia de BD
-- ============================================================

-- ============================================================
-- ÍNDICES COMPUESTOS PARA BÚSQUEDAS COMUNES
-- ============================================================

-- Búsqueda de artistas por categoría y ciudad
CREATE INDEX IF NOT EXISTS idx_artists_category_city 
  ON public.artists(category, city) 
  WHERE subscription_plan != 'beta';

-- Búsqueda de eventos por estado y fecha
CREATE INDEX IF NOT EXISTS idx_events_status_date 
  ON public.events(status, event_date DESC) 
  WHERE status = 'approved';

-- Búsqueda de media por artista y tipo
CREATE INDEX IF NOT EXISTS idx_media_artist_type 
  ON public.media(artist_id, type);

-- ============================================================
-- ÍNDICES PARCIALES PARA DATOS ACTIVOS
-- ============================================================

-- Solo artistas verificados
CREATE INDEX IF NOT EXISTS idx_artists_verified 
  ON public.artists(slug) 
  WHERE verified = true;

-- Solo suscripciones activas
CREATE INDEX IF NOT EXISTS idx_subscriptions_active 
  ON public.subscriptions(artist_id) 
  WHERE status = 'active';

-- Solo contactos no archivados
CREATE INDEX IF NOT EXISTS idx_contact_requests_active 
  ON public.contact_requests(artist_id, created_at DESC) 
  WHERE status != 'archived';

-- ============================================================
-- ÍNDICES PARA ORDENAMIENTO Y PAGINACIÓN
-- ============================================================

-- Artistas ordenados por fecha de creación (para "Nuevos")
CREATE INDEX IF NOT EXISTS idx_artists_created_at_desc 
  ON public.artists(created_at DESC);

-- Eventos ordenados por fecha (para "Próximos")
CREATE INDEX IF NOT EXISTS idx_events_date_asc 
  ON public.events(event_date ASC) 
  WHERE status = 'approved';

-- Contactos ordenados por fecha (para "Recientes")
CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at_desc 
  ON public.contact_requests(artist_id, created_at DESC);

-- ============================================================
-- ÍNDICES PARA BÚSQUEDA DE TEXTO (FULL-TEXT SEARCH)
-- ============================================================

-- Crear columna tsvector para búsqueda de artistas
ALTER TABLE public.artists 
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Generar vector de búsqueda
UPDATE public.artists 
SET search_vector = 
  setweight(to_tsvector('spanish', COALESCE(artist_name, '')), 'A') ||
  setweight(to_tsvector('spanish', COALESCE(bio, '')), 'B') ||
  setweight(to_tsvector('spanish', COALESCE(category, '')), 'C')
WHERE search_vector IS NULL;

-- Crear índice GIN para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_artists_search_vector 
  ON public.artists USING GIN(search_vector);

-- Trigger para actualizar search_vector automáticamente
DROP TRIGGER IF EXISTS update_artists_search_vector ON public.artists;
CREATE TRIGGER update_artists_search_vector
  BEFORE INSERT OR UPDATE ON public.artists
  FOR EACH ROW
  EXECUTE FUNCTION tsvector_update_trigger(
    search_vector, 'pg_catalog.spanish', artist_name, bio, category
  );

-- ============================================================
-- ÍNDICES PARA ANÁLISIS Y REPORTES
-- ============================================================

-- Métricas por artista y fecha
CREATE INDEX IF NOT EXISTS idx_metrics_artist_date 
  ON public.metrics(artist_id, recorded_at DESC);

-- Eventos por organizador (para estadísticas)
CREATE INDEX IF NOT EXISTS idx_events_organizer_email 
  ON public.events(organizer_email, created_at DESC);

-- ============================================================
-- ESTADÍSTICAS Y ANÁLISIS
-- ============================================================

-- Analizar tablas para optimizar el query planner
ANALYZE public.artists;
ANALYZE public.events;
ANALYZE public.media;
ANALYZE public.contact_requests;
ANALYZE public.subscriptions;
ANALYZE public.metrics;

-- ============================================================
-- NOTAS DE OPTIMIZACIÓN
-- ============================================================
/*
1. ÍNDICES COMPUESTOS: Permiten "index-only scans" para queries comunes
   - Reducen lecturas de disco significativamente
   - Especialmente útiles para paginación

2. ÍNDICES PARCIALES: Solo indexan filas que cumplen la condición
   - Reducen tamaño del índice
   - Mejoran velocidad de escritura
   - Ideales para datos "activos" vs "archivados"

3. FULL-TEXT SEARCH: Búsqueda de texto en artistas
   - Soporta búsqueda por nombre, bio, categoría
   - Usa stemming en español
   - Mucho más rápido que LIKE o ILIKE

4. ÍNDICES GIN: Optimizados para búsqueda de texto
   - Mejor que BTREE para tsvector
   - Lento para escritura pero muy rápido para lectura

5. ANÁLISIS: ANALYZE actualiza estadísticas del query planner
   - Ayuda a PostgreSQL a elegir el mejor plan de ejecución
   - Debe ejecutarse después de cambios significativos de datos

IMPACTO ESPERADO:
- Búsquedas de artistas: 10-50x más rápidas
- Listado de eventos: 5-20x más rápidas
- Búsqueda de texto: 100x+ más rápida
- Tamaño de índices: ~50-100 MB adicionales
*/
