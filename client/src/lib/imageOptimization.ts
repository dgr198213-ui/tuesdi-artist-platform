/**
 * TUESDI v3.0 — Image Optimization Utilities
 * Proporciona funciones para optimizar imágenes en cliente y servidor
 */

/**
 * Genera una URL de imagen transformada usando Supabase Storage
 * @param publicUrl - URL pública original de Supabase Storage
 * @param options - Opciones de transformación
 * @returns URL transformada con parámetros de optimización
 */
export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number; // 1-100, default 80
  format?: "webp" | "jpg" | "png"; // default webp
  resize?: "cover" | "contain" | "fill";
}

export function getOptimizedImageUrl(
  publicUrl: string,
  options: ImageTransformOptions = {}
): string {
  // Si no es una URL de Supabase Storage, retornar sin cambios
  if (!publicUrl.includes("supabase.co")) {
    return publicUrl;
  }

  const { width = 400, height = 400, quality = 80, format = "webp", resize = "cover" } = options;

  // Construir parámetros de transformación
  const params = new URLSearchParams();
  if (width) params.append("width", width.toString());
  if (height) params.append("height", height.toString());
  params.append("quality", quality.toString());
  params.append("format", format);
  params.append("resize", resize);

  // Agregar parámetros a la URL
  const separator = publicUrl.includes("?") ? "&" : "?";
  return `${publicUrl}${separator}${params.toString()}`;
}

/**
 * Comprime una imagen en el cliente antes de subirla
 * @param file - Archivo de imagen
 * @param maxWidth - Ancho máximo en píxeles
 * @param maxHeight - Alto máximo en píxeles
 * @param quality - Calidad de compresión (0-1)
 * @returns Promise con el archivo comprimido
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener contexto 2D del canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("No se pudo generar blob del canvas"));
              return;
            }

            // Crear nuevo File con el blob comprimido
            const compressedFile = new File([blob], file.name, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Genera una URL de thumbnail de alta calidad
 * @param publicUrl - URL pública original
 * @returns URL optimizada para thumbnail
 */
export function getThumbnailUrl(publicUrl: string): string {
  return getOptimizedImageUrl(publicUrl, {
    width: 200,
    height: 200,
    quality: 85,
    format: "webp",
    resize: "cover",
  });
}

/**
 * Genera una URL de imagen para galería
 * @param publicUrl - URL pública original
 * @returns URL optimizada para galería
 */
export function getGalleryImageUrl(publicUrl: string): string {
  return getOptimizedImageUrl(publicUrl, {
    width: 600,
    height: 600,
    quality: 80,
    format: "webp",
    resize: "cover",
  });
}

/**
 * Genera una URL de imagen para perfil
 * @param publicUrl - URL pública original
 * @returns URL optimizada para perfil
 */
export function getProfileImageUrl(publicUrl: string): string {
  return getOptimizedImageUrl(publicUrl, {
    width: 300,
    height: 300,
    quality: 85,
    format: "webp",
    resize: "cover",
  });
}

/**
 * Genera una URL de imagen para cover
 * @param publicUrl - URL pública original
 * @returns URL optimizada para cover
 */
export function getCoverImageUrl(publicUrl: string): string {
  return getOptimizedImageUrl(publicUrl, {
    width: 1200,
    height: 400,
    quality: 75,
    format: "webp",
    resize: "cover",
  });
}

/**
 * Genera un placeholder de color sólido para lazy loading
 * @param color - Color hexadecimal (sin #)
 * @param width - Ancho en píxeles
 * @param height - Alto en píxeles
 * @returns Data URL de imagen placeholder
 */
export function getPlaceholderUrl(color: string = "1a1a1a", width: number = 400, height: number = 400): string {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = `#${color}`;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL("image/webp");
}

/**
 * Valida que un archivo sea una imagen válida
 * @param file - Archivo a validar
 * @returns true si es válido
 */
export function isValidImageFile(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5 MB

  if (!allowedTypes.includes(file.type)) {
    return false;
  }

  if (file.size > maxSize) {
    return false;
  }

  return true;
}

/**
 * Obtiene dimensiones de una imagen
 * @param file - Archivo de imagen
 * @returns Promise con width y height
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}
