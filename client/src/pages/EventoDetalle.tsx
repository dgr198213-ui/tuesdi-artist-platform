import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useRoute } from "wouter";
import { Calendar, MapPin, Users, Share2, Heart } from "lucide-react";

export default function EventoDetalle() {
  const [route, params] = useRoute("/eventos/:id");
  const [liked, setLiked] = useState(false);

  const event = {
    id: params?.id,
    title: "Concierto de Luna Martínez",
    date: "2024-06-15",
    time: "20:00",
    venue: "Teatro Principal",
    city: "Madrid",
    country: "España",
    category: "Música en Vivo",
    image: "https://via.placeholder.com/800x400",
    description: "Un concierto íntimo con Luna Martínez, artista ganadora de múltiples premios. Disfruta de sus mejores canciones en vivo.",
    price: "25€",
    artist: {
      name: "Luna Martínez",
      verified: true,
      image: "https://via.placeholder.com/100",
    },
    attendees: 234,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" className="text-primary hover:bg-primary/10">
            ← Volver
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="relative h-96 rounded-lg overflow-hidden mb-8 bg-gradient-to-br from-primary/20 to-secondary/20">
          <img
            src={event.image}
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
                    <p className="font-semibold text-foreground">{event.date} • {event.time}</p>
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
                  <p className="font-semibold text-foreground">{event.attendees} personas interesadas</p>
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card className="bg-card/50 border-border p-6 mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Sobre este evento</h2>
              <p className="text-foreground leading-relaxed">{event.description}</p>
            </Card>

            {/* Artist Info */}
            <Card className="bg-card/50 border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Artista</h2>
              <div className="flex items-center gap-4">
                <img
                  src={event.artist.image}
                  alt={event.artist.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{event.artist.name}</h3>
                    {event.artist.verified && (
                      <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                        Verificado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Cantautora</p>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Ver Perfil
                </Button>
              </div>
            </Card>
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
