/**
 * TUESDI - Tu Escenario Digital v3.0
 * Dashboard Overview (/dashboard)
 * Diseño: Stitch "Digital Stage" (dashboard_overview_tuesdi)
 */

import { supabase } from "@/lib/supabase";
import DashboardShell from "@/components/DashboardShell";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface ArtistData {
  id: string;
  artist_name: string;
  subscription_plan: string | null;
  profile_image: string | null;
}

interface MetricsData {
  profile_views: number;
  search_impressions: number;
  contact_clicks: number;
  contacts_received: number;
}

interface ContactRequest {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string | null;
  created_at: string;
  status: string;
}

interface MediaItem {
  id: string;
  type: string;
  url: string;
  thumbnail: string | null;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [noProfile, setNoProfile] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: artistData } = await supabase
        .from("artists")
        .select("id, artist_name, subscription_plan, profile_image")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!artistData) { setNoProfile(true); setLoading(false); return; }
      setArtist(artistData as ArtistData);

      const [{ data: metricsData }, { data: contactsData }, { data: mediaData }] = await Promise.all([
        supabase
          .from("metrics")
          .select("profile_views, search_impressions, contact_clicks, contacts_received")
          .eq("artist_id", artistData.id)
          .order("recorded_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("contact_requests")
          .select("id, sender_name, sender_email, subject, created_at, status")
          .eq("artist_id", artistData.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("media")
          .select("id, type, url, thumbnail")
          .eq("artist_id", artistData.id)
          .order("position", { ascending: true })
          .limit(4),
      ]);

      if (metricsData) setMetrics(metricsData as MetricsData);
      setContacts((contactsData || []) as ContactRequest[]);
      setMedia((mediaData || []) as MediaItem[]);
      setLoading(false);
    };
    load();
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const newCount = contacts.filter((c) => c.status === "new").length;

  if (loading) {
    return (
      <DashboardShell active="overview" title="Overview">
        <div className="flex items-center justify-center h-64 text-on-surface-variant">Cargando...</div>
      </DashboardShell>
    );
  }

  if (noProfile) {
    return (
      <DashboardShell active="overview" title="Overview">
        <div className="flex flex-col items-center justify-center h-64 gap-lg text-center">
          <div className="w-24 h-24 glass-card rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[48px]">person_add</span>
          </div>
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">Crea tu perfil artístico</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Aún no tienes un perfil en TUESDI. Crea el tuyo en menos de 2 minutos.
            </p>
          </div>
          <button
            className="bg-primary text-on-primary px-xl py-sm rounded-lg font-bold bloom-primary hover:opacity-90"
            onClick={() => setLocation("/dashboard/perfil")}
          >
            Crear mi Perfil
          </button>
        </div>
      </DashboardShell>
    );
  }

  const planLabel = artist?.subscription_plan === "pro" ? "TUESDI Pro" : artist?.subscription_plan === "standard" ? "TUESDI Standard" : "TUESDI Beta";

  const metricCards = [
    { icon: "visibility", label: "Profile Views", value: metrics?.profile_views ?? 0, trend: "+12%", up: true },
    { icon: "search_check", label: "Search Appearances", value: metrics?.search_impressions ?? 0, trend: "+5.2%", up: true },
    { icon: "ads_click", label: "Contact Clicks", value: metrics?.contact_clicks ?? 0, trend: "-2.1%", up: false },
    { icon: "group_add", label: "New Contacts", value: metrics?.contacts_received ?? newCount, trend: "+22%", up: true },
  ];

  return (
    <DashboardShell active="overview" title="Overview">
      {/* Welcome */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg mb-xs">
            Welcome back, {artist?.artist_name?.split(" ")[0] ?? "Artista"}
          </h2>
          <p className="text-on-surface-variant font-body-md">
            {newCount > 0
              ? `Tienes ${newCount} solicitud${newCount > 1 ? "es" : ""} de contacto sin leer.`
              : "Todo al día — sin mensajes nuevos pendientes."}
          </p>
        </div>
        <div className="px-md py-sm bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-sm shrink-0">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          <div>
            <p className="font-label-sm text-label-sm uppercase tracking-tighter text-outline">Current Plan</p>
            <p className="font-bold text-primary">{planLabel}</p>
          </div>
        </div>
      </section>

      {/* Metric Bento Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
        {metricCards.map((m) => (
          <div key={m.label} className="glass-card rounded-xl p-md flex flex-col justify-between h-40">
            <div className="flex justify-between">
              <span className="material-symbols-outlined text-outline">{m.icon}</span>
              <span className={`${m.up ? "text-secondary" : "text-error"} font-label-sm text-label-sm font-bold flex items-center gap-xs`}>
                {m.trend}
                <span className="material-symbols-outlined text-[14px]">{m.up ? "trending_up" : "trending_down"}</span>
              </span>
            </div>
            <div>
              <h4 className="text-outline font-label-sm text-label-sm uppercase mb-xs">{m.label}</h4>
              <div className="flex items-end justify-between">
                <span className="font-headline-md text-headline-md font-bold">{m.value.toLocaleString("es-ES")}</span>
                {m.label === "Profile Views" && (
                  <div className="h-8 w-24 flex items-end gap-[2px]">
                    {[40, 60, 30, 80, 50, 100].map((h, i) => (
                      <div key={i} className={`w-[4px] rounded-t-sm ${i === 5 ? "bg-primary bloom-primary" : "bg-primary/40"}`} style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Lower Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card rounded-xl p-lg overflow-hidden">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md">Recent Activity</h3>
            <button className="text-primary font-bold font-label-sm text-label-sm uppercase hover:underline" onClick={() => setLocation("/dashboard/contactos")}>
              View All
            </button>
          </div>
          {contacts.length === 0 ? (
            <div className="text-center py-xl text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] block mb-sm">inbox</span>
              <p className="font-body-md">Aún no has recibido ninguna solicitud de contacto.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-outline-variant/10">
                  <tr>
                    <th className="pb-md text-outline font-label-sm text-label-sm uppercase">Remitente</th>
                    <th className="pb-md text-outline font-label-sm text-label-sm uppercase">Fecha</th>
                    <th className="pb-md text-outline font-label-sm text-label-sm uppercase text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-container/50 transition-colors cursor-pointer" onClick={() => setLocation("/dashboard/contactos")}>
                      <td className="py-md">
                        <div className="flex items-center gap-sm">
                          <div className="h-8 w-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold font-label-sm text-label-sm shrink-0">
                            {initials(c.sender_name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-on-surface truncate">{c.sender_name}</p>
                            <p className="font-label-sm text-[11px] text-outline truncate">{c.subject || c.sender_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-md text-on-surface-variant font-body-md text-sm whitespace-nowrap">{formatDate(c.created_at)}</td>
                      <td className="py-md text-right">
                        {c.status === "new" ? (
                          <span className="px-sm py-1 rounded-full bg-secondary-container/20 text-secondary font-label-sm text-[10px] font-bold uppercase tracking-widest">New</span>
                        ) : c.status === "archived" ? (
                          <span className="px-sm py-1 rounded-full bg-surface-container-highest text-outline font-label-sm text-[10px] font-bold uppercase tracking-widest">Archived</span>
                        ) : (
                          <span className="px-sm py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] font-bold uppercase tracking-widest">Read</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Multimedia Card */}
        <div className="glass-card rounded-xl p-lg flex flex-col">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-md text-headline-md">Multimedia</h3>
            <span className="font-label-sm text-[10px] font-bold text-primary uppercase bg-primary/10 px-sm py-1 rounded">
              {planLabel.replace("TUESDI ", "")}
            </span>
          </div>
          <div className="space-y-md flex-1">
            {(() => {
              const photos = media.filter((m) => m.type === "photo");
              const videos = media.filter((m) => m.type === "video");
              const photoLimit = artist?.subscription_plan === "pro" ? 3 : artist?.subscription_plan === "standard" ? 3 : 1;
              const videoLimit = artist?.subscription_plan === "pro" ? 3 : artist?.subscription_plan === "standard" ? 1 : 0;
              return (
                <>
                  <div>
                    <div className="flex justify-between font-label-sm text-label-sm mb-xs">
                      <span className="text-outline">Fotos</span>
                      <span className="font-bold">{photos.length} / {photoLimit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-secondary transition-all" style={{ width: `${Math.min((photos.length / photoLimit) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                  {videoLimit > 0 && (
                    <div>
                      <div className="flex justify-between font-label-sm text-label-sm mb-xs">
                        <span className="text-outline">Vídeos</span>
                        <span className="font-bold">{videos.length} / {videoLimit}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${Math.min((videos.length / videoLimit) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  )}
                  {media.length > 0 ? (
                    <div className="pt-md grid grid-cols-2 gap-sm">
                      {media.slice(0, 4).map((item) => (
                        <div key={item.id} className="aspect-video relative rounded-lg overflow-hidden group">
                          <img className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" src={item.thumbnail || item.url} alt="" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white">{item.type === "video" ? "play_circle" : "visibility"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="pt-md text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[32px] block mb-xs">photo_library</span>
                      <p className="font-label-sm text-label-sm">Sin archivos todavía</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <button
            className="mt-lg w-full py-sm border border-outline-variant hover:bg-surface-variant transition-colors rounded-lg flex items-center justify-center gap-sm font-bold"
            onClick={() => setLocation("/dashboard/media")}
          >
            <span className="material-symbols-outlined">upload</span>
            Gestionar Galería
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
