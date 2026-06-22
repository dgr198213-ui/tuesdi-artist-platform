// supabase/functions/get-events/index.ts
// Devuelve eventos aprobados (futuros) con filtros opcionales y paginación.
//
// Body (POST):
//   search   (opcional) — búsqueda por título (ilike)
//   category (opcional) — categoría exacta
//   city     (opcional) — ciudad (ilike)
//   page     (opcional, defecto 0) — número de página
//   pageSize (opcional, defecto 12, máximo 50) — elementos por página

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
    const supabaseUrl = getRequiredEnv("SUPABASE_URL");
    const supabaseServiceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();

    // Parsear y sanitizar parámetros del body
    const search = (body.search as string)?.trim() ?? "";
    const category = (body.category as string)?.trim() ?? "";
    const city = (body.city as string)?.trim() ?? "";

    let page = parseInt(body.page ?? "0", 10);
    let pageSize = parseInt(body.pageSize ?? "12", 10);

    // Sanitizar paginación
    if (isNaN(page) || page < 0) page = 0;
    if (isNaN(pageSize) || pageSize < 1) pageSize = 12;
    if (pageSize > 50) pageSize = 50;

    // Fecha de hoy en formato YYYY-MM-DD para comparación
    const today = new Date().toISOString().split("T")[0];

    // Construir query base
    let query = supabase
      .from("events")
      .select(
        "id, title, description, category, city, country, event_date, event_time, image_url, organizer_name, status"
      )
      .eq("status", "approved")
      .gte("event_date", today);

    // Aplicar filtros opcionales
    if (search.length > 0) {
      query = query.ilike("title", `%${search}%`);
    }
    if (category.length > 0) {
      query = query.eq("category", category);
    }
    if (city.length > 0) {
      query = query.ilike("city", `%${city}%`);
    }

    // Ordenar y paginar
    query = query
      .order("event_date", { ascending: true })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    const { data, error } = await query;

    if (error) throw error;

    const events = data ?? [];
    const hasMore = events.length === pageSize;

    return new Response(
      JSON.stringify({ events, hasMore }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-events:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});