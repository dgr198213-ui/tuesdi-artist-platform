/**
 * TUESDI - Tu Escenario Digital v3.0
 * Detalle de Evento (/eventos/:id)
 * Diseño: Stitch "Digital Stage"
 */

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";

interface Event {
  id: string;
  title: string;
  description: string | null;
  category: string;
  city: string;
  country: string | null;
  event_date: string;
  event_time: string | null;
  image_url: string | null;
  organizer_name: string | null;
  organizer_email: string;
  status: string;
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatDateBadge(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.toLocaleDateString("es-ES", { month: "short" }).toUpperCase().replace(".", "");
  const day = d.getDate().toString().padStart(2, "0");
  return { month, day };
}

export default function EventoDetalle() {
  const [, params] = useRoute("/eventos/:id");
  const [, setLocation] = useLocation();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    const load = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .maybeSingle();

      if (error || !data) { setNotFound(true); setLoading(false); return; }
      setEvent(data as Event);
      setLoading(false);
    };
    load();
  }, [params?.id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: event?.title, url });
      else { await navigator.clipboard.writeText(url); alert("Enlace copiado al portapapeles"); }
    } catch { /* user cancelled */ }
  };

  const handleContact = () => {
    if (!event?.organizer_email) return;
    const subject = encodeURIComponent(`Interés en: ${event.title}`);
    const body = encodeURIComponent(`Hola,\n\nEstoy interesado/a en el evento "${event.title}" el ${formatFullDate(event.event_date)}.\n\n¿Podría facilitarme más información?`);
    window.location.href = `mailto:${event.organizer_email}?subject=${subject}&body=${body}`;
  };

  if (loading) return (
    <div className="bg-background min-h-screen flex items-center justify-center text-on-surface-variant">Cargando evento...</div>
  );

  if (notFound || !event) return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center text-center px-margin gap-md">
      <h1 className="font-headline-lg text-headline-lg text-on-surface">Evento no encontrado</h1>
      <p className="font-body-md text-body-md text-on-surface-variant">Este evento no existe o ya ha caducado.</p>
      <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold bloom-primary" onClick={() => setLocation("/eventos")}>Ver Eventos</button>
    </div>
  );

  const { month, day } = formatDateBadge(event.event_date);

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-surface/10 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,129,255,0.15)]">
        <nav className="flex justify-between items-center px-margin py-base max-w-7xl mx-auto">
          <button className="font-headline-md text-headline-md font-bold text-primary" onClick={() => setLocation("/")}>TUESDI</button>
          <div className="flex items-center gap-md">
            <button className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation("/artistas")}>Artistas</button>
            <button className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1" onClick={() => setLocation("/eventos")}>Eventos</button>
          </div>
          <button className="font-body-md text-body-md text-primary hover:opacity-80 transition-all px-md py-xs rounded-lg neon-border" onClick={() => setLocation("/acceso")}>Acceso</button>
        </nav>
      </header>

      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10"></div>
        {event.image_url ? (
          <img className="absolute inset-0 w-full h-full object-cover" src={event.image_url} alt={event.title} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface to-secondary/10 spotlight"></div>
        )}
        <div className="absolute top-md right-md z-20 flex gap-sm">
          <button
            className="w-10 h-10 glass-card rounded-full flex items-center justify-center hover:border-primary transition-colors"
            onClick={() => setLiked(!liked)}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0", color: liked ? "#ef4444" : undefined }}>favorite</span>
          </button>
          <button className="w-10 h-10 glass-card rounded-full flex items-center justify-center hover:border-primary transition-colors" onClick={handleShare}>
            <span className="material-symbols-outlined text-[20px]">share</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-margin pb-xl -mt-xl relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          {/* Content */}
          <div className="lg:col-span-8 space-y-lg">
            <div>
              <div className="flex flex-wrap gap-xs mb-md">
                <span className="bg-secondary/20 text-secondary border border-secondary/30 px-sm py-1 rounded-full font-label-sm text-label-sm uppercase">{event.category}</span>
                {event.status === "approved" && (
                  <span className="bg-primary/20 text-primary border border-primary/30 px-sm py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> Verificado
                  </span>
                )}
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-md">{event.title}</h1>
              {event.description && (
                <p className="font-body-lg text-body-lg text-on-surface-variant whitespace-pre-line">{event.description}</p>
              )}
            </div>

            <div className="glass-card rounded-xl p-md grid grid-cols-1 sm:grid-cols-3 gap-md">
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">calendar_today</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Fecha</p>
                  <p className="font-headline-md text-headline-md text-on-surface capitalize">{formatFullDate(event.event_date)}</p>
                </div>
              </div>
              {event.event_time && (
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">schedule</span>
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Hora</p>
                    <p className="font-headline-md text-headline-md text-on-surface">{event.event_time}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-sm">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Ciudad</p>
                  <p className="font-headline-md text-headline-md text-on-surface">{event.city}{event.country ? `, ${event.country}` : ""}</p>
                </div>
              </div>
            </div>

            {event.organizer_name && (
              <div className="glass-card rounded-xl p-md flex items-center gap-md">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">person</span>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Organizado por</p>
                  <p className="font-headline-md text-headline-md text-on-surface">{event.organizer_name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 sticky top-32 space-y-md">
            <div className="glass-card rounded-xl p-md bloom-primary">
              <div className="flex justify-center mb-md">
                <div className="bg-background/80 backdrop-blur-md px-lg py-md rounded-xl text-center min-w-[80px]">
                  <span className="block font-label-sm text-label-sm text-primary">{month}</span>
                  <span className="block font-headline-xl text-headline-xl leading-none text-on-surface">{day}</span>
                </div>
              </div>
              <button
                className="w-full bg-primary text-on-primary py-md rounded-lg font-headline-md text-headline-md hover:opacity-90 transition-all bloom-primary mb-sm"
                onClick={handleContact}
              >
                Contactar Organizador
              </button>
              <button
                className="w-full neon-border text-secondary py-sm rounded-lg font-label-sm text-label-sm font-bold hover:bg-secondary/10 transition-all flex items-center justify-center gap-xs"
                onClick={handleShare}
              >
                <span className="material-symbols-outlined text-[18px]">share</span> Compartir Evento
              </button>
              <p className="mt-md text-center font-label-sm text-label-sm text-on-surface-variant/60">
                La comunicación es directa entre partes. TUESDI no intermedia.
              </p>
            </div>

            <button
              className="w-full glass-card rounded-xl p-md flex items-center gap-md hover:border-primary transition-colors group"
              onClick={() => setLocation("/publicar-evento")}
            >
              <span className="material-symbols-outlined text-primary text-[32px]">add_circle</span>
              <div className="text-left">
                <p className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">¿Tienes un evento?</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Publícalo gratis en TUESDI</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-xl bg-surface-dim border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin gap-md max-w-7xl mx-auto">
          <div className="font-headline-md text-headline-md text-on-surface opacity-50">TUESDI</div>
          <div className="flex gap-md">
            {[["Privacidad", "/politica-privacidad"], ["Términos", "/terminos-servicio"], ["Contacto", "/contacto"]].map(([label, path]) => (
              <button key={path} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation(path)}>{label}</button>
            ))}
          </div>
          <div className="font-label-sm text-label-sm text-on-surface opacity-40">© {new Date().getFullYear()} TUESDI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
