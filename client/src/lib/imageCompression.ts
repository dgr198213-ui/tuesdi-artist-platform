/**
 * compressImage — Reduce las fotos en el navegador antes de subirlas.
 *
 * Motivo (auditoría SEO jul-2026, F02/F03): las fotos se subían tal cual
 * salen del móvil (4–8 MB, 4000+ px) y se servían sin transformación, dando
 * un LCP de ~29 s en el perfil. Comprimir en el cliente arregla el problema
 * en origen: nada que pague Supabase (las transformaciones de imagen son de
 * plan Pro), nada que reprocesar después.
 *
 * Estrategia: redimensionar a un máximo de 1920 px en el lado largo y
 * recodificar a WebP con calidad 0,82 (visualmente indistinguible para
 * fotografía). Si el navegador no soporta WebP en canvas, cae a JPEG.
 * Si algo falla o el resultado sale más grande que el original, se sube
 * el original: comprimir es una mejora, nunca un bloqueo.
 */

const MAX_DIMENSION = 1920;
const QUALITY = 0.82;

interface CompressedResult {
  file: File;
  /** Extensión final real ("webp" | "jpg" | la original si no se comprimió). */
  ext: string;
}

export async function compressImage(original: File): Promise<CompressedResult> {
  const originalExt = original.name.split(".").pop()?.toLowerCase() || "jpg";
  // Solo comprimimos formatos de foto. (GIF animado o similares se suben tal cual.)
  if (!/^image\/(jpeg|png|webp)$/.test(original.type)) {
    return { file: original, ext: originalExt };
  }

  try {
    const bitmap = await createImageBitmap(original);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file: original, ext: originalExt };
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const tryEncode = (type: string, quality: number) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

    let blob = await tryEncode("image/webp", QUALITY);
    let ext = "webp";
    // Safari antiguo no codifica WebP en canvas: fallback a JPEG.
    if (!blob || blob.type !== "image/webp") {
      blob = await tryEncode("image/jpeg", QUALITY);
      ext = "jpg";
    }
    if (!blob || blob.size >= original.size) {
      return { file: original, ext: originalExt };
    }

    const baseName = original.name.replace(/\.[^.]+$/, "");
    return {
      file: new File([blob], `${baseName}.${ext}`, { type: blob.type }),
      ext,
    };
  } catch {
    return { file: original, ext: originalExt };
  }
}
