// supabase/functions/get-public-profile/index.ts
// Devuelve el perfil público de un artista por slug, incluyendo
// su media y artistas relacionados de la misma categoría.
//
// Body (POST):
//   { slug: string } — slug del artista (requerido)

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

    const { slug } = await req.json();

    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "El parámetro 'slug' es requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Obtener artista por slug
    const { data: artist, error: artistError } = await supabase
      .from("artists")
      .select(
        "id, slug, artist_name, bio, category, city, country, starting_price, website, instagram, youtube, spotify, profile_image, cover_image, verified"
      )
      .eq("slug", slug.trim())
      .maybeSingle();

    if (artistError || !artist) {
      return new Response(
        JSON.stringify({ error: "Artista no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Obtener media del artista ordenada por posición
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select("id, type, url, thumbnail, position")
      .eq("artist_id", artist.id)
      .order("position", { ascending: true });

    if (mediaError) throw mediaError;

    // 3. Obtener artistas relacionados (misma categoría, diferente id)
    const { data: related, error: relatedError } = await supabase
      .from("artists")
      .select("slug, artist_name, category, profile_image")
      .eq("category", artist.category)
      .neq("id", artist.id)
      .limit(4);

    if (relatedError) throw relatedError;

    return new Response(
      JSON.stringify({ artist, media: media ?? [], related: related ?? [] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in get-public-profile:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});