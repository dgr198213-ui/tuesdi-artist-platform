// supabase/functions/confirm-event/index.ts
// Valida el Magic Link (HMAC-SHA256) generado por create-magic-link,
// marca el evento como "published" y el enlace como usado.
//
// Variables de entorno requeridas (Supabase Dashboard -> Edge Functions -> Secrets):
//   MAGIC_LINK_SECRET   — el MISMO secreto usado en create-magic-link
//   (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase automáticamente)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token || typeof token !== "string" || !token.includes(".")) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const [tokenPayload, signature] = token.split(".");

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

    // --- Verificar firma HMAC ---
    const secret = Deno.env.get("MAGIC_LINK_SECRET");
    if (!secret) throw new Error("MAGIC_LINK_SECRET no configurado");

    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== signature) {
      return new Response(
        JSON.stringify({ error: "Token inválido o manipulado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
    // CORRECCIÓN v3.0.1: status debe ser "approved" (el CHECK constraint
    // solo permite 'pending', 'approved', 'rejected', 'expired').
    // Antes usaba "published" que causaba error de constraint.
    // También se elimina updated_at porque la tabla events no tiene esa columna.
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .update({ status: "approved" })
      .eq("id", eventId)
      .select()
      .single();

    if (eventError || !eventData) {
      throw eventError || new Error("No se pudo actualizar el evento");
    }

    // --- Marcar el enlace como usado ---
    await supabase
      .from("magic_links")
      .update({ used: true })
      .eq("id", linkData.id);

    return new Response(
      JSON.stringify({ success: true, event: eventData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in confirm-event:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
