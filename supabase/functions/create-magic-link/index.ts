// supabase/functions/create-magic-link/index.ts
// Genera y envía el Magic Link de forma segura en el servidor.
// El token es un HMAC-SHA256, nunca calculado en el cliente.
//
// Variables de entorno requeridas en Supabase Dashboard → Settings → Edge Functions:
//   MAGIC_LINK_SECRET   — string aleatorio, mín. 32 chars (openssl rand -hex 32)
//   RESEND_API_KEY      — API key de Resend.com para envío de emails
//   SITE_URL            — URL pública del sitio (ej: https://tuesdi-artist-platform.vercel.app)

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

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validar env vars primero
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseServiceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const magicLinkSecret = getRequiredEnv("MAGIC_LINK_SECRET");
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // --- Leer y validar body ---
    const body = await req.json();
    const { eventId, email, promoterName, siteUrl: clientSiteUrl } = body;

    if (!eventId || typeof eventId !== "string") {
      return new Response(
        JSON.stringify({ error: "eventId es requerido y debe ser un string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "email es requerido y debe ser válido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ AHORA SÍ: clientSiteUrl ya está definido
    const siteUrl = clientSiteUrl || Deno.env.get("SITE_URL") || "https://tuesdi-artist-platform.vercel.app";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- Validar que el evento existe y está en estado pending ---
    const { data: eventData, error: eventCheckError } = await supabase
      .from("events")
      .select("id, status, organizer_email")
      .eq("id", eventId)
      .maybeSingle();

    if (eventCheckError) {
      throw eventCheckError;
    }

    if (!eventData) {
      return new Response(
        JSON.stringify({ error: "Evento no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (eventData.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Este evento ya fue procesado" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar que el email solicitante coincide con el del evento
    if (eventData.organizer_email && eventData.organizer_email !== email) {
      return new Response(
        JSON.stringify({ error: "El email no coincide con el organizador del evento" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Invalidar magic links previos para este evento (evita acumulación) ---
    const { error: invalidateError } = await supabase
      .from("magic_links")
      .update({ used: true })
      .eq("event_id", eventId)
      .eq("used", false);

    if (invalidateError) {
      console.error("Error invalidando links previos:", invalidateError);
      // No lanzamos error aquí; es no-crítico
    }

    // --- Generar token seguro ---
    const timestamp = Date.now().toString();
    const payload = `${eventId}:${email}:${timestamp}`;

    // HMAC-SHA256 usando Web Crypto API (disponible en Deno)
    const encoder = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(magicLinkSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
    const signature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Token = base64url(payload) + "." + signature
    const tokenPayload = btoa(payload)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    const token = `${tokenPayload}.${signature}`;

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min

    // --- Guardar en Supabase con service role (bypass RLS) ---
    const { error: insertError } = await supabase
      .from("magic_links")
      .insert({
        event_id: eventId,
        token_hash: signature,   // guardamos solo el hash, no el token completo
        email,
        expires_at: expiresAt,
        used: false,
      });

    if (insertError) throw insertError;

    // --- Construir el enlace de confirmación ---
    const confirmUrl = `${siteUrl}/confirmar-evento/${token}`;

    // --- Enviar email con Resend ---
    if (resendKey) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TUESDI <onboarding@resend.dev>",
          to: [email],
          subject: "Confirma tu evento en TUESDI",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#0081FF">¡Hola${promoterName ? `, ${promoterName}` : ""}!</h2>
              <p>Tu evento ha sido recibido. Para publicarlo, confirma haciendo clic en el enlace:</p>
              <a href="${confirmUrl}"
                 style="display:inline-block;background:#0081FF;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">
                Confirmar y publicar evento
              </a>
              <p style="color:#666;font-size:13px">Este enlace caduca en 30 minutos. Si no solicitaste publicar un evento, ignora este mensaje.</p>
            </div>
          `,
        }),
      });

      if (!resendResponse.ok) {
        const resendError = await resendResponse.text();
        console.error("Error enviando email con Resend:", resendError);
        // No lanzamos error; el token ya está creado y el usuario puede reenviar
      }
    } else {
      console.warn("RESEND_API_KEY no configurada. Email no enviado, pero token generado.");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("create-magic-link error:", error);

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
