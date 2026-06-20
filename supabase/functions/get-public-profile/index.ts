// supabase/functions/get-public-profile/index.ts
// Devuelve el perfil público de un artista por slug, incluyendo
// su media y artistas relacionados de la misma categoría.
//
// Body (POST):
//   { slug: string } — slug del artista (requerido)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
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

    // 1. Obtener perfil por slug (tabla real: profiles)
    const { data: artist, error: artistError } = await supabase
      .from("profiles")
      .select(
        "id, slug, display_name, bio, category, city, price_from, rating, reviews_count, avatar_url, cover_url, plan, is_published"
      )
      .eq("slug", slug.trim())
      .eq("is_published", true)
      .maybeSingle();

    if (artistError || !artist) {
      return new Response(
        JSON.stringify({ error: "Artista no encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Obtener media del perfil ordenada por posición (relación real: user_id)
    const { data: media, error: mediaError } = await supabase
      .from("media")
      .select("id, type, url, position")
      .eq("user_id", artist.id)
      .order("position", { ascending: true });

    if (mediaError) throw mediaError;

    // 3. Obtener perfiles relacionados (misma categoría, diferente id, publicados)
    const { data: related, error: relatedError } = await supabase
      .from("profiles")
      .select("slug, display_name, category, avatar_url")
      .eq("category", artist.category)
      .eq("is_published", true)
      .neq("id", artist.id)
      .limit(4);

    if (relatedError) throw relatedError;

    // Mapeo a los nombres de campo que espera ArtistaProfile.tsx.
    // Campos que ya no existen en el esquema real (instagram, youtube,
    // spotify, website, verified, country) se devuelven como null/false
    // para que el renderizado condicional del frontend los omita sin error.
    const artistMapped = {
      id: artist.id,
      slug: artist.slug,
      artist_name: artist.display_name,
      bio: artist.bio,
      category: artist.category,
      city: artist.city,
      country: null,
      starting_price: artist.price_from,
      website: null,
      instagram: null,
      youtube: null,
      spotify: null,
      profile_image: artist.avatar_url,
      cover_image: artist.cover_url,
      verified: false,
      rating: artist.rating,
      reviews_count: artist.reviews_count,
      plan: artist.plan,
    };

    const mediaMapped = (media ?? []).map((m) => ({ ...m, thumbnail: m.url }));

    const relatedMapped = (related ?? []).map((r) => ({
      slug: r.slug,
      artist_name: r.display_name,
      category: r.category,
      profile_image: r.avatar_url,
    }));

    return new Response(
      JSON.stringify({ artist: artistMapped, media: mediaMapped, related: relatedMapped }),
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