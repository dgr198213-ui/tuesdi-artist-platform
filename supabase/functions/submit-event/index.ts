// supabase/functions/submit-event/index.ts
// Opción C: publicación de evento sin cuenta, con validación por email.
// El token incluye el eventId para reutilizar la ruta /confirmar-evento/:token

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IP_LIMIT_PER_DAY = 5;
const EMAIL_LIMIT_PER_MONTH = 10;
const VERIFICATION_WINDOW_HOURS = 24;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomHex(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const siteUrl = Deno.env.get("SITE_URL") ?? "https://tuesdi-artist-platform.vercel.app";
    const resendKey = Deno.env.get("TUESDI_PROD_KEY") || Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await req.json();
    const {
      title, description, category, date, location, city,
      budget_min, budget_max, image_url,
      organizer_email, organizer_name,
      website, // honeypot
    } = body;

    if (website) {
      console.warn("Honeypot activado");
      return json({ success: true });
    }

    if (!title || !date || !location || !organizer_email) {
      return json({ error: "Faltan campos requeridos (título, fecha, lugar, email)" }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(organizer_email)) {
      return json({ error: "Email no válido" }, 400);
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("cf-connecting-ip") ?? "unknown";
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { count: ipCount } = await supabase
      .from("event_submission_log").select("id", { count: "exact", head: true })
      .eq("ip", ip).gte("created_at", oneDayAgo);
    if ((ipCount ?? 0) >= IP_LIMIT_PER_DAY) {
      return json({ error: "Límite de publicaciones por hoy alcanzado. Inténtalo mañana." }, 429);
    }

    const { count: emailCount } = await supabase
      .from("event_submission_log").select("id", { count: "exact", head: true })
      .eq("email", organizer_email).gte("created_at", oneMonthAgo);
    if ((emailCount ?? 0) >= EMAIL_LIMIT_PER_MONTH) {
      return json({ error: "Límite mensual de publicaciones alcanzado para este email." }, 429);
    }

    // 1) Insertar el evento sin token todavía (lo necesitamos para construirlo)
    const { data: eventData, error: insertError } = await supabase
      .from("events")
      .insert({
        title, description: description ?? null, category: category ?? null,
        date, location, city: city ?? null,
        budget_min: budget_min ?? null, budget_max: budget_max ?? null,
        image_url: image_url ?? null, organizer_id: null, organizer_email,
        is_published: false,
      })
      .select("id").single();

    if (insertError || !eventData) {
      console.error("Error creando evento:", insertError);
      return json({ error: "No se pudo crear el evento" }, 500);
    }

    // 2) Generar token = eventId.random, hashear, guardar
    const random = randomHex();
    const token = `${eventData.id}.${random}`;
    const tokenHash = await sha256Hex(token);
    const verificationExpiresAt = new Date(Date.now() + VERIFICATION_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

    await supabase.from("events").update({
      verification_token_hash: tokenHash,
      verification_expires_at: verificationExpiresAt,
    }).eq("id", eventData.id);

    await supabase.from("event_submission_log").insert({ ip, email: organizer_email });

    const confirmUrl = `${siteUrl}/confirmar-evento/${token}`;

    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "TUESDI <hola@tuesdi.com>",
          to: [organizer_email],
          subject: "Confirma tu evento en TUESDI",
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
            <h2 style="color:#f59e0b">¡Hola${organizer_name ? `, ${organizer_name}` : ""}!</h2>
            <p>Tu evento "${title}" está a un paso de publicarse. Confirma haciendo clic:</p>
            <a href="${confirmUrl}" style="display:inline-block;background:#f59e0b;color:#08080f;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin:16px 0">Confirmar y publicar evento</a>
            <p style="color:#666;font-size:13px">Este enlace caduca en ${VERIFICATION_WINDOW_HOURS} horas.</p>
          </div>`,
        }),
      });
    }

    return json({ success: true, eventId: eventData.id });
  } catch (error) {
    console.error("Error in submit-event:", error);
    return json({ error: "Error interno del servidor" }, 500);
  }
});
