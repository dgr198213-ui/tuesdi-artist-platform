// supabase/functions/create-magic-link/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateToken } from "../_shared/magic-token.ts";

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
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseServiceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const magicLinkSecret = getRequiredEnv("MAGIC_LINK_SECRET");
    const resendKey = Deno.env.get("RESEND_API_KEY");

    // SEGURIDAD (C-1): el siteUrl SIEMPRE viene de entorno, nunca del cliente.
    // Aceptar el siteUrl del cliente permitiría phishing con la marca TUESDI.
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://tuesdi.com";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { eventId, email, promoterName } = await req.json();

    if (!eventId || !email) {
      return new Response(JSON.stringify({ error: "eventId y email son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: eventData, error: eventCheckError } = await supabase
      .from("events").select("id, status, organizer_email").eq("id", eventId).single();

    if (eventCheckError || !eventData) {
      return new Response(JSON.stringify({ error: "Evento no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (eventData.status !== "pending") {
      return new Response(JSON.stringify({ error: "Este evento ya fue procesado" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (eventData.organizer_email && eventData.organizer_email !== email) {
      return new Response(JSON.stringify({ error: "El email no coincide con el organizador" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Generación de token con firma HMAC (lógica pura, testeada en _shared)
    const { token, expiresAt } = await generateToken(eventId, email, magicLinkSecret);
    const signature = token.slice(token.lastIndexOf(".") + 1);

    const { error: insertError } = await supabase.from("magic_links").insert({
      event_id: eventId, token_hash: signature, email, expires_at: expiresAt, used: false,
    });
    if (insertError) throw insertError;

    const confirmUrl = `${siteUrl}/confirmar-evento/${token}`;

    if (resendKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "TUESDI <noreply@tuesdi.com>",
          to: [email],
          subject: "Confirma tu evento en TUESDI",
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px"><h2 style="color:#0081FF">¡Hola${promoterName ? `, ${promoterName}` : ""}!</h2><p>Tu evento ha sido recibido. Para publicarlo, confirma haciendo clic:</p><a href="${confirmUrl}" style="display:inline-block;background:#0081FF;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">Confirmar y publicar evento</a><p style="color:#666;font-size:13px">Este enlace caduca en 30 minutos.</p></div>`,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("Resend error:", errText);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    // Error real solo en logs, nunca al cliente (C-3)
    console.error("Error in create-magic-link:", error);
    return new Response(JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
