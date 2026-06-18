/**
 * TUESDI v3.0 — Edge Function: generate-image-thumbnail
 *
 * Genera un thumbnail automáticamente cuando se sube una imagen
 * Se invoca desde el cliente después de subir a Storage
 *
 * Parámetros:
 *   - bucket: "artist-media"
 *   - path: ruta del archivo en Storage
 *   - width: ancho del thumbnail (default 200)
 *   - height: alto del thumbnail (default 200)
 *
 * Retorna:
 *   - success: boolean
 *   - thumbnailUrl: URL pública del thumbnail
 *   - error: mensaje de error (si aplica)
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

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { bucket, path, width = 200, height = 200 } = body;

    // Validación
    if (!bucket || !path) {
      return new Response(
        JSON.stringify({ error: "bucket y path son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validar que el bucket es permitido
    if (bucket !== "artist-media") {
      return new Response(
        JSON.stringify({ error: "bucket no permitido" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Descargar imagen original
    const { data: imageData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(path);

    if (downloadError || !imageData) {
      throw new Error(`No se pudo descargar imagen: ${downloadError?.message}`);
    }

    // Convertir blob a buffer
    const buffer = await imageData.arrayBuffer();

    // Nota: Para producción, usar una librería como `sharp` o `image-magick`
    // Por ahora, retornamos la URL de transformación de Supabase Storage
    // que maneja la optimización automáticamente

    // Construir URL de transformación
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    const baseUrl = urlData.publicUrl;

    // Agregar parámetros de transformación
    const thumbnailUrl = `${baseUrl}?width=${width}&height=${height}&quality=85&format=webp&resize=cover`;

    return new Response(
      JSON.stringify({
        success: true,
        thumbnailUrl,
        originalUrl: baseUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-image-thumbnail:", error);
    return new Response(
      JSON.stringify({ error: "Error generando thumbnail" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
