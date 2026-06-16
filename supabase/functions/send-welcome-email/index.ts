/**
 * TUESDI v3.0 — Edge Function: send-welcome-email
 *
 * Se invoca desde el cliente justo después de que Supabase valida
 * el Magic Link y la sesión queda activa (en /dashboard, useEffect).
 *
 * Envía el email transaccional de bienvenida via Resend.
 *
 * Secrets requeridos (Supabase → Edge Functions → Secrets):
 *   RESEND_API_KEY — clave de Resend (re_...)
 *   SITE_URL       — https://tuesdi-artist-platform.vercel.app
 */

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
    const { email, artist_name } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "email valido requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitizar artist_name para prevenir XSS en la plantilla HTML
    const safeName = artist_name
      ? String(artist_name).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").slice(0, 100)
      : null;

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SITE_URL = Deno.env.get("SITE_URL") || "https://tuesdi-artist-platform.vercel.app";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY no configurado");
    }

    const greeting = safeName ? `Hola, ${safeName}.` : "Hola, artista.";

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tu escenario en TUESDI ya está listo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #000000; color: #e2e2e2; font-family: 'Inter', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 24px; }
    .header { text-align: center; padding-bottom: 40px; border-bottom: 1px solid #1f1f1f; }
    .logo { color: #0081FF; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .tagline { color: #8b91a0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
    .body { padding: 40px 0; }
    .greeting { font-size: 20px; font-weight: 700; color: #e2e2e2; margin-bottom: 24px; }
    p { font-size: 16px; line-height: 1.7; color: #c1c6d7; margin-bottom: 16px; }
    .highlight { color: #00DBFF; font-weight: 600; }
    .rules { background: #131313; border-left: 3px solid #0081FF; border-radius: 8px; padding: 24px; margin: 32px 0; }
    .rules h3 { color: #0081FF; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
    .rule { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .rule-icon { color: #00DBFF; font-size: 16px; margin-top: 2px; flex-shrink: 0; }
    .rule-text { font-size: 14px; color: #c1c6d7; line-height: 1.5; }
    .cta { text-align: center; margin: 40px 0; }
    .cta-button {
      display: inline-block;
      background: #0081FF;
      color: #ffffff;
      text-decoration: none;
      font-weight: 700;
      font-size: 16px;
      padding: 16px 40px;
      border-radius: 12px;
      letter-spacing: 0.3px;
    }
    .quote { text-align: center; padding: 32px 0; border-top: 1px solid #1f1f1f; }
    .quote-text { font-size: 18px; font-style: italic; color: #0081FF; font-weight: 600; }
    .footer { text-align: center; padding-top: 32px; border-top: 1px solid #1f1f1f; }
    .footer p { font-size: 12px; color: #414754; margin-bottom: 8px; }
    .footer a { color: #414754; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">TUESDI</div>
      <div class="tagline">Tu Escenario Digital</div>
    </div>

    <div class="body">
      <p class="greeting">${greeting}</p>

      <p>
        Acabas de dar el paso clave para proteger tu independencia profesional.
        Tu perfil en TUESDI ya está activo. A partir de ahora, cuentas con un
        escaparate diseñado exclusivamente para que te encuentren los organizadores
        de eventos, salas y entidades culturales que buscan tu trabajo en vivo.
      </p>

      <div class="rules">
        <h3>Nuestras líneas rojas</h3>
        <div class="rule">
          <span class="rule-icon">✕</span>
          <span class="rule-text"><strong>Nadie se quedará con un porcentaje de tu caché.</strong> Cada euro que cobres es tuyo.</span>
        </div>
        <div class="rule">
          <span class="rule-icon">✕</span>
          <span class="rule-text"><strong>Tus datos personales jamás serán públicos.</strong> Teléfono, email y dirección permanecen privados.</span>
        </div>
        <div class="rule">
          <span class="rule-icon">✕</span>
          <span class="rule-text"><strong>No perderás el tiempo atendiendo bandejas de chat.</strong> Quien valore tu arte, te escribirá en serio.</span>
        </div>
      </div>

      <p>
        El siguiente paso es completar tu perfil: añade tu nombre artístico, categoría,
        biografía y una fotografía. Cuanto más completo esté,
        <span class="highlight">más fácil será que los organizadores correctos te encuentren.</span>
      </p>

      <div class="cta">
        <a href="${SITE_URL}/dashboard/perfil" class="cta-button">
          Completar Mi Perfil →
        </a>
      </div>

      <p style="font-size: 14px; color: #8b91a0;">
        Recuerda: durante la Beta Abierta, tienes acceso completo a todo TUESDI de forma gratuita.
        Los perfiles creados ahora se mantienen siempre. Nunca se borra nada.
      </p>
    </div>

    <div class="quote">
      <p class="quote-text">"Quien valore tu arte, te escribirá en serio."</p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} TUESDI — Tu Escenario Digital</p>
      <p>
        <a href="${SITE_URL}/politica-privacidad">Política de Privacidad</a> ·
        <a href="${SITE_URL}/terminos-servicio">Términos</a>
      </p>
      <p>Recibes este email porque creaste una cuenta en TUESDI.</p>
    </div>
  </div>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TUESDI <noreply@tuesdi.es>",
        to: [email],
        subject: "⚡ Tu escenario en TUESDI ya está listo. Toma el control.",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", err);
      // No bloqueamos al usuario si el email falla — el perfil sigue activo
      return new Response(JSON.stringify({ success: false, error: err }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in send-welcome-email:", error);
    return new Response(JSON.stringify({ error: "Error interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
