import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Calendar, MapPin, Users, Share2, Heart } from "lucide-react";

export default function EventoDetalle() {
  const [route, params] = useRoute("/eventos/:id");
  const [, setLocation] = useLocation();
  const [liked, setLiked] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!params?.id) return;

      try {
        const { data, error } = await supabase
          .from("events")
          .select("*, artists(name, verified, avatar_url)")
          .eq("id", params.id)
          .single();

        if (error) {
          console.error("Error fetching event:", error);
        } else {
          setEvent(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Button
              variant="ghost"
              className="text-primary hover:bg-primary/10"
              onClick={() => setLocation("/eventos")}
            >
              ← Volver
            </Button>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Evento no encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="text-primary hover:bg-primary/10"
              onClick={() => setLocation("/eventos")}
            >
              ← Volver
            </Button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
              <img src="/logo-horizontal.png" alt="TUESDI" className="h-8 object-contain" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="relative h-96 rounded-lg overflow-hidden mb-8 bg-gradient-to-br from-primary/20 to-secondary/20">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-card/50 backdrop-blur-sm border-border hover:bg-card"
              onClick={() => setLiked(!liked)}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current text-red-500" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-card/50 backdrop-blur-sm border-border hover:bg-card"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Title and Category */}
            <div className="mb-6">
              <span className="text-xs bg-secondary/20 text-secondary-foreground px-3 py-1 rounded inline-block mb-3">
                {event.category}
              </span>
              <h1 className="text-4xl font-bold text-foreground mb-2">{event.title}</h1>
            </div>

            {/* Event Details */}
            <Card className="bg-card/50 border-border p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-semibold text-foreground">{event.event_date} • {event.event_time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-semibold text-foreground">{event.venue}, {event.city}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Asistentes</p>
                  <p className="font-semibold text-foreground">{event.attendees || 0} personas interesadas</p>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="bg-card/50 border-border p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Sobre este evento</h2>
              <p className="text-foreground leading-relaxed">{event.description}</p>
            </Card>

            {/* Artist Info */}
            {event.artists && (
              <Card className="bg-card/50 border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Artista</h2>
                <div className="flex items-center gap-4">
                  <img
                    src={event.artists.avatar_url}
                    alt={event.artists.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{event.artists.name}</h3>
                      {event.artists.verified && (
                        <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                          Verificado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Artista</p>
                  </div>
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setLocation(`/artista/${event.artist_id}`)}
                  >
                    Ver Perfil
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Booking */}
          <div>
            <Card className="bg-card/50 border-border p-6 sticky top-20">
              <p className="text-3xl font-bold text-foreground mb-6">{event.price}</p>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-3 py-6">
                Comprar Entrada
              </Button>
              <Button variant="outline" className="w-full border-border hover:bg-muted">
                Compartir Evento
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
