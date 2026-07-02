/**
 * TUESDI - Tu Escenario Digital v3.0
 * Analítica (/dashboard/analitica)
 * Diseño: Stitch "Digital Stage" (anal_tica_avanzada_tuesdi)
 * Métricas reales. Sin datos falsos (principio v3.0).
 */

import { supabase } from "@/lib/supabase";
import DashboardShell from "@/components/DashboardShell";
import FetchErrorState from "@/components/FetchErrorState";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface MetricRow {
  profile_views: number;
  search_impressions: number;
  contact_clicks: number;
  contacts_received: number;
  recorded_at: string;
}

interface ContactRequest {
  created_at: string;
  status: string;
}

export default function Analitica() {
  const [, setLocation] = useLocation();
  const [plan, setPlan] = useState<string>("beta");
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    setFetchError(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      const { data: artist, error: artistErr } = await supabase
        .from("artists")
        .select("id, subscription_plan")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (artistErr) throw artistErr;
      if (!artist) { setLoading(false); return; }
      setPlan(artist.subscription_plan || "beta");

      const [{ data: metricsData, error: metricsErr }, { data: contactsData, error: contactsErr }] = await Promise.all([
        supabase
          .from("metrics")
          .select("profile_views, search_impressions, contact_clicks, contacts_received, recorded_at")
          .eq("artist_id", artist.id)
          .order("recorded_at", { ascending: false })
          .limit(30),
        supabase
          .from("contact_requests")
          .select("created_at, status")
          .eq("artist_id", artist.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (metricsErr) console.error("[Analitica] Error cargando métricas:", metricsErr);
      if (contactsErr) console.error("[Analitica] Error cargando contactos:", contactsErr);

      setMetrics((metricsData || []) as MetricRow[]);
      setContacts((contactsData || []) as ContactRequest[]);
    } catch (err) {
      console.error("[Analitica] Error cargando analíticas:", err);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const isBasic = plan === "beta";

  const latest = metrics[0] || null;
  const prev = metrics[1] || null;

  const pct = (current: number, previous: number) => {
    if (!previous) return null;
    const diff = ((current - previous) / previous) * 100;
    return diff;
  };

  const totalViews = latest?.profile_views ?? 0;
  const totalImpressions = latest?.search_impressions ?? 0;
  const totalClicks = latest?.contact_clicks ?? 0;
  const totalContacts = contacts.length;
  const newContacts = contacts.filter((c) => c.status === "new").length;

  const conversionRate = totalClicks > 0 ? ((totalContacts / totalClicks) * 100).toFixed(1) : "0.0";

  const statCards = [
    {
      icon: "visibility",
      label: "Visitas al Perfil",
      value: totalViews.toLocaleString("es-ES"),
      trend: prev ? pct(totalViews, prev.profile_views) : null,
    },
    {
      icon: "search_check",
      label: "Apariciones en Búsqueda",
      value: totalImpressions.toLocaleString("es-ES"),
      trend: prev ? pct(totalImpressions, prev.search_impressions) : null,
    },
    {
      icon: "ads_click",
      label: "Clics en Contacto",
      value: totalClicks.toLocaleString("es-ES"),
      trend: prev ? pct(totalClicks, prev.contact_clicks) : null,
    },
    {
      icon: "group_add",
      label: "Solicitudes Recibidas",
      value: totalContacts.toString(),
      trend: null,
    },
  ];

  return (
    <DashboardShell active="analytics" title="Analytics">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Analítica de Rendimiento</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">No medimos popularidad. Medimos oportunidades reales.</p>
        </div>
        {isBasic && (
          <div className="glass-card rounded-xl px-md py-sm flex items-center gap-sm border-secondary/30 shrink-0">
            <span className="material-symbols-outlined text-secondary">upgrade</span>
            <div>
              <p className="font-label-sm text-label-sm text-secondary uppercase">Plan Beta</p>
              <button
                className="font-label-sm text-[11px] text-on-surface-variant hover:text-primary underline transition-colors"
                onClick={() => setLocation("/planes")}
              >
                Actualizar para ver historial
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl h-40 animate-pulse"></div>
          ))}
        </div>
      ) : fetchError ? (
        <FetchErrorState
          resourceLabel="tus analíticas"
          onRetry={loadAnalytics}
        />
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md mb-xl">
            {statCards.map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-md flex flex-col justify-between h-40">
                <div className="flex justify-between">
                  <span className="material-symbols-outlined text-outline">{s.icon}</span>
                  {s.trend !== null ? (
                    <span className={`font-label-sm text-label-sm font-bold flex items-center gap-xs ${s.trend >= 0 ? "text-secondary" : "text-error"}`}>
                      {s.trend >= 0 ? "+" : ""}{s.trend.toFixed(1)}%
                      <span className="material-symbols-outlined text-[14px]">{s.trend >= 0 ? "trending_up" : "trending_down"}</span>
                    </span>
                  ) : (
                    <span className="font-label-sm text-label-sm text-outline">—</span>
                  )}
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-outline uppercase mb-xs">{s.label}</p>
                  <span className="font-headline-md text-headline-md font-bold text-on-surface">{s.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Conversion + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mb-xl">
            {/* Conversion card */}
            <div className="glass-card rounded-xl p-lg flex flex-col justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Tasa de Conversión</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Porcentaje de visitas que hacen clic en "Contactar Artista".
                </p>
              </div>
              <div className="my-lg text-center">
                <div className="relative inline-block">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2.5" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="#0081FF" strokeWidth="2.5" strokeLinecap="round"
                      strokeDasharray={`${Math.min(parseFloat(conversionRate), 100)} 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-lg text-headline-lg text-primary font-bold">{conversionRate}%</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-on-surface-variant font-label-sm text-label-sm">
                <span>{totalClicks} clics</span>
                <span>{totalContacts} contactos</span>
              </div>
            </div>

            {/* Contact status breakdown */}
            <div className="lg:col-span-2 glass-card rounded-xl p-lg">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">Solicitudes de Contacto</h3>
              {contacts.length === 0 ? (
                <div className="text-center py-xl text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] block mb-sm">inbox</span>
                  <p className="font-body-md">Aún no has recibido solicitudes de contacto.</p>
                </div>
              ) : (
                <div className="space-y-md">
                  {(["new", "read", "archived"] as const).map((status) => {
                    const count = contacts.filter((c) => c.status === status).length;
                    const pctVal = contacts.length > 0 ? (count / contacts.length) * 100 : 0;
                    const colors: Record<string, string> = { new: "bg-secondary", read: "bg-primary", archived: "bg-outline" };
                    const labels: Record<string, string> = { new: "Nuevas", read: "Leídas", archived: "Archivadas" };
                    return (
                      <div key={status}>
                        <div className="flex justify-between font-label-sm text-label-sm mb-xs">
                          <span className="text-on-surface-variant">{labels[status]}</span>
                          <span className="font-bold text-on-surface">{count}</span>
                        </div>
                        <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                          <div className={`h-full ${colors[status]} rounded-full transition-all`} style={{ width: `${pctVal}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-md border-t border-outline-variant/10 flex justify-between items-center">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Total solicitudes</span>
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">{contacts.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced unlock */}
          {isBasic && (
            <div className="glass-card rounded-xl p-lg border border-secondary/20 flex flex-col md:flex-row items-center gap-lg">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-[36px]">analytics</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Analítica Avanzada</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Con los planes <strong className="text-on-surface">Standard</strong> y <strong className="text-on-surface">Pro</strong> obtienes evolución semanal, histórico completo y tendencias de contenido más visto.
                </p>
              </div>
              <button
                className="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold bloom-primary hover:opacity-90 whitespace-nowrap shrink-0"
                onClick={() => setLocation("/planes")}
              >
                Ver Planes
              </button>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
