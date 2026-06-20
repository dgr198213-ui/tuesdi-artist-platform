// supabase/functions/verify-event/index.ts
// Valida el token (formato eventId.random) y publica el evento.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { token } = await req.json();
    if (!token || typeof token !== "string" || !token.includes(".")) {
      return json({ error: "Token inválido" }, 400);
    }

    const [eventId] = token.split(".");
    if (!eventId) return json({ error: "Token inválido" }, 400);

    const { data: eventData, error: fetchError } = await supabase
      .from("events")
      .select("id, is_published, verification_token_hash, verification_expires_at")
      .eq("id", eventId)
      .single();

    if (fetchError || !eventData) return json({ error: "Evento no encontrado" }, 404);
    if (eventData.is_published) return json({ error: "Este evento ya fue verificado anteriormente" }, 409);
    if (!eventData.verification_token_hash) return json({ error: "Este evento no requiere verificación o ya fue procesado" }, 409);
    if (!eventData.verification_expires_at || new Date(eventData.verification_expires_at) < new Date()) {
      return json({ error: "El enlace ha caducado. Vuelve a publicar el evento para recibir uno nuevo." }, 410);
    }

    const providedHash = await sha256Hex(token);
    const a = new TextEncoder().encode(providedHash);
    const b = new TextEncoder().encode(eventData.verification_token_hash);
    const isValid = a.length === b.length && crypto.subtle.timingSafeEqual(a, b);
    if (!isValid) return json({ error: "Token inválido" }, 401);

    const { data: updated, error: updateError } = await supabase
      .from("events")
      .update({ is_published: true, verification_token_hash: null, verification_expires_at: null })
      .eq("id", eventId)
      .select()
      .single();

    if (updateError || !updated) throw updateError || new Error("No se pudo publicar el evento");

    return json({ success: true, event: updated });
  } catch (error) {
    console.error("Error in verify-event:", error);
    return json({ error: "Error interno del servidor" }, 500);
  }
});
