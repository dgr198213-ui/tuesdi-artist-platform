/**
 * TUESDI v3.0 — Edge Function: get-public-artists
 *
 * Retorna lista de artistas públicos con caché agresivo
 * Optimizado para lectura de alto volumen
 *
 * Parámetros query:
 *   - category: filtrar por categoría
 *   - city: filtrar por ciudad
 *   - limit: número de resultados (default 20, max 100)
 *   - offset: para paginación (default 0)
 *   - search: búsqueda de texto (nombre, bio, categoría)
 *
 * Retorna:
 *   - artists: array de artistas
 *   - total: número total de resultados
 *   - hasMore: si hay más resultados
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Cache-Control": "public, max-age=300, stale-while-revalidate=3600", // 5 min cache, 1 hora stale
};

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parsear parámetros de query
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const city = url.searchParams.get("city");
    const search = url.searchParams.get("search");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Construir query
    let query = supabase
      .from("artists_with_metrics")
      .select("*", { count: "exact" })
      .eq("subscription_plan", "standard")
      .or("subscription_plan.eq.pro");

    // Filtros
    if (category) {
      query = query.eq("category", category);
    }

    if (city) {
      query = query.eq("city", city);
    }

    // Búsqueda de texto (si está soportada)
    if (search) {
      // Usar búsqueda simple por nombre si search_vector no está disponible
      query = query.ilike("artist_name", `%${search}%`);
    }

    // Paginación
    query = query
      .order("total_views", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        artists: data || [],
        total: count || 0,
        hasMore: (offset + limit) < (count || 0),
        limit,
        offset,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in get-public-artists:", error);
    return new Response(
      JSON.stringify({ error: "Error obteniendo artistas" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
