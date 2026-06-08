import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoute } from "wouter";
import { Mail, Instagram, Music, Globe, MapPin, Star } from "lucide-react";

export default function ArtistaProfile() {
  const [route, params] = useRoute("/artista/:id");

  const artist = {
    id: params?.id,
    name: "Luna Martínez",
    category: "Cantautor/a",
    bio: "Cantautora independiente con más de 10 años de experiencia en la música en vivo. Especializada en géneros acústicos y folk.",
    city: "Madrid",
    country: "España",
    verified: true,
    rating: 4.8,
    reviews: 24,
    avatar: "https://via.placeholder.com/150",
    cover: "https://via.placeholder.com/1200x300",
    photos: [
      "https://via.placeholder.com/300",
      "https://via.placeholder.com/300",
      "https://via.placeholder.com/300",
    ],
    socials: {
      instagram: "https://instagram.com",
      spotify: "https://spotify.com",
      website: "https://example.com",
    },
    priceFrom: "300€",
    upcomingEvents: [
      {
        id: 1,
        title: "Concierto en Vivo",
        date: "2024-06-15",
        venue: "Teatro Principal",
      },
      {
        id: 2,
        title: "Sesión Acústica",
        date: "2024-06-22",
        venue: "Café Cultural",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
        <img
          src={artist.cover}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img
            src={artist.avatar}
            alt={artist.name}
            className="w-32 h-32 rounded-full border-4 border-card object-cover"
          />
          <div className="flex-1 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{artist.name}</h1>
              {artist.verified && (
                <span className="text-xs bg-secondary/20 text-secondary-foreground px-3 py-1 rounded">
                  Verificado
                </span>
              )}
            </div>
            <p className="text-muted-foreground mb-2">{artist.category}</p>
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-semibold text-foreground">{artist.rating}</span>
                <span className="text-muted-foreground">({artist.reviews} reseñas)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {artist.city}, {artist.country}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Contactar
              </Button>
              <Button variant="outline" className="border-border hover:bg-muted">
                Solicitar Consulta
              </Button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Desde</p>
            <p className="text-2xl font-bold text-primary">{artist.priceFrom}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="bg-card/50 border border-border">
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="gallery">Galería</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <Card className="bg-card/50 border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Sobre el artista</h2>
              <p className="text-foreground leading-relaxed mb-6">{artist.bio}</p>
              
              <h3 className="text-lg font-semibold text-foreground mb-4">Enlaces</h3>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
                <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                  <Music className="w-4 h-4 mr-2" />
                  Spotify
                </Button>
                <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                  <Globe className="w-4 h-4 mr-2" />
                  Sitio Web
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artist.photos.map((photo, idx) => (
                <div key={idx} className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 hover:border-primary/50 transition-colors cursor-pointer group">
                  <img
                    src={photo}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="space-y-4">
              {artist.upcomingEvents.map((event) => (
                <Card key={event.id} className="bg-card/50 border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
                  <h3 className="font-semibold text-foreground">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.date} • {event.venue}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="bg-card/50 border-border p-6">
              <p className="text-muted-foreground">Reseñas próximamente</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
