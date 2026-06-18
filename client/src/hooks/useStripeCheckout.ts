/**
 * useStripeCheckout — Hook para manejar sesiones de Stripe Checkout
 * Integra con la Edge Function create-checkout-session
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface CheckoutOptions {
  priceId: string;
  plan: "standard" | "pro";
  artistId: string;
}

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (options: CheckoutOptions) => {
    setLoading(true);
    setError(null);

    try {
      // Llamar a la Edge Function
      const response = await supabase.functions.invoke("create-checkout-session", {
        body: {
          priceId: options.priceId,
          plan: options.plan,
          artistId: options.artistId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Error creando sesión de pago");
      }

      const { url } = response.data;

      // Redirigir a Stripe Checkout
      if (url) {
        window.location.href = url;
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      console.error("Error en createCheckoutSession:", err);
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
    error,
  };
}
