/**
 * TUESDI v3.0 — PageFooter
 * Footer compartido para todas las páginas públicas.
 */

import { useLocation } from "wouter";

const LINKS = [
  { label: "Publicar Evento", path: "/publicar-evento" },
  { label: "Artistas",        path: "/artistas" },
  { label: "Eventos",         path: "/eventos" },
  { label: "Planes",          path: "/planes" },
  { label: "Quiénes Somos",   path: "/quienes-somos" },
  { label: "Contacto",        path: "/contacto" },
];

const LEGAL_LINKS = [
  { label: "Privacidad",    path: "/politica-privacidad" },
  { label: "Términos",      path: "/terminos-servicio" },
  { label: "Cookies",       path: "/politica-cookies" },
];

export default function PageFooter() {
  const [, setLocation] = useLocation();
  return (
    <footer className="bg-surface-dim w-full py-xl border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin gap-md max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start">
          <img src="/logo-tuesdi-full.png" alt="TUESDI" className="h-10 w-auto object-contain opacity-50 mb-sm grayscale hover:grayscale-0 transition-all" />
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            © {new Date().getFullYear()} TUESDI — Tu Escenario Digital. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex flex-col items-center md:items-end gap-md">
          <div className="flex gap-md flex-wrap justify-center">
            {LINKS.map((l) => (
              <button key={l.path} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation(l.path)}>
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex gap-sm flex-wrap justify-center opacity-40">
            {LEGAL_LINKS.map((l) => (
              <button key={l.path} className="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors" onClick={() => setLocation(l.path)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
