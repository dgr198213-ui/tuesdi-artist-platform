// supabase/functions/confirm-event/index.ts
// verify_jwt: false — el enlace se abre desde email sin sesión activa.
// La lógica de verificación de firma/expiración vive en _shared/magic-token.ts
// (con cobertura de tests). Aquí solo se orquesta con la base de datos.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyToken } from "../_shared/magic-token.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Secret no configurado: ${key}`);
  return value;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const serviceKey  = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const magicSecret = getRequiredEnv("MAGIC_LINK_SECRET");

    const body = await req.json();
    const token: string = body?.token ?? "";

    // Verificación de firma + expiración (lógica pura, testeada)
    const check = await verifyToken(token, magicSecret);
    if (!check.valid) {
      const status = check.reason === "expired" ? 410 : check.reason === "malformed" ? 400 : 401;
      const msg = check.reason === "expired" ? "El enlace ha caducado." : "Token inválido";
      return new Response(JSON.stringify({ error: msg }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { eventId, signature } = check;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: link, error: linkErr } = await supabase
      .from("magic_links")
      .select("id, used, expires_at")
      .eq("token_hash", signature)
      .eq("event_id", eventId)
      .maybeSingle();

    if (linkErr || !link) {
      return new Response(JSON.stringify({ error: "Enlace no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (link.used) {
      return new Response(JSON.stringify({ error: "Este enlace ya fue utilizado" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (new Date(link.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "El enlace ha caducado." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: event, error: evErr } = await supabase
      .from("events")
      .update({ status: "approved" })
      .eq("id", eventId)
      .select()
      .single();

    if (evErr || !event) throw evErr ?? new Error("No se pudo aprobar el evento");

    await supabase.from("magic_links").update({ used: true }).eq("id", link.id);

    return new Response(JSON.stringify({ success: true, event }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    // Error real solo en logs del servidor, nunca al cliente (C-3)
    console.error("confirm-event error:", err);
    return new Response(JSON.stringify({ error: "Error interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
