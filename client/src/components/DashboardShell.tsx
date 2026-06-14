/**
 * TUESDI - Tu Escenario Digital v3.0
 * DashboardShell — layout compartido para /dashboard/*
 *
 * Diseño: Stitch "Digital Stage" (editor_de_perfil_tuesdi - NAVIGATION SHELL)
 * SideNavBar fija + TopAppBar. Las páginas del panel (Overview, Perfil,
 * Media, Contactos, Analítica) renderizan su contenido dentro de <main>.
 */

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

type DashboardSection = "overview" | "profile" | "media" | "contacts" | "analytics";

const NAV_ITEMS: { key: DashboardSection; icon: string; label: string; path: string }[] = [
  { key: "overview", icon: "dashboard", label: "Overview", path: "/dashboard" },
  { key: "profile", icon: "account_circle", label: "Profile", path: "/dashboard/perfil" },
  { key: "media", icon: "perm_media", label: "Media", path: "/dashboard/media" },
  { key: "contacts", icon: "contacts", label: "Contacts", path: "/dashboard/contactos" },
  { key: "analytics", icon: "analytics", label: "Analytics", path: "/dashboard/analitica" },
];

interface DashboardShellProps {
  active: DashboardSection;
  title: string;
  children: React.ReactNode;
}

export default function DashboardShell({ active, title, children }: DashboardShellProps) {
  const [, setLocation] = useLocation();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("artists")
        .select("profile_image")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data?.profile_image) {
        setAvatarUrl(data.profile_image);
      }
    };

    loadAvatar();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      {/* SideNavBar */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-surface-container-low shadow-md flex flex-col py-md px-base z-50">
        <div className="mb-xl px-base">
          <button onClick={() => setLocation("/")} className="text-left flex items-center gap-xs">
            <img src="/isotipo-nuevo.jpg" alt="" className="h-8 w-8 object-contain"  />
            <h1 className="font-headline-md text-headline-md font-bold text-secondary-container tracking-tight">TUESDI</h1>
          </button>
          <p className="text-on-surface-variant font-label-sm text-[10px] uppercase tracking-[0.2em]">Artist Dashboard</p>
        </div>
        <div className="flex-grow flex flex-col gap-base">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                onClick={() => setLocation(item.path)}
                className={`flex items-center gap-base p-base transition-all duration-300 ease-in-out text-left rounded-l-lg ${
                  isActive
                    ? "text-primary font-bold border-r-4 border-primary bg-surface-container-high"
                    : "hover:bg-surface-variant hover:text-primary text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {item.icon}
                </span>
                <span className="font-body-md">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-auto flex flex-col gap-base border-t border-outline-variant/20 pt-md">
          <button
            className="bg-primary text-on-primary py-sm rounded-lg font-bold bloom-primary hover:opacity-90 transition-opacity flex items-center justify-center gap-xs mb-md"
            onClick={() => setLocation("/dashboard/perfil")}
          >
            <span className="w-2 h-2 rounded-full bg-secondary pulse-live"></span>
            Go Live
          </button>
          <button
            onClick={() => setLocation("/dashboard/suscripcion")}
            className="flex items-center gap-base p-base transition-all duration-300 ease-in-out hover:bg-surface-variant hover:text-primary text-on-surface-variant text-left"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-body-md">Settings</span>
          </button>
          <button
            onClick={() => setLocation("/contacto")}
            className="flex items-center gap-base p-base transition-all duration-300 ease-in-out hover:bg-surface-variant hover:text-primary text-on-surface-variant text-left"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="font-body-md">Support</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-base p-base transition-all duration-300 ease-in-out hover:bg-surface-variant hover:text-error text-on-surface-variant text-left"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-body-md">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* TopAppBar */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-surface/80 backdrop-blur-xl flex justify-between items-center h-xl px-lg border-b border-outline-variant/10">
        <div className="flex items-center gap-md">
          <span className="font-headline-md text-headline-md font-bold text-secondary">{title}</span>
        </div>
        <div className="flex items-center gap-md">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 bg-surface-container flex items-center justify-center">
            {avatarUrl ? (
              <img alt="Avatar" className="w-full h-full object-cover" src={avatarUrl} />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="ml-64 mt-xl p-lg max-w-[1200px] mx-auto">{children}</main>
    </div>
  );
}
