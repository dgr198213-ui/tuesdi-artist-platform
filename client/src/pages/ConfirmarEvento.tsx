import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2, Calendar, MapPin } from "lucide-react";

export default function ConfirmarEvento() {
  const [, params] = useRoute("/confirmar-evento/:token");
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const confirm = async () => {
      if (!params?.token) {
        setStatus("error");
        setErrorMessage("Enlace inválido.");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("confirm-event", {
          body: { token: params.token },
        });

        // supabase-js no siempre llena `error` para respuestas 4xx/5xx de Edge Functions,
        // así que revisamos también el cuerpo de la respuesta.
        if (error || !data?.success) {
          setStatus("error");
          setErrorMessage(
            data?.error || error?.message || "No se pudo confirmar el evento. Intenta de nuevo."
          );
          return;
        }

        setEvent(data.event);
        setStatus("success");
      } catch (err) {
        console.error("Error confirming event:", err);
        setStatus("error");
        setErrorMessage("Error inesperado al confirmar el evento.");
      }
    };

    confirm();
  }, [params?.token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <Card className="bg-card/50 backdrop-blur-sm border-border p-8 text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Confirmando tu evento...
              </h1>
              <p className="text-muted-foreground">
                Esto solo tomará un momento.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
                  <CheckCircle2 className="w-20 h-20 text-primary relative" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                ¡Evento Publicado!
              </h1>
              <p className="text-muted-foreground mb-8">
                Tu evento ya es visible para todos los usuarios de Tuesdi.
              </p>

              {event && (
                <Card className="bg-muted/20 border-border p-4 mb-8 text-left space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Título del Evento</p>
                    <p className="font-semibold text-foreground">{event.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground">
                      {event.event_date}{event.event_time ? ` · ${event.event_time}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <p className="text-sm text-foreground">{event.venue}, {event.city}</p>
                  </div>
                </Card>
              )}

              <div className="space-y-2">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setLocation(event ? `/eventos/${event.id}` : "/eventos")}
                >
                  Ver Evento Publicado
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-foreground hover:bg-muted"
                  onClick={() => setLocation("/")}
                >
                  Ir al Inicio
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-6">
                <XCircle className="w-20 h-20 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                No se pudo confirmar
              </h1>
              <p className="text-muted-foreground mb-8">{errorMessage}</p>

              <div className="space-y-2">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setLocation("/publicar-evento")}
                >
                  Publicar de Nuevo
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-foreground hover:bg-muted"
                  onClick={() => setLocation("/")}
                >
                  Ir al Inicio
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
