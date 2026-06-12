import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Share2, ArrowRight } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ExitoPublicacion() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    const eventId = new URLSearchParams(search).get("id");
    if (!eventId) return;

    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (!error && data) {
        setEvent(data);
      }
    };

    fetchEvent();
  }, [search]);

  const handleShare = async () => {
    const shareUrl = event
      ? `${window.location.origin}/eventos/${event.id}`
      : window.location.origin;
    const shareData = {
      title: event?.title || "Evento en TUESDI",
      text: `Mira mi evento en TUESDI: ${event?.title || ""}`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Enlace copiado al portapapeles");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <Card className="bg-card/50 backdrop-blur-sm border-border p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg"></div>
              <CheckCircle2 className="w-24 h-24 text-primary relative" />
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo-horizontal.png" alt="TUESDI" className="h-10 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ¡Escenario Preparado!
          </h1>
          <p className="text-muted-foreground mb-8">
            Tu evento ha sido publicado exitosamente y ya brilla en Tu Escenario Digital.
          </p>

          {/* Event Info */}
          <Card className="bg-muted/20 border-border p-4 mb-8 text-left">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Título del Evento</p>
                <p className="font-semibold text-foreground">{event?.title || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fecha</p>
                <p className="font-semibold text-foreground">
                  {event?.event_date || "—"}{event?.event_time ? ` • ${event.event_time}` : ""}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ubicación</p>
                <p className="font-semibold text-foreground">
                  {event ? `${event.venue}, ${event.city}` : "—"}
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setLocation(event ? `/eventos/${event.id}` : "/eventos")}
            >
              Ver Evento Publicado
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="w-full border-border hover:bg-muted"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir Evento
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="space-y-2 border-t border-border pt-6">
            <Button
              variant="ghost"
              className="w-full text-primary hover:bg-primary/10"
              onClick={() => setLocation("/publicar-evento")}
            >
              Publicar Otro Evento
            </Button>
            <Button
              variant="ghost"
              className="w-full text-foreground hover:bg-muted"
              onClick={() => setLocation("/dashboard")}
            >
              Ir al Panel de Control
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>💡 Consejo: Comparte tu evento en redes sociales para llegar a más personas</p>
        </div>
      </div>
    </div>
  );
}
