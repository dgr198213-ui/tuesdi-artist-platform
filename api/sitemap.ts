// api/sitemap.ts — Sitemap dinámico de TUESDI.
//
// Servido en https://tuesdi.com/sitemap.xml mediante un rewrite en vercel.json.
// Combina las rutas públicas estáticas con los perfiles de artista y los
// eventos aprobados leídos de Supabase en el momento de la petición: cada
// artista o evento nuevo aparece automáticamente sin redeployar.
//
// Usa la clave ANON (pública por diseño, la misma del bundle del cliente):
// las políticas RLS ya limitan lo visible a artistas públicos y eventos
// approved, así que no hace falta la service key para esto.
//
// Si Supabase no responde, se degrada al sitemap estático en vez de fallar:
// un sitemap parcial es mejor que un 500 de cara a Googlebot.

const SITE = "https://tuesdi.com";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://xseupkmaosjdrgdsdpmj.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

interface StaticRoute {
  path: string;
  changefreq: string;
  priority: string;
}

const STATIC_ROUTES: StaticRoute[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/artistas", changefreq: "daily", priority: "0.9" },
  { path: "/eventos", changefreq: "daily", priority: "0.9" },
  { path: "/publicar-evento", changefreq: "monthly", priority: "0.8" },
  { path: "/escaparate", changefreq: "monthly", priority: "0.8" },
  { path: "/planes", changefreq: "monthly", priority: "0.7" },
  { path: "/quienes-somos", changefreq: "monthly", priority: "0.6" },
  { path: "/contacto", changefreq: "monthly", priority: "0.5" },
  { path: "/faq", changefreq: "monthly", priority: "0.5" },
  { path: "/aviso-legal", changefreq: "yearly", priority: "0.2" },
  { path: "/politica-privacidad", changefreq: "yearly", priority: "0.2" },
  { path: "/politica-cookies", changefreq: "yearly", priority: "0.2" },
  { path: "/terminos-servicio", changefreq: "yearly", priority: "0.2" },
];

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Consulta PostgREST con la clave anon. Devuelve [] ante cualquier fallo. */
async function fetchRows(pathAndQuery: string): Promise<Record<string, string>[]> {
  if (!SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    return (await res.json()) as Record<string, string>[];
  } catch {
    return [];
  }
}

export default async function handler(_req: unknown, res: {
  setHeader: (k: string, v: string) => void;
  status: (n: number) => { send: (body: string) => void };
}) {
  const today = new Date().toISOString().split("T")[0];

  const [artists, events] = await Promise.all([
    // Perfiles públicos de artistas (RLS: lectura pública), máx. 5000.
    fetchRows("artists?select=slug,updated_at&order=created_at.desc&limit=5000"),
    // Eventos aprobados y futuros (RLS: solo approved es visible con anon).
    fetchRows(
      `events?select=id,created_at&status=eq.approved&event_date=gte.${today}&order=event_date.asc&limit=5000`,
    ),
  ]);

  const urls: string[] = [];

  for (const r of STATIC_ROUTES) {
    urls.push(
      `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
    );
  }

  for (const a of artists) {
    if (!a.slug) continue;
    const lastmod = a.updated_at ? `\n    <lastmod>${a.updated_at.split("T")[0]}</lastmod>` : "";
    urls.push(
      `  <url>\n    <loc>${SITE}/artista/${xmlEscape(a.slug)}</loc>${lastmod}\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
    );
  }

  for (const e of events) {
    if (!e.id) continue;
    urls.push(
      `  <url>\n    <loc>${SITE}/eventos/${xmlEscape(e.id)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  // Cachear 1 h en el edge de Vercel; stale-while-revalidate para no bloquear a Googlebot.
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}
