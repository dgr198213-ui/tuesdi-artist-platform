import { useEffect } from "react";

const SITE = "https://tuesdi.com";
const DEFAULT_TITLE = "TUESDI — Tu Escenario Digital";
const DEFAULT_DESCRIPTION =
  "Tu Escenario Digital. Visibilidad profesional para artistas sin intermediarios. Perfil público, contacto privado, sin comisiones.";
const DEFAULT_IMAGE = `${SITE}/gallery/concierto-confeti-luces.jpg`;

interface SeoOptions {
  /** Título de la pestaña y del resultado de búsqueda. Se le añade el sufijo de marca. */
  title?: string;
  /** Meta description. Idealmente entre 110 y 160 caracteres. */
  description?: string;
  /** Ruta canónica, empezando por "/". Evita que Google indexe duplicados. */
  path?: string;
  /** URL absoluta de la imagen para redes sociales. */
  image?: string;
  /** true en páginas privadas o sin valor de búsqueda. */
  noIndex?: boolean;
}

/** Crea o actualiza una etiqueta <meta> identificada por name o property. */
function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Ajusta el <head> de forma imperativa al montar/actualizar la página.
 *
 * TUESDI es una SPA: sin esto, todas las rutas comparten el título y la
 * descripción del index.html, y Google las trata como páginas casi idénticas.
 */
export function useSeo({ title, description, path, image, noIndex }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title ? `${title} | TUESDI` : DEFAULT_TITLE;
    const desc = description ?? DEFAULT_DESCRIPTION;
    const url = path ? `${SITE}${path}` : `${SITE}/`;
    const img = image ?? DEFAULT_IMAGE;

    document.title = fullTitle;
    setMeta("name", "description", desc);
    setLink("canonical", url);

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);

    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);

    // robots: solo se emite cuando hay que ocultar la página.
    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (noIndex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else if (robots) {
      robots.remove();
    }
  }, [title, description, path, image, noIndex]);
}
