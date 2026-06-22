/**
 * useImageUpload — Hook para subida de imágenes con compresión
 * Maneja validación, compresión y subida a Supabase Storage
 */

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { compressImage, isValidImageFile, getImageDimensions } from "@/lib/imageOptimization";

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseImageUploadOptions {
  bucket?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  onProgress?: (progress: UploadProgress) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    bucket = "artist-media",
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    onProgress,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const uploadImage = async (file: File, userId: string, fileName?: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validar archivo
      if (!isValidImageFile(file)) {
        throw new Error("Archivo inválido. Solo se permiten JPG, PNG o WebP menores a 5 MB.");
      }

      // Obtener dimensiones originales
      const dimensions = await getImageDimensions(file);
      if (import.meta.env.DEV) console.debug(`Dimensiones originales: ${dimensions.width}x${dimensions.height}`);

      // Comprimir imagen
      const compressedFile = await compressImage(file, maxWidth, maxHeight, quality);
      if (import.meta.env.DEV) {
        console.debug(`Tamaño original: ${(file.size / 1024).toFixed(2)} KB`);
        console.debug(`Tamaño comprimido: ${(compressedFile.size / 1024).toFixed(2)} KB`);
      }

      // Generar ruta de almacenamiento
      const ext = compressedFile.name.split(".").pop() || "webp";
      const timestamp = Date.now();
      const path = `${userId}/media-${timestamp}.${ext}`;

      // Simular progreso (Supabase Storage no proporciona eventos de progreso nativamente)
      if (onProgress) {
        onProgress({ loaded: 0, total: compressedFile.size, percentage: 0 });
      }

      // Subir archivo
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(path, compressedFile, {
          upsert: true,
          contentType: compressedFile.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      if (onProgress) {
        onProgress({ loaded: compressedFile.size, total: compressedFile.size, percentage: 100 });
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      setUploadedUrl(publicUrl);
      return publicUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido al subir imagen";
      setError(message);
      console.error("Error uploading image:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setUploadedUrl(null);
  };

  return {
    uploadImage,
    loading,
    error,
    uploadedUrl,
    reset,
  };
}
