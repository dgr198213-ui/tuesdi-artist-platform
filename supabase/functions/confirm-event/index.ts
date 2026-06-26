// supabase/functions/confirm-event/index.ts
// Valida el Magic Link (HMAC-SHA256) generado por create-magic-link,
// marca el evento como "approved" y el enlace como usado.
//
// Variables de entorno requeridas (Supabase Dashboard -> Edge Functions -> Secrets):
// MAGIC_LINK_SECRET — el MISMO secreto usado en create-magic-link
// (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase automáticamente)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "https://tuesdi-artist-platform.vercel.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Lee una variable de entorno requerida o lanza error descriptivo. */
function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Variable de entorno requerida: ${key} no está configurada.`);
  return value;
}

/** Comparación constante en tiempo para evitar timing attacks.
 *  Compatible con Supabase Edge Runtime (Deno). */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validar todas las env vars al inicio, antes de cualquier operación
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseServiceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const magicLinkSecret = getRequiredEnv("MAGIC_LINK_SECRET");

    const { token } = await req.json();

    if (!token || typeof token !== "string" || !token.includes(".")) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Validar que el token tenga exactamente dos partes ---
    const parts = token.split(".");
    if (parts.length !== 2) {
      return new Response(
        JSON.stringify({ error: "Formato de token inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const [tokenPayload, signature] = parts;

    // --- Decodificar el payload (base64url) ---
    let payload: string;
    try {
      const base64 = tokenPayload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
      payload = atob(padded);
    } catch {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [eventId, email, timestamp] = payload.split(":");
    if (!eventId || !email || !timestamp) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Validar que el timestamp sea un número válido ---
    const issuedAt = Number(timestamp);
    if (!Number.isFinite(issuedAt)) {
      return new Response(
        JSON.stringify({ error: "Timestamp inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar que el timestamp del token no es más antiguo que 35 minutos
    // (el token expira en 30 min, damos 5 min de margen por relojes desincronizados)
    const tokenAge = Date.now() - issuedAt;
    if (tokenAge > 35 * 60 * 1000) {
      return new Response(
        JSON.stringify({ error: "El enlace ha caducado." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Verificar firma HMAC ---
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(magicLinkSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Comparación constante en tiempo personalizada (compatible con Edge Runtime)
    const sigBuf = new TextEncoder().encode(signature);
    const expectedBuf = new TextEncoder().encode(expectedSignature);
    if (!timingSafeEqual(sigBuf, expectedBuf)) {
      return new Response(
        JSON.stringify({ error: "Token inválido o manipulado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- Buscar el magic link ---
    const { data: linkData, error: linkError } = await supabase
      .from("magic_links")
      .select("*")
      .eq("token_hash", signature)
      .eq("event_id", eventId)
      .eq("email", email)
      .maybeSingle();

    if (linkError || !linkData) {
      return new Response(
        JSON.stringify({ error: "Enlace no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (linkData.used) {
      return new Response(
        JSON.stringify({ error: "Este enlace ya fue utilizado anteriormente" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (new Date(linkData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "El enlace ha caducado. Vuelve a publicar el evento para recibir uno nuevo." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Publicar el evento ---
    // CORRECCIÓN: usamos .maybeSingle() para evitar error 500 si el evento no existe.
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .update({ status: "approved" })
      .eq("id", eventId)
      .select()
      .maybeSingle();

    if (eventError) {
      throw eventError;
    }

    if (!eventData) {
      return new Response(
        JSON.stringify({ error: "Evento no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Marcar el enlace como usado ---
    const { error: updateMagicError } = await supabase
      .from("magic_links")
      .update({ used: true })
      .eq("id", linkData.id);

    if (updateMagicError) {
      throw updateMagicError;
    }

    return new Response(
      JSON.stringify({ success: true, event: eventData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    // Registro detallado del error real en los logs
    console.error("confirm-event error:", error);

    // En desarrollo devolvemos el mensaje y stack para facilitar debugging.
    // En producción puedes cambiar esto a un mensaje genérico.
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
