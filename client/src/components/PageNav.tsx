/**
 * PageNav — Navegación superior de las páginas públicas.
 *
 * Usa <Link> de wouter (que renderiza <a href> reales) en lugar de botones
 * con onClick: los rastreadores no ejecutan JavaScript para descubrir rutas,
 * así que sin anchors la navegación es invisible para Google (auditoría SEO
 * jul-2026, hallazgo F01). La navegación SPA se conserva: wouter intercepta
 * el click y evita el full reload.
 */
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

type NavActive = "home" | "artistas" | "eventos" | "planes" | null;

const NAV_LINKS = [
  { key: "home" as NavActive,     label: "Inicio",   path: "/" },
  { key: "artistas" as NavActive, label: "Artistas", path: "/artistas" },
  { key: "eventos" as NavActive,  label: "Eventos",  path: "/eventos" },
  { key: "planes" as NavActive,   label: "Planes",   path: "/planes" },
];


interface PageNavProps { active?: NavActive; }

export default function PageNav({ active = null }: PageNavProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/10 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,129,255,0.15)]">
      <div className="flex justify-between items-center px-margin py-base max-w-7xl mx-auto">
        <Link href="/" className="flex items-center shrink-0" aria-label="TUESDI inicio">
          <img
            src="/logo-tuesdi-full.png"
            alt="TUESDI — Tu Escenario Digital"
            className="h-12 w-auto object-contain"
          />
        </Link>
        <div className="hidden md:flex items-center gap-md">
          {NAV_LINKS.map((link) => (
            <Link key={link.key} href={link.path}
              className={`font-body-md text-body-md transition-colors ${
                active === link.key
                  ? "text-primary font-bold border-b-2 border-primary pb-1"
                  : "text-on-surface-variant hover:text-primary"
              }`}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-sm">
          {loading ? (
            <div className="w-20 h-8 animate-pulse bg-surface-container rounded-full"></div>
          ) : isAuthenticated ? (
            <button
              className="bg-primary text-on-primary font-label-sm text-label-sm px-md py-xs rounded-full bloom-primary hover:scale-105 transition-transform"
              onClick={() => setLocation("/dashboard")}
            >
              Mi Panel
            </button>
          ) : (
            <>
              {/* Publicar Evento — visible en desktop, en móvil está en la home */}
              <Link href="/publicar-evento"
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-all hidden md:inline">
                Publicar Evento
              </Link>
              {/* Acceso — para artistas que ya tienen cuenta */}
              <Link href="/acceso"
                className="font-label-sm text-label-sm text-primary hover:opacity-80 transition-all">
                Acceso
              </Link>
              {/* Crear Perfil — CTA principal para nuevos artistas */}
              <Link href="/acceso"
                className="bg-primary text-on-primary font-label-sm text-label-sm px-md py-xs rounded-full bloom-primary hover:scale-105 transition-transform">
                Crear Perfil
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
