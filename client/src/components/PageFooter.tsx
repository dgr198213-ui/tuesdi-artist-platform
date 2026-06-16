/**
 * TUESDI v3.0 — PageFooter
 * Footer compartido para todas las páginas públicas.
 */

import { useLocation } from "wouter";

const LINKS = [
  { label: "Privacidad",    path: "/politica-privacidad" },
  { label: "Términos",      path: "/terminos-servicio" },
  { label: "Contacto",      path: "/contacto" },
  { label: "Cookies",       path: "/politica-cookies" },
  { label: "Quiénes Somos", path: "/quienes-somos" },
];

export default function PageFooter() {
  const [, setLocation] = useLocation();
  return (
    <footer className="bg-surface-dim w-full py-xl border-t border-white/5">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin gap-md max-w-7xl mx-auto">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-headline-md text-headline-md text-on-surface opacity-50 mb-sm">TUESDI</span>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            © {new Date().getFullYear()} TUESDI — Tu Escenario Digital. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex gap-md flex-wrap justify-center">
          {LINKS.map((l) => (
            <button key={l.path} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation(l.path)}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
