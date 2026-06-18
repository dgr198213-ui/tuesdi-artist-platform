/**
 * useCachedData — Hook para caché de datos con SWR (Stale-While-Revalidate)
 * Implementa estrategia de caché inteligente para datos públicos
 */

import { useEffect, useState, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en milisegundos
}

interface UseCachedDataOptions {
  ttl?: number; // Tiempo de caché en segundos (default 5 minutos)
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}

// Almacenamiento de caché en memoria
const cacheStore = new Map<string, CacheEntry<any>>();

/**
 * Obtiene datos del caché o null si está expirado
 */
function getCachedData<T>(key: string): T | null {
  const entry = cacheStore.get(key);
  if (!entry) return null;

  const age = Date.now() - entry.timestamp;
  if (age > entry.ttl) {
    cacheStore.delete(key);
    return null;
  }

  return entry.data;
}

/**
 * Almacena datos en caché
 */
function setCachedData<T>(key: string, data: T, ttl: number): void {
  cacheStore.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Hook para obtener datos con caché automático
 */
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutos por defecto
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
  } = options;

  const [data, setData] = useState<T | null>(() => getCachedData(key));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const fetch = async () => {
    try {
      setLoading(true);
      const result = await fetcher();

      if (isMountedRef.current) {
        setData(result);
        setCachedData(key, result, ttl);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    // Obtener datos del caché
    const cached = getCachedData<T>(key);
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      fetch();
    }

    // Revalidar en focus
    if (revalidateOnFocus) {
      const handleFocus = () => {
        const cached = getCachedData<T>(key);
        if (!cached) {
          fetch();
        }
      };

      window.addEventListener("focus", handleFocus);
      return () => {
        window.removeEventListener("focus", handleFocus);
        isMountedRef.current = false;
      };
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [key]);

  // Revalidar en reconexión
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => {
      const cached = getCachedData<T>(key);
      if (!cached) {
        fetch();
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [key, revalidateOnReconnect]);

  return {
    data,
    loading,
    error,
    revalidate: fetch,
  };
}

/**
 * Limpia el caché completamente
 */
export function clearCache(): void {
  cacheStore.clear();
}

/**
 * Limpia una entrada específica del caché
 */
export function clearCacheEntry(key: string): void {
  cacheStore.delete(key);
}

/**
 * Obtiene estadísticas del caché
 */
export function getCacheStats() {
  return {
    entries: cacheStore.size,
    keys: Array.from(cacheStore.keys()),
  };
}
