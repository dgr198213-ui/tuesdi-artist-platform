// supabase/functions/confirm-event/index.ts
// verify_jwt: false — el enlace se abre desde email sin sesión activa

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getRequiredEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Secret no configurado: ${key}`);
  return value;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl    = getRequiredEnv("SUPABASE_URL");
    const serviceKey     = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const magicSecret    = getRequiredEnv("MAGIC_LINK_SECRET");

    const body = await req.json();
    const token: string = body?.token ?? "";

    if (!token || !token.includes(".")) {
      return new Response(JSON.stringify({ error: "Token inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const dotIdx = token.lastIndexOf(".");
    const tokenPayload = token.slice(0, dotIdx);
    const signature    = token.slice(dotIdx + 1);

    let payload: string;
    try {
      const b64 = tokenPayload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
      payload = atob(padded);
    } catch {
      return new Response(JSON.stringify({ error: "Token malformado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const parts = payload.split(":");
    if (parts.length < 3) {
      return new Response(JSON.stringify({ error: "Token inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const eventId   = parts[0];
    const timestamp = parts[parts.length - 1];

    const age = Date.now() - parseInt(timestamp, 10);
    if (isNaN(age) || age > 35 * 60 * 1000) {
      return new Response(JSON.stringify({ error: "El enlace ha caducado." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const encoder  = new TextEncoder();
    const keyData  = encoder.encode(magicSecret);
    const cryptoKey = await crypto.subtle.importKey(
      "raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(payload));
    const expected  = Array.from(new Uint8Array(sigBuffer))
      .map(b => b.toString(16).padStart(2, "0")).join("");

    if (!safeEqual(signature, expected)) {
      return new Response(JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

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
    // Registrar el error real solo en logs del servidor, nunca al cliente (C-3)
    console.error("confirm-event error:", err);
    return new Response(JSON.stringify({ error: "Error interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
