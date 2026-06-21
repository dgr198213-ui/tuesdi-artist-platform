// supabase/functions/contact-artist/index.ts
// Formulario "Contactar Artista" en /artista/:slug — visitante anónimo,
// sin cuenta, con honeypot + rate limiting (mismo patrón que submit-event).
// Notifica por email al artista via Resend si está configurado.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IP_LIMIT_PER_DAY = 10;
const EMAIL_LIMIT_PER_DAY = 5;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://tuesdi-artist-platform.vercel.app";
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { artistId, name, email, subject, message, website } = body;

    // Honeypot
    if (website) {
      console.warn("Honeypot activado en contact-artist");
      return json({ success: true });
    }

    if (!artistId || !name || !email || !message) {
      return json({ error: "Faltan campos requeridos (nombre, email, mensaje)" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ error: "Email no válido" }, 400);
    }

    if (String(message).length > 2000) {
      return json({ error: "El mensaje no puede superar los 2000 caracteres" }, 400);
    }

    // Rate limiting (reutiliza event_submission_log, genérico por IP/email)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("cf-connecting-ip") ?? "unknown";
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count: ipCount } = await supabase
      .from("event_submission_log").select("id", { count: "exact", head: true })
      .eq("ip", ip).gte("created_at", oneDayAgo);
    if ((ipCount ?? 0) >= IP_LIMIT_PER_DAY) {
      return json({ error: "Límite de mensajes alcanzado por hoy. Inténtalo mañana." }, 429);
    }

    const { count: emailCount } = await supabase
      .from("event_submission_log").select("id", { count: "exact", head: true })
      .eq("email", email).gte("created_at", oneDayAgo);
    if ((emailCount ?? 0) >= EMAIL_LIMIT_PER_DAY) {
      return json({ error: "Límite de mensajes alcanzado para este email hoy." }, 429);
    }

    // Verificar que el artista existe y está publicado
    const { data: artist, error: artistError } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("id", artistId)
      .eq("is_published", true)
      .maybeSingle();

    if (artistError || !artist) {
      return json({ error: "Artista no encontrado" }, 404);
    }

    const { error: insertError } = await supabase.from("messages").insert({
      sender_id: null,
      recipient_id: artistId,
      sender_name: name,
      sender_email: email,
      subject: subject || null,
      body: message,
      is_read: false,
    });

    if (insertError) {
      console.error("Error insertando mensaje:", insertError);
      return json({ error: "No se pudo enviar el mensaje" }, 500);
    }

    await supabase.from("event_submission_log").insert({ ip, email });

    // Notificar al artista por email (best-effort, no bloquea la respuesta)
    if (resendKey) {
      const { data: { user } } = await supabase.auth.admin.getUserById(artistId);
      if (user?.email) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "TUESDI <noreply@tuesdi.es>",
            to: [user.email],
            subject: `Nuevo mensaje de ${name} en TUESDI`,
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="color:#f59e0b">Tienes un nuevo mensaje</h2>
              <p><strong>${name}</strong> (${email}) te ha escrito${subject ? `: "${subject}"` : ""}.</p>
              <p style="white-space:pre-line;background:#f5f5f5;padding:12px;border-radius:8px">${message}</p>
              <a href="${siteUrl}/dashboard/contactos" style="display:inline-block;background:#f59e0b;color:#08080f;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px">Ver en mi panel</a>
            </div>`,
          }),
        }).catch(() => {});
      }
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error in contact-artist:", error);
    return json({ error: "Error interno del servidor" }, 500);
  }
});
