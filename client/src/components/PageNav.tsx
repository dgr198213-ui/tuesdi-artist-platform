/**
 * TUESDI v3.0 — PageNav
 * Nav compartida para todas las páginas públicas.
 */

import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

type NavActive = "home" | "artistas" | "eventos" | "planes" | null;
interface PageNavProps { active?: NavActive; }

const NAV_LINKS = [
  { key: "home" as NavActive,     label: "Inicio",   path: "/" },
  { key: "artistas" as NavActive, label: "Artistas", path: "/artistas" },
  { key: "eventos" as NavActive,  label: "Eventos",  path: "/eventos" },
  { key: "planes" as NavActive,   label: "Planes",   path: "/planes" },
];

export default function PageNav({ active = null }: PageNavProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/10 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,129,255,0.15)]">
      <div className="flex justify-between items-center px-margin py-base max-w-7xl mx-auto">
        <button className="flex items-center gap-2 shrink-0" onClick={() => setLocation("/")} aria-label="TUESDI inicio">
          <img src="/isotipo-nuevo.png" alt="TUESDI" className="h-9 w-9 object-contain rounded-lg shrink-0" />
          <span className="font-headline-md text-headline-md font-bold text-primary hidden sm:inline">TUESDI</span>
        </button>
        <div className="hidden md:flex items-center gap-md">
          {NAV_LINKS.map((link) => (
            <button key={link.key}
              className={`font-body-md text-body-md transition-colors ${
                active === link.key
                  ? "text-primary font-bold border-b-2 border-primary pb-1"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              onClick={() => setLocation(link.path)}>
              {link.label}
            </button>
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
              <button 
                className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-all hidden sm:inline"
                onClick={() => setLocation("/publicar-evento")}
              >
                Publicar Evento
              </button>
              <button 
                className="font-label-sm text-label-sm text-primary hover:opacity-80 transition-all" 
                onClick={() => setLocation("/acceso")}
              >
                Acceso
              </button>
              <button
                className="bg-primary text-on-primary font-label-sm text-label-sm px-md py-xs rounded-full bloom-primary hover:scale-105 transition-transform"
                onClick={() => setLocation("/acceso")}
              >
                Crear Perfil
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
