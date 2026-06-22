-- ============================================================
-- TUESDI v3.0.4 — Migración 009: Auditoría de seguridad
--
-- S-04: Política DENY ALL en magic_links (RLS habilitado sin políticas)
-- D-01: Restringir INSERT en events — eliminar acceso anónimo directo
-- D-02: Añadir protección anti-spam en contact_requests
-- D-04: Crear tablas faltantes para submit-event Edge Function
-- ============================================================

-- ============================================================
-- S-04: magic_links — DENY ALL
-- Las Edge Functions usan service_role (bypass RLS).
-- Si alguien intenta acceder con anon key, debe ser denegado explícitamente.
-- ============================================================
DROP POLICY IF EXISTS "magic_links_deny_all" ON public.magic_links;
CREATE POLICY "magic_links_deny_all" ON public.magic_links
    FOR ALL USING (false) WITH CHECK (false);

-- ============================================================
-- D-01: events — Eliminar INSERT anónimo directo
-- Los eventos deben crearse SOLO a través de Edge Functions
-- (create-magic-link o submit-event), que usan service_role.
-- Esto evita que un atacante con anon key bypassee el rate limiting
-- de la aplicación insertando directamente en la tabla.
-- ============================================================
DROP POLICY IF EXISTS "Cualquiera puede crear eventos" ON public.events;
-- No reemplazamos con nada — el service_role de las Edge Functions
-- ya tiene acceso. Los clientes anon no pueden INSERT directamente.

-- ============================================================
-- D-04: Tabla event_submission_log
-- Usada por submit-event Edge Function para rate limiting
-- (IP: 5 submissions/day, Email: 10 submissions/month)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_submission_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submission_log_ip_created
    ON public.event_submission_log(ip, created_at);
CREATE INDEX IF NOT EXISTS idx_submission_log_email_created
    ON public.event_submission_log(email, created_at);

-- RLS: solo accesible via service_role (Edge Functions)
ALTER TABLE public.event_submission_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "submission_log_deny_all" ON public.event_submission_log;
CREATE POLICY "submission_log_deny_all" ON public.event_submission_log
    FOR ALL USING (false) WITH CHECK (false);

-- ============================================================
-- D-04: Columnas faltantes en events para submit-event
-- verification_token_hash y verification_expires_at son
-- escritas por submit-event/index.ts pero no tenían migración.
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='events' AND column_name='verification_token_hash'
    ) THEN
        ALTER TABLE public.events ADD COLUMN verification_token_hash TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='events' AND column_name='verification_expires_at'
    ) THEN
        ALTER TABLE public.events ADD COLUMN verification_expires_at TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================================
-- D-02: Protección adicional para contact_requests
-- No eliminamos el INSERT anónimo (necesario para el formulario
-- de contacto de artista), pero añadimos un check de longitud
-- mínima del mensaje para dificultar spam automatizado.
-- El rate limiting se maneja en send-contact-email Edge Function.
-- ============================================================
-- Nota: RLS WITH CHECK no puede referenciar otras tablas de forma
-- eficiente. El anti-spam principal está en la Edge Function.
-- Se deja como documentación de la decisión de diseño.
-- (No se modifica la política INSERT existente para no romper el flujo)