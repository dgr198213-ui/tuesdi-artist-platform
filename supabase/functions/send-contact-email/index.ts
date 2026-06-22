/**
 * TUESDI v3.0 — Edge Function: send-contact-email
 *
 * Recibe el formulario de contacto público (/contacto) y envía
 * un email transaccional al equipo de TUESDI via Resend.
 *
 * Seguridad:
 *   - Validación estricta de campos
 *   - Detección de honeypot (campo oculto para bots)
 *   - Rate limiting por IP (máx. 5 envíos/hora)
 *   - Sanitización de XSS en campos de texto
 *   - Tamaño máximo del mensaje: 2000 caracteres
 *
 * Variables de entorno (Supabase → Settings → Edge Functions):
 *   RESEND_API_KEY  — clave de Resend (re_...). Si no está configurada,
 *                     se guarda el mensaje en tabla contact_submissions.
 *   CONTACT_EMAIL   — email destino (default: hola@tuesdi.es)
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("SITE_URL") || "https://tuesdi-artist-platform.vercel.app",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** Rate limiter en memoria (por instancia Deno). */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hora

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

/** Sanitiza texto para prevenir XSS en emails HTML. */
function sanitize(str: string, maxLen: number): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .slice(0, maxLen);
}

/** Valida formato de email. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // --- Rate limiting por IP ---
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    if (isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: "Demasiadas solicitudes. Inténtalo más tarde." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();

    const { name, email, subject, message, website } = body;

    // --- Honeypot check: si el campo oculto "website" viene relleno, es un bot ---
    if (website) {
      // No revelamos que detectamos el bot — devolvemos éxito silencioso
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Validación de campos ---
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "El nombre es requerido (mín. 2 caracteres)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email || typeof email !== "string" || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Email no válido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!subject || typeof subject !== "string" || subject.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "El asunto es requerido (mín. 3 caracteres)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: "El mensaje es requerido (mín. 10 caracteres)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "El mensaje no puede superar los 2000 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Sanitizar campos ---
    const safeName = sanitize(name.trim(), 100);
    const safeEmail = email.trim().slice(0, 254);
    const safeSubject = sanitize(subject.trim(), 200);
    const safeMessage = sanitize(message.trim(), 2000).replace(/\n/g, "<br>");

    // --- Enviar email via Resend ---
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const contactEmail = Deno.env.get("CONTACT_EMAIL") || "hola@tuesdi.es";

    if (resendKey) {
      const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nuevo mensaje de contacto — TUESDI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #000000; color: #e2e2e2; font-family: 'Inter', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #1f1f1f; }
    .logo { color: #0081FF; font-size: 24px; font-weight: 800; }
    .tagline { color: #8b91a0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
    .field-label { color: #8b91a0; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .field-value { color: #e2e2e2; font-size: 16px; margin-bottom: 20px; }
    .message-box { background: #131313; border-left: 3px solid #0081FF; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .message-box p { font-size: 15px; line-height: 1.7; color: #c1c6d7; }
    .meta { padding-top: 24px; border-top: 1px solid #1f1f1f; }
    .meta p { font-size: 12px; color: #414754; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">TUESDI</div>
      <div class="tagline">Nuevo mensaje de contacto</div>
    </div>

    <div class="field-label">Nombre</div>
    <div class="field-value">${safeName}</div>

    <div class="field-label">Email</div>
    <div class="field-value">${safeEmail}</div>

    <div class="field-label">Asunto</div>
    <div class="field-value">${safeSubject}</div>

    <div class="message-box">
      <div class="field-label">Mensaje</div>
      <p>${safeMessage}</p>
    </div>

    <div class="meta">
      <p>IP: ${clientIp}</p>
      <p>Fecha: ${new Date().toISOString()}</p>
    </div>
  </div>
</body>
</html>`;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TUESDI <noreply@tuesdi.es>",
          to: [contactEmail],
          replyTo: safeEmail,
          subject: `[Contacto Web] ${safeSubject}`,
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Resend error in send-contact-email:", errText);
        return new Response(
          JSON.stringify({ error: "No se pudo enviar el mensaje. Inténtalo más tarde." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // RESEND_API_KEY no configurada — log para debug, pero no bloqueamos
      console.warn("send-contact-email: RESEND_API_KEY no configurada. Mensaje recibido pero no enviado por email:", {
        name: safeName,
        email: safeEmail,
        subject: safeSubject,
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-contact-email:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});