// supabase/functions/create-checkout-session/index.ts
// Crea una sesión de Stripe Checkout para suscripción
//
// Variables de entorno requeridas:
//   STRIPE_SECRET_KEY      — Clave secreta de Stripe
//   SITE_URL               — URL pública del sitio

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecret = getRequiredEnv("STRIPE_SECRET_KEY");
    const siteUrl = getRequiredEnv("SITE_URL");
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseServiceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { priceId, plan, artistId } = await req.json();

    if (!priceId || !plan || !artistId) {
      return new Response(
        JSON.stringify({ error: "priceId, plan y artistId son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // En el esquema real, el perfil del artista ES el usuario (profiles.id = auth.users.id)
    const { data: artist, error: artistError } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("id", artistId)
      .single();

    if (artistError || !artist) {
      return new Response(
        JSON.stringify({ error: "Artista no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar que el usuario existe en auth (artistId === user_id)
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(artistId);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuario no autorizado" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obtener o crear customer en Stripe (subscriptions usa user_id, no artist_id)
    let customerId: string;
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", artistId)
      .maybeSingle();

    if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      // Crear nuevo customer
      const customerResponse = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecret}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: user.email || "",
          name: artist.display_name ?? "",
          metadata: JSON.stringify({ user_id: artistId }),
        }).toString(),
      });

      if (!customerResponse.ok) {
        throw new Error(`Error creando customer en Stripe: ${await customerResponse.text()}`);
      }

      const customer = await customerResponse.json();
      customerId = customer.id;

      // Guardar customer_id en Supabase
      const { data: existingSub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", artistId)
        .maybeSingle();

      if (existingSub) {
        await supabase
          .from("subscriptions")
          .update({ stripe_customer_id: customerId, plan })
          .eq("user_id", artistId);
      } else {
        await supabase
          .from("subscriptions")
          .insert({ user_id: artistId, stripe_customer_id: customerId, plan, status: "active" });
      }
    }

    // Crear sesión de Checkout
    const checkoutResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        customer: customerId,
        line_items: JSON.stringify([{ price: priceId, quantity: 1 }]),
        mode: "subscription",
        success_url: `${siteUrl}/dashboard?success=true`,
        cancel_url: `${siteUrl}/planes?canceled=true`,
        metadata: JSON.stringify({ user_id: artistId, plan }),
      }).toString(),
    });

    if (!checkoutResponse.ok) {
      throw new Error(`Error creando sesión de Checkout: ${await checkoutResponse.text()}`);
    }

    const session = await checkoutResponse.json();

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in create-checkout-session:", error);
    return new Response(
      JSON.stringify({ error: "Error creando sesión de pago" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
