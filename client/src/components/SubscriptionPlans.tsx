/**
 * SubscriptionPlans — Componente para mostrar planes con integración Stripe
 * Reemplaza la lógica estática de Precios.tsx con funcionalidad de pago real
 *
 * @backlog (2026-06-19) — COMPONENTE NO ACTIVO
 * Este componente NO está enrutado ni importado en ninguna página.
 * Depende de la Edge Function `create-checkout-session` y del secret
 * `STRIPE_SECRET_KEY`, que todavía no están configurados en producción.
 * La página /planes usa Precios.tsx con planes estáticos.
 * Activar cuando se habilite la monetización real con Stripe.
 */

import { useState } from "react";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { PLAN_LIMITS, PLAN_PRICING } from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface SubscriptionPlansProps {
  artistId?: string;
  currentPlan?: "beta" | "standard" | "pro";
}

const CHECK = (
  <span
    className="material-symbols-outlined text-primary text-[20px] shrink-0"
    style={{ fontVariationSettings: "'FILL' 1" }}
  >
    check_circle
  </span>
);

const DOT = (
  <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
    radio_button_unchecked
  </span>
);

export default function SubscriptionPlans({ artistId, currentPlan = "beta" }: SubscriptionPlansProps) {
  const { createCheckoutSession, loading, error } = useStripeCheckout();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleUpgrade = async (plan: "standard" | "pro") => {
    if (!artistId) {
      console.error("artistId es requerido para actualizar suscripción");
      return;
    }

    // Validar que las price IDs estén configuradas
    const priceIds: Record<string, string> = {
      standard: process.env.VITE_STRIPE_STANDARD_PRICE_ID || "",
      pro: process.env.VITE_STRIPE_PRO_PRICE_ID || "",
    };

    if (!priceIds[plan]) {
      console.error(`Price ID no configurado para plan: ${plan}`);
      return;
    }

    setSelectedPlan(plan);

    await createCheckoutSession({
      priceId: priceIds[plan]!,
      plan,
      artistId,
    });

    setSelectedPlan(null);
  };

  const plans = [
    {
      id: "beta",
      name: "Beta",
      description: "Todo lo que necesitas para empezar.",
      price: PLAN_PRICING.beta.price,
      badge: "Disponible Ahora",
      badgeColor: "bg-primary",
      features: [
        "Perfil artístico público completo",
        "Galería con 1 foto",
        "Formulario de contacto privado",
        "Métricas básicas en el dashboard",
        "Posicionamiento estándar en el directorio",
        "Sin comisiones ni intermediarios",
      ],
      isCurrent: currentPlan === "beta",
      isActive: true,
    },
    {
      id: "standard",
      name: "Standard",
      description: "Para artistas que quieren destacar.",
      price: PLAN_PRICING.standard.price,
      badge: "Próximamente",
      badgeColor: "bg-surface-container-high",
      features: [
        "Todo lo del plan Beta",
        "Galería ampliada: 3 fotos + 1 vídeo",
        "Métricas ampliadas en el dashboard",
        "Posicionamiento mejorado en búsquedas",
        "Distintivo Standard en el perfil",
      ],
      isCurrent: currentPlan === "standard",
      isActive: true,
    },
    {
      id: "pro",
      name: "Pro",
      description: "Máxima visibilidad y promoción activa.",
      price: PLAN_PRICING.pro.price,
      badge: "Próximamente",
      badgeColor: "bg-surface-container-high",
      features: [
        "Todo lo del plan Standard",
        "Galería completa: 3 fotos + 3 vídeos",
        "Métricas avanzadas con tendencias",
        "Posicionamiento prioritario en el directorio",
        "Distintivo Pro verificado",
      ],
      isCurrent: currentPlan === "pro",
      isActive: true,
    },
  ];

  return (
    <div className="space-y-lg">
      {error && (
        <div className="p-md rounded-lg bg-error/10 border border-error text-error text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-start">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`glass-card rounded-2xl overflow-hidden transition-all ${
              plan.id === "beta"
                ? "border-primary/40 shadow-[0_0_40px_rgba(0,129,255,0.2)] md:scale-105 md:-translate-y-2 z-10"
                : "opacity-60"
            }`}
          >
            <div
              className={`${plan.badgeColor} text-on-primary text-center py-sm font-label-sm text-label-sm font-bold uppercase tracking-widest`}
            >
              {plan.badge}
            </div>

            <div className="p-lg">
              <div className="mb-lg">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
                  {plan.name}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {plan.description}
                </p>
              </div>

              <div className="mb-lg">
                <span className="text-[56px] font-bold text-on-surface leading-none">
                  {plan.price.split("/")[0]}
                </span>
                {plan.price.includes("/") && (
                  <span className="text-on-surface-variant font-body-md">
                    /{plan.price.split("/")[1]}
                  </span>
                )}
              </div>

              {/* Límites */}
              <div className="flex gap-sm mb-lg">
                <div className="flex-1 bg-surface-container-lowest rounded-lg p-sm text-center">
                  <p className="font-headline-md text-headline-md text-primary">
                    {PLAN_LIMITS[plan.id as keyof typeof PLAN_LIMITS]?.photos || "—"}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Fotos</p>
                </div>
                <div className="flex-1 bg-surface-container-lowest rounded-lg p-sm text-center">
                  <p className="font-headline-md text-headline-md text-on-surface-variant">
                    {PLAN_LIMITS[plan.id as keyof typeof PLAN_LIMITS]?.videos || "—"}
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Vídeos</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-sm mb-xl">
                {plan.features.map((feat) => (
                  <li
                    key={feat}
                    className={`flex items-center gap-sm font-body-md text-body-md ${
                      plan.id === "beta" ? "" : "text-on-surface-variant/70"
                    }`}
                  >
                    {plan.id === "beta" ? CHECK : DOT}
                    {feat}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              {plan.id === "beta" ? (
                <button
                  disabled
                  className="w-full py-md rounded-xl bg-primary/50 text-on-primary font-headline-md text-headline-md cursor-not-allowed opacity-60"
                >
                  Plan Actual
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id as "standard" | "pro")}
                  disabled={loading || selectedPlan === plan.id}
                  className="w-full py-md rounded-xl bg-primary text-on-primary font-headline-md text-headline-md hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-sm"
                >
                  {loading && selectedPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Actualizar a " + plan.name
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
