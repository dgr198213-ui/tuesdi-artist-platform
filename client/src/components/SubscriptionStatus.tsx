/**
 * SubscriptionStatus — Componente para mostrar el estado de suscripción
 * Muestra plan actual, fecha de renovación y opciones de gestión
 */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { PLAN_UI_VALUE } from "@/lib/constants";

interface SubscriptionData {
  plan: "beta" | "standard" | "pro";
  status: "active" | "canceled" | "past_due" | "paused";
  currentPeriodEnd?: string;
  canceledAt?: string;
  stripeCustomerId?: string;
}

interface SubscriptionStatusProps {
  artistId: string;
}

export default function SubscriptionStatus({ artistId }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("subscriptions")
          .select("plan, status, current_period_end, cancel_at, stripe_customer_id")
          .eq("user_id", artistId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        if (data) {
          setSubscription({
            plan: (PLAN_UI_VALUE[data.plan] as SubscriptionData["plan"]) || "beta",
            status: (data.status as SubscriptionData["status"]) || "active",
            currentPeriodEnd: data.current_period_end ?? undefined,
            canceledAt: data.cancel_at ?? undefined,
            stripeCustomerId: data.stripe_customer_id ?? undefined,
          });
        } else {
          // Sin suscripción = plan beta
          setSubscription({
            plan: "beta",
            status: "active",
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error cargando suscripción";
        setError(message);
        console.error("Error fetching subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [artistId, supabase]);

  if (loading) {
    return (
      <div className="glass-card rounded-lg p-md animate-pulse">
        <div className="h-4 bg-surface-container-highest rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-surface-container-highest rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-lg p-md border-l-4 border-error bg-error/5">
        <div className="flex items-start gap-md">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="font-label-sm text-label-sm text-error uppercase tracking-widest">
              Error
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const planLabels = {
    beta: "Plan Beta (Gratuito)",
    standard: "Plan Standard",
    pro: "Plan Pro",
  };

  const statusLabels = {
    active: "Activo",
    canceled: "Cancelado",
    past_due: "Pago Pendiente",
    paused: "Pausado",
  };

  const statusColors = {
    active: "text-success bg-success/10 border-success/30",
    canceled: "text-warning bg-warning/10 border-warning/30",
    past_due: "text-error bg-error/10 border-error/30",
    paused: "text-outline bg-outline/10 border-outline/30",
  };

  const statusIcons = {
    active: <CheckCircle className="w-4 h-4" />,
    canceled: <AlertCircle className="w-4 h-4" />,
    past_due: <AlertCircle className="w-4 h-4" />,
    paused: <Clock className="w-4 h-4" />,
  };

  return (
    <div className="glass-card rounded-lg p-md border-l-4 border-primary/30">
      <div className="flex items-start justify-between gap-md">
        <div className="flex-1">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">
            Suscripción Actual
          </p>
          <p className="font-headline-md text-headline-md text-on-surface mb-sm">
            {planLabels[subscription.plan]}
          </p>

          <div className={`inline-flex items-center gap-xs px-sm py-xs rounded-full border ${statusColors[subscription.status]}`}>
            {statusIcons[subscription.status]}
            <span className="font-label-sm text-label-sm">
              {statusLabels[subscription.status]}
            </span>
          </div>

          {subscription.currentPeriodEnd && subscription.status === "active" && (
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-md">
              Próxima renovación:{" "}
              <strong>
                {format(new Date(subscription.currentPeriodEnd), "d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </strong>
            </p>
          )}

          {subscription.canceledAt && (
            <p className="font-body-sm text-body-sm text-warning mt-md">
              Cancelado el{" "}
              <strong>
                {format(new Date(subscription.canceledAt), "d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </strong>
            </p>
          )}
        </div>

        {subscription.plan !== "beta" && subscription.status === "active" && (
          <a
            href={`https://billing.stripe.com/p/login/${subscription.stripeCustomerId || ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-md py-sm rounded-lg bg-primary/10 text-primary font-label-sm text-label-sm hover:bg-primary/20 transition-colors shrink-0"
          >
            Gestionar
          </a>
        )}
      </div>
    </div>
  );
}
