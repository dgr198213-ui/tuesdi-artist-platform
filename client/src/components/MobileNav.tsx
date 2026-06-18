/**
 * MobileNav — Navegación móvil para dashboard
 * Barra inferior (bottom nav) para dispositivos móviles
 */

import { useLocation } from "wouter";

type DashboardSection = "overview" | "profile" | "media" | "contacts" | "analytics";

const NAV_ITEMS: { key: DashboardSection; icon: string; label: string; path: string }[] = [
  { key: "overview", icon: "dashboard", label: "Overview", path: "/dashboard" },
  { key: "profile", icon: "account_circle", label: "Perfil", path: "/dashboard/perfil" },
  { key: "media", icon: "perm_media", label: "Media", path: "/dashboard/media" },
  { key: "contacts", icon: "contacts", label: "Contactos", path: "/dashboard/contactos" },
  { key: "analytics", icon: "analytics", label: "Analítica", path: "/dashboard/analitica" },
];

interface MobileNavProps {
  active: DashboardSection;
}

export default function MobileNav({ active }: MobileNavProps) {
  const [, setLocation] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-outline-variant/10 flex justify-around items-center h-20 z-40 md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            onClick={() => setLocation(item.path)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
              isActive
                ? "text-primary"
                : "text-on-surface-variant hover:text-primary"
            }`}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
          >
            <span
              className="material-symbols-outlined text-[24px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[10px] font-label-sm uppercase tracking-widest">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
