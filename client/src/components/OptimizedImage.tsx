/**
 * OptimizedImage — Componente para imágenes optimizadas
 * Gestiona lazy loading, transformaciones y fallbacks
 */

import { useState, useEffect } from "react";
import { getOptimizedImageUrl, ImageTransformOptions, getPlaceholderUrl } from "@/lib/imageOptimization";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  transformOptions?: ImageTransformOptions;
  placeholder?: "blur" | "color" | "none";
  placeholderColor?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  transformOptions = {},
  placeholder = "blur",
  placeholderColor = "1a1a1a",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [placeholderUrl, setPlaceholderUrl] = useState<string>("");

  useEffect(() => {
    if (placeholder === "blur" && width && height) {
      const url = getPlaceholderUrl(placeholderColor, width, height);
      setPlaceholderUrl(url);
    }
  }, [placeholder, width, height, placeholderColor]);

  const optimizedSrc = getOptimizedImageUrl(src, transformOptions);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Fallback si hay error
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-container ${className}`}
        style={{
          width: width ? `${width}px` : "100%",
          height: height ? `${height}px` : "100%",
        }}
      >
        <span className="material-symbols-outlined text-on-surface-variant text-[32px]">
          image_not_supported
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "100%",
      }}
    >
      {/* Placeholder */}
      {!isLoaded && placeholderUrl && (
        <img
          src={placeholderUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Imagen optimizada */}
      <img
        src={optimizedSrc}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
