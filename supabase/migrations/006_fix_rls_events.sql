-- ============================================================
-- TUESDI v3.0 — Migración 006: Corrección de RLS en Events
-- Fase 1.1 del plan estratégico: Revisar RLS en events
--
-- Cambio: Solo eventos con status='approved' deben ser públicos
-- Los eventos 'pending' no deben ser visibles públicamente
-- ============================================================

-- Actualizar la política de lectura pública
DROP POLICY IF EXISTS "Eventos aprobados son públicos" ON public.events;
CREATE POLICY "Eventos aprobados son públicos" ON public.events
    FOR SELECT USING (status = 'approved');

-- Política para que artistas vean sus propios eventos (pendientes o aprobados)
DROP POLICY IF EXISTS "Artistas pueden ver sus eventos" ON public.events;
CREATE POLICY "Artistas pueden ver sus eventos" ON public.events
    FOR SELECT USING (
        artist_id IS NOT NULL 
        AND artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid())
    );

-- Mantener la política de inserción anónima
DROP POLICY IF EXISTS "Cualquiera puede crear eventos" ON public.events;
CREATE POLICY "Cualquiera puede crear eventos" ON public.events
    FOR INSERT WITH CHECK (true);
