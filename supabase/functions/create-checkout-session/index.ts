// supabase/functions/create-checkout-session/index.ts
// Crea una sesión de Stripe Checkout para suscripción
//
// Variables de entorno requeridas:
//   STRIPE_SECRET_KEY      — Clave secreta de Stripe
//   SITE_URL               — URL pública del sitio

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "https://tuesdi-artist-platform.vercel.app",
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

    // S-02 FIX: Verificar que el caller es el propietario del artista
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No autorizado: falta token de autenticación" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Crear cliente con el token del usuario (no service role) para verificar identidad
    const anonSupabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user: caller }, error: authError } = await anonSupabase.auth.getUser();
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Sesión inválida o expirada" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { priceId, plan, artistId } = await req.json();

    if (!priceId || !plan || !artistId) {
      return new Response(
        JSON.stringify({ error: "priceId, plan y artistId son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obtener datos del artista
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .select("id, artist_name, user_id")
      .eq("id", artistId)
      .single();

    if (artistError || !artist) {
      return new Response(
        JSON.stringify({ error: "Artista no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // S-02 FIX: Verificar que el caller es el propietario del artista
    if (artist.user_id !== caller.id) {
      return new Response(
        JSON.stringify({ error: "No autorizado: no eres el propietario de este perfil" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const user = caller;

    // Obtener o crear customer en Stripe
    let customerId: string;
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("artist_id", artistId)
      .single();

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
          name: artist.artist_name,
          metadata: JSON.stringify({ artist_id: artistId }),
        }).toString(),
      });

      if (!customerResponse.ok) {
        throw new Error(`Error creando customer en Stripe: ${await customerResponse.text()}`);
      }

      const customer = await customerResponse.json();
      customerId = customer.id;

      // Guardar customer_id en Supabase
      await supabase
        .from("subscriptions")
        .upsert({
          artist_id: artistId,
          stripe_customer_id: customerId,
          plan,
          status: "active",
        }, { onConflict: "artist_id" });
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
        metadata: JSON.stringify({ artist_id: artistId, plan }),
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
