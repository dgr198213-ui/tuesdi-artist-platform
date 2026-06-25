-- ============================================================
-- TUESDI v3.0 — Migración 005: Integración de Stripe
-- Tablas para gestionar pagos, webhooks y eventos de Stripe
--
-- v3.0.2 — 2026-06-18: Integración completa de Stripe
--   + Tabla stripe_events para registrar webhooks
--   + Tabla stripe_payments para auditoría de transacciones
--   + Actualización de subscriptions con campos Stripe
-- ============================================================

-- ============================================================
-- TABLA: stripe_events
-- Registro de todos los webhooks recibidos de Stripe
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stripe_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_event_type ON public.stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON public.stripe_events(processed);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON public.stripe_events(created_at);

-- ============================================================
-- TABLA: stripe_payments
-- Auditoría de todas las transacciones de pago
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stripe_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT,
    amount INTEGER NOT NULL, -- en centavos (ej: 600 = 6€)
    currency TEXT DEFAULT 'eur',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
    plan TEXT CHECK (plan IN ('standard', 'pro')),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    receipt_url TEXT,
    error_code TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_payments_artist_id ON public.stripe_payments(artist_id);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_status ON public.stripe_payments(status);
CREATE INDEX IF NOT EXISTS idx_stripe_payments_stripe_customer_id ON public.stripe_payments(stripe_customer_id);

-- ============================================================
-- TABLA: stripe_invoices
-- Facturas generadas por Stripe
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stripe_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT NOT NULL UNIQUE,
    stripe_customer_id TEXT,
    amount INTEGER, -- en centavos
    currency TEXT DEFAULT 'eur',
    status TEXT DEFAULT 'draft', -- draft, open, paid, void, uncollectible
    pdf_url TEXT,
    hosted_invoice_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_invoices_artist_id ON public.stripe_invoices(artist_id);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_status ON public.stripe_invoices(status);

-- ============================================================
-- ACTUALIZAR TABLA: subscriptions
-- Agregar campos faltantes para sincronización con Stripe
-- ============================================================
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ;
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- ============================================================
-- TRIGGERS para updated_at
-- ============================================================
DROP TRIGGER IF EXISTS update_stripe_events_updated_at ON public.stripe_events;
CREATE TRIGGER update_stripe_events_updated_at
    BEFORE UPDATE ON public.stripe_events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_payments_updated_at ON public.stripe_payments;
CREATE TRIGGER update_stripe_payments_updated_at
    BEFORE UPDATE ON public.stripe_payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_stripe_invoices_updated_at ON public.stripe_invoices;
CREATE TRIGGER update_stripe_invoices_updated_at
    BEFORE UPDATE ON public.stripe_invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS: stripe_events (solo lectura para artistas, inserción por webhook)
-- ============================================================
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Webhooks pueden insertar eventos" ON public.stripe_events;
CREATE POLICY "Webhooks pueden insertar eventos" ON public.stripe_events
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- RLS: stripe_payments (artistas ven sus pagos)
-- ============================================================
ALTER TABLE public.stripe_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artistas pueden ver sus pagos" ON public.stripe_payments;
CREATE POLICY "Artistas pueden ver sus pagos" ON public.stripe_payments
    FOR SELECT USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));

-- ============================================================
-- RLS: stripe_invoices (artistas ven sus facturas)
-- ============================================================
ALTER TABLE public.stripe_invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Artistas pueden ver sus facturas" ON public.stripe_invoices;
CREATE POLICY "Artistas pueden ver sus facturas" ON public.stripe_invoices
    FOR SELECT USING (artist_id IN (SELECT id FROM public.artists WHERE user_id = auth.uid()));
