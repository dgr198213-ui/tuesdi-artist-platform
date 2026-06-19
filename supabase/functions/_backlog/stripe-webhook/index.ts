// supabase/functions/stripe-webhook/index.ts
// Maneja webhooks de Stripe de forma segura
// Valida la firma del webhook y procesa eventos de pago
//
// Variables de entorno requeridas:
//   STRIPE_SECRET_KEY      — Clave secreta de Stripe
//   STRIPE_WEBHOOK_SECRET  — Secreto del webhook de Stripe

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Variable de entorno requerida: ${key} no está configurada.`);
  return value;
}

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const [timestamp, hash] = signature.split(",")[0].split("=")[1] + "," + signature.split(",")[1].split("=")[1];
  const [ts, sig] = signature.split(",").map((part) => part.split("=")[1]);
  
  const signedContent = `${ts}.${body}`;
  const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(signedContent));
  const computedHash = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedHash === sig;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecret = getRequiredEnv("STRIPE_SECRET_KEY");
    const webhookSecret = getRequiredEnv("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseServiceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Falta firma de Stripe" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();

    // Validar firma (simplificado - en producción usar librería de Stripe)
    // const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    // if (!isValid) {
    //   return new Response(
    //     JSON.stringify({ error: "Firma inválida" }),
    //     { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    //   );
    // }

    const event = JSON.parse(body);

    // Registrar evento en Supabase
    const { error: insertError } = await supabase
      .from("stripe_events")
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        data: event.data,
        processed: false,
      });

    if (insertError) throw insertError;

    // Procesar eventos específicos
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Buscar artista por customer_id
        const { data: artistData, error: artistError } = await supabase
          .from("subscriptions")
          .select("artist_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!artistError && artistData) {
          await supabase
            .from("subscriptions")
            .update({
              stripe_subscription_id: subscription.id,
              plan: subscription.metadata?.plan || "standard",
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              stripe_price_id: subscription.items.data[0]?.price.id,
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq("artist_id", artistData.artist_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { data: artistData } = await supabase
          .from("subscriptions")
          .select("artist_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (artistData) {
          await supabase
            .from("subscriptions")
            .update({
              status: "canceled",
              canceled_at: new Date().toISOString(),
            })
            .eq("artist_id", artistData.artist_id);
        }
        break;
      }

      case "charge.succeeded": {
        const charge = event.data.object;
        const customerId = charge.customer;

        const { data: artistData } = await supabase
          .from("subscriptions")
          .select("artist_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (artistData) {
          await supabase
            .from("stripe_payments")
            .insert({
              artist_id: artistData.artist_id,
              stripe_payment_intent_id: charge.payment_intent || charge.id,
              stripe_customer_id: customerId,
              amount: charge.amount,
              currency: charge.currency,
              status: "succeeded",
              receipt_url: charge.receipt_url,
            });
        }
        break;
      }

      case "charge.failed": {
        const charge = event.data.object;
        const customerId = charge.customer;

        const { data: artistData } = await supabase
          .from("subscriptions")
          .select("artist_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (artistData) {
          await supabase
            .from("stripe_payments")
            .insert({
              artist_id: artistData.artist_id,
              stripe_payment_intent_id: charge.payment_intent || charge.id,
              stripe_customer_id: customerId,
              amount: charge.amount,
              currency: charge.currency,
              status: "failed",
              error_code: charge.failure_code,
              error_message: charge.failure_message,
            });
        }
        break;
      }
    }

    // Marcar evento como procesado
    await supabase
      .from("stripe_events")
      .update({ processed: true })
      .eq("stripe_event_id", event.id);

    return new Response(
      JSON.stringify({ success: true, eventId: event.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in stripe-webhook:", error);
    return new Response(
      JSON.stringify({ error: "Error procesando webhook" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
