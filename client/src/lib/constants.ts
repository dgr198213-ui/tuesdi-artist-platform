/**
 * TUESDI v3.0 — Shared constants
 * Single source of truth for values used across multiple pages.
 */

/** Default country for new artists/events */
export const DEFAULT_COUNTRY = "España";

/** Max length for artist biography */
export const BIO_MAX = 2000;

/** Time threshold to detect a brand-new user (2 minutes in ms) */
export const NEW_USER_THRESHOLD_MS = 2 * 60 * 1000;

/** Artist categories (used in EditorPerfil, ExplorarArtistas) */
export const ARTIST_CATEGORIES = [
  "Cantante",
  "Músico",
  "DJ",
  "Banda",
  "Mago",
  "Humorista",
  "Actor",
  "Bailarín",
  "Performer",
] as const;

/** Event categories (used in PublicarEvento) */
export const EVENT_CATEGORIES = [
  "Música",
  "Arte",
  "Teatro",
  "Danza",
  "Magia",
  "Humor",
  "Performance",
  "Otro",
] as const;

/**
 * Mapeo de las etiquetas de categoría mostradas en la UI (español, con
 * mayúsculas/tildes) a los valores reales del enum `artist_category` en
 * Postgres (musica, teatro, magia, comedia, danza, dj, circo, arte,
 * foto_video). Sin este mapeo, cualquier INSERT/UPDATE con la etiqueta
 * de UI directamente falla con un error de enum inválido.
 * Usar SIEMPRE antes de enviar `category` a Supabase.
 */
export const CATEGORY_DB_VALUE: Record<string, string> = {
  // ARTIST_CATEGORIES
  "Cantante": "musica",
  "Músico": "musica",
  "DJ": "dj",
  "Banda": "musica",
  "Mago": "magia",
  "Humorista": "comedia",
  "Actor": "teatro",
  "Bailarín": "danza",
  "Performer": "arte",
  // EVENT_CATEGORIES
  "Música": "musica",
  "Arte": "arte",
  "Teatro": "teatro",
  "Danza": "danza",
  "Magia": "magia",
  "Humor": "comedia",
  "Performance": "arte",
  "Otro": "arte",
};

/** Cities available for filtering (used in ExplorarArtistas, Eventos) */
export const FILTER_CITIES = [
  "Todas",
  "Madrid",
  "Barcelona",
  "Valencia",
  "Sevilla",
  "Bilbao",
  "Zaragoza",
  "Málaga",
] as const;

/** Filter "all" label */
export const FILTER_ALL = "Todas" as const;

/** Media limits per subscription plan — single source of truth */
export const PLAN_LIMITS: Record<string, { photos: number; videos: number }> = {
  pro: { photos: 3, videos: 3 },
  standard: { photos: 3, videos: 1 },
  beta: { photos: 1, videos: 0 },
};

/**
 * El enum real `subscription_plan` en Postgres usa spark/spotlight/headliner,
 * mientras que el resto del código (PLAN_LIMITS, PLAN_PRICING, UI) usa
 * beta/standard/pro. Usar estos mapeos al leer/escribir profiles.plan.
 */
export const PLAN_DB_VALUE: Record<string, string> = {
  beta: "spark",
  standard: "spotlight",
  pro: "headliner",
};

export const PLAN_UI_VALUE: Record<string, string> = {
  spark: "beta",
  spotlight: "standard",
  headliner: "pro",
};

/** Returns media limits for a given plan (falls back to beta) */
export function getPlanLimits(plan: string | null | undefined) {
  const limits = PLAN_LIMITS[plan ?? "beta"] ?? PLAN_LIMITS.beta;
  return { photoLimit: limits.photos, videoLimit: limits.videos };
}

/** Pricing info (for display, not payment processing) */
export const PLAN_PRICING = {
  beta: { label: "TUESDI Beta", price: "Gratis", priceNum: 0 },
  standard: { label: "TUESDI Standard", price: "6€/mes", priceNum: 6 },
  pro: { label: "TUESDI Pro", price: "9,99€/mes", priceNum: 9.99 },
} as const;

/** Slugify a text string (NFD normalization, lowercase, hyphens) */
export function slugify(text: string): string {
  return (
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "artista"
  );
}