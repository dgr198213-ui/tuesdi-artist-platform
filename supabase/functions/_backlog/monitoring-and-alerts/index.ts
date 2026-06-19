/**
 * TUESDI v3.0 — Edge Function: monitoring-and-alerts
 *
 * Realiza chequeos de salud del sistema y envía alertas de costes
 * Se ejecuta periódicamente (cron)
 *
 * Funcionalidades:
 *   - Verifica latencia de base de datos
 *   - Verifica espacio de almacenamiento
 *   - Verifica límites de Stripe
 *   - Envía alertas via Resend si se superan umbrales
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "admin@tuesdi.es";

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const alerts: string[] = [];

    // 1. Chequeo de Latencia de BD
    const start = Date.now();
    const { error: dbError } = await supabase.from("artists").select("id").limit(1);
    const latency = Date.now() - start;

    if (dbError) {
      alerts.push(`🚨 Error de base de datos: ${dbError.message}`);
    } else if (latency > 500) {
      alerts.push(`⚠️ Latencia de base de datos elevada: ${latency}ms`);
    }

    // 2. Chequeo de Almacenamiento (Simulado por ahora)
    // En producción, usar API de Supabase para obtener uso de storage
    const storageUsage = 0.8; // 80%
    if (storageUsage > 0.9) {
      alerts.push(`🚨 Almacenamiento casi lleno: ${(storageUsage * 100).toFixed(0)}%`);
    }

    // 3. Chequeo de Errores Recientes
    const { count: errorCount } = await supabase
      .from("stripe_events")
      .select("*", { count: "exact", head: true })
      .eq("status", "error")
      .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (errorCount && errorCount > 10) {
      alerts.push(`⚠️ Se han detectado ${errorCount} errores de Stripe en las últimas 24h`);
    }

    // 4. Enviar Alertas
    if (alerts.length > 0 && resendKey) {
      const html = `
        <h1>Alertas de Sistema TUESDI</h1>
        <ul>
          ${alerts.map(a => `<li>${a}</li>`).join("")}
        </ul>
        <p>Fecha: ${new Date().toISOString()}</p>
      `;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "TUESDI Monitoring <alerts@tuesdi.es>",
          to: [adminEmail],
          subject: `[ALERTA] Estado del Sistema TUESDI - ${new Date().toLocaleDateString()}`,
          html,
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        latency,
        alerts_sent: alerts.length,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in monitoring-and-alerts:", error);
    return new Response(
      JSON.stringify({ error: "Error en monitorización" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
