import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Share2, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

export default function ExitoPublicacion() {
  const [, setLocation] = useLocation();

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
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ¡Evento Publicado!
          </h1>
          <p className="text-muted-foreground mb-8">
            Tu evento ha sido publicado exitosamente y está visible para todos los usuarios.
          </p>

          {/* Event Info */}
          <Card className="bg-muted/20 border-border p-4 mb-8 text-left">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Título del Evento</p>
                <p className="font-semibold text-foreground">Concierto de Luna Martínez</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fecha</p>
                <p className="font-semibold text-foreground">15 de Junio, 2024 • 20:00</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ubicación</p>
                <p className="font-semibold text-foreground">Teatro Principal, Madrid</p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Ver Evento Publicado
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              className="w-full border-border hover:bg-muted"
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
