/**
 * TUESDI - Tu Escenario Digital v3.0
 * Confirmación de Evento (/confirmar-evento/:token)
 * Diseño: Stitch "Digital Stage"
 *
 * Recibe el token del Magic Link, invoca la Edge Function confirm-event
 * (HMAC-SHA256) y publica el evento (status → approved).
 */

import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";

type Status = "loading" | "success" | "error";

export default function ConfirmarEvento() {
  const [, params] = useRoute("/confirmar-evento/:token");
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const confirm = async () => {
      if (!params?.token) { setStatus("error"); setErrorMsg("Enlace inválido."); return; }

      try {
        const { data, error } = await supabase.functions.invoke("verify-event", {
          body: { token: params.token },
        });

        if (error || !data?.success) {
          setStatus("error");
          setErrorMsg(data?.error || error?.message || "No se pudo confirmar el evento.");
          return;
        }

        setEvent(data.event);
        setStatus("success");
      } catch {
        setStatus("error");
        setErrorMsg("Error inesperado al confirmar el evento.");
      }
    };

    confirm();
  }, [params?.token]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 spotlight opacity-30"></div>
      </div>

      <PageNav />

      <main className="relative z-10 flex-grow flex items-center justify-center px-margin py-xl">
        <div className="w-full max-w-md text-center space-y-xl">

          {/* Loading */}
          {status === "loading" && (
            <>
              <div className="mx-auto w-32 h-32 glass-card rounded-full flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-primary animate-spin" style={{ fontSize: 64 }}>sync</span>
              </div>
              <div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface mb-sm">Confirmando tu evento...</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">Esto solo tomará un momento.</p>
              </div>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <>
              <div className="relative inline-block mx-auto">
                <div className="absolute inset-0 bg-secondary/20 blur-3xl rounded-full"></div>
                <div className="relative glass-card w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border border-white/20 mx-auto bloom-primary">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 72, fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
              </div>

              <div className="space-y-sm">
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">¡Evento Publicado!</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">
                  Tu evento ya es visible para todos los usuarios de TUESDI.
                </p>
              </div>

              {event && (
                <div className="glass-card rounded-xl p-md text-left space-y-sm mx-auto max-w-sm">
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Evento</p>
                    <p className="font-headline-md text-headline-md text-on-surface">{event.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-md text-on-surface-variant font-label-sm text-label-sm">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {event.city}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center gap-md">
                <button
                  className="bg-primary text-on-primary px-xl py-sm rounded-lg font-headline-md text-headline-md bloom-primary hover:opacity-90 transition-all"
                  onClick={() => event ? setLocation(`/eventos/${event.id}`) : setLocation("/eventos")}
                >
                  Ver Evento Publicado
                </button>
                <button
                  className="neon-border text-secondary px-lg py-sm rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:bg-secondary/10 transition-all"
                  onClick={() => setLocation("/publicar-evento")}
                >
                  Publicar Otro Evento
                </button>
              </div>
            </>
          )}

          {/* Error */}
          {status === "error" && (
            <>
              <div className="mx-auto w-32 h-32 glass-card rounded-full flex items-center justify-center border border-error/30">
                <span className="material-symbols-outlined text-error" style={{ fontSize: 64, fontVariationSettings: "'FILL' 1" }}>error</span>
              </div>
              <div className="space-y-sm">
                <h1 className="font-headline-xl text-headline-xl text-on-surface">No se pudo confirmar</h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant">{errorMsg}</p>
              </div>
              <div className="flex flex-col items-center gap-md">
                <button
                  className="bg-primary text-on-primary px-xl py-sm rounded-lg font-headline-md bloom-primary hover:opacity-90 transition-all"
                  onClick={() => setLocation("/publicar-evento")}
                >
                  Publicar de Nuevo
                </button>
                <button
                  className="text-on-surface-variant font-label-sm text-label-sm hover:text-primary transition-colors"
                  onClick={() => setLocation("/")}
                >
                  Ir al Inicio
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
