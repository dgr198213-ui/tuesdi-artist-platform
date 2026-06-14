/**
 * TUESDI - Tu Escenario Digital v3.0
 * Éxito de Publicación (/exito-publicacion?id=xxx)
 * Diseño: Stitch "Digital Stage" (confirmaci_n_de_evento_tuesdi)
 *
 * Se muestra tras publicar un evento. El evento está en status "pending"
 * hasta que el organizador haga clic en el Magic Link que recibió por email.
 */

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";

interface Event {
  title: string;
  city: string;
  event_date: string;
  organizer_email: string;
}

export default function ExitoPublicacion() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const eventId = new URLSearchParams(search).get("id");
    if (!eventId) return;
    supabase
      .from("events")
      .select("title, city, event_date, organizer_email")
      .eq("id", eventId)
      .maybeSingle()
      .then(({ data }) => { if (data) setEvent(data as Event); });
  }, [search]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "TUESDI — Tu Escenario Digital", url: window.location.origin });
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert("Enlace copiado al portapapeles");
      }
    } catch { /* cancelled */ }
  };

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 spotlight opacity-30"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full px-margin py-base flex justify-center md:justify-start">
        <button className="font-headline-md text-headline-md font-bold text-primary tracking-tighter" onClick={() => setLocation("/")}>TUESDI</button>
      </header>

      <main className="relative z-10 flex-grow flex items-center justify-center px-margin py-xl">
        <div className="w-full max-w-xl text-center space-y-xl">

          {/* Icon con glow */}
          <div className="relative inline-block mx-auto">
            <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full"></div>
            <div className="relative glass-card w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border border-white/20 mx-auto">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontSize: 72, fontVariationSettings: "'FILL' 1" }}
              >
                mark_email_read
              </span>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-md">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              ¡Evento Recibido!
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Hemos enviado un <strong className="text-on-surface">enlace de validación</strong> a{" "}
              {event?.organizer_email
                ? <span className="text-secondary">{event.organizer_email}</span>
                : "tu correo"}.
              {" "}Tu evento será publicado automáticamente una vez que lo confirmes.
            </p>
          </div>

          {/* Info del evento */}
          {event && (
            <div className="glass-card rounded-xl p-md text-left space-y-sm mx-auto max-w-sm">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Evento</p>
                <p className="font-headline-md text-headline-md text-on-surface">{event.title}</p>
              </div>
              <div className="flex items-center gap-md text-on-surface-variant font-body-md text-body-md">
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  {formatDate(event.event_date)}
                </div>
                <div className="flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {event.city}
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-col items-center gap-md pt-base">
            <button
              className="neon-border rounded-full px-lg py-sm font-label-sm text-label-sm uppercase tracking-widest text-secondary hover:text-white hover:bg-secondary/10 transition-all flex items-center gap-xs"
              onClick={() => setLocation("/eventos")}
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Volver a Eventos
            </button>
            <button
              className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors flex items-center gap-xs"
              onClick={handleShare}
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              Compartir TUESDI
            </button>
            <button
              className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors"
              onClick={() => setLocation("/publicar-evento")}
            >
              Publicar otro evento
            </button>
          </div>

          {/* Status indicator */}
          <div className="flex items-center justify-center gap-sm opacity-60 pt-md">
            <div className="w-2 h-2 rounded-full bg-secondary pulse-live shadow-[0_0_8px_rgba(172,237,255,0.8)]"></div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
              Esperando confirmación
            </span>
          </div>

          <p className="font-label-sm text-label-sm text-on-surface-variant/40">
            💡 ¿No ves el correo? Revisa tu carpeta de spam o promociones.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-xl border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin gap-md max-w-7xl mx-auto">
          <span className="font-headline-md text-headline-md text-on-surface opacity-50">TUESDI</span>
          <nav className="flex gap-md">
            {[["Privacidad", "/politica-privacidad"], ["Términos", "/terminos-servicio"], ["Contacto", "/contacto"]].map(([l, p]) => (
              <button key={p} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation(p)}>{l}</button>
            ))}
          </nav>
          <span className="font-label-sm text-label-sm text-on-surface-variant opacity-60">© {new Date().getFullYear()} TUESDI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
