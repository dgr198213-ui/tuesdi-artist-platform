import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Search, Music2, Calendar, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  const featuredEvents = [
    {
      id: 1,
      title: "Concierto de Luna Martínez",
      artist: "Luna Martínez",
      date: "2024-06-15",
      city: "Madrid",
      image: "https://via.placeholder.com/300x200",
      price: "25€",
    },
    {
      id: 2,
      title: "Noche de DJ Carlos",
      artist: "DJ Carlos",
      date: "2024-06-16",
      city: "Barcelona",
      image: "https://via.placeholder.com/300x200",
      price: "15€",
    },
    {
      id: 3,
      title: "The Rock Stars en Vivo",
      artist: "The Rock Stars",
      date: "2024-06-17",
      city: "Valencia",
      image: "https://via.placeholder.com/300x200",
      price: "30€",
    },
  ];

  const featuredArtists = [
    {
      id: 1,
      name: "Luna Martínez",
      category: "Cantautor/a",
      city: "Madrid",
      image: "https://via.placeholder.com/150",
      verified: true,
    },
    {
      id: 2,
      name: "DJ Carlos",
      category: "DJ / Productor",
      city: "Barcelona",
      image: "https://via.placeholder.com/150",
      verified: false,
    },
    {
      id: 3,
      name: "The Rock Stars",
      category: "Banda de Rock",
      city: "Valencia",
      image: "https://via.placeholder.com/150",
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Tuesdi</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/explorar-artistas" className="text-foreground hover:text-primary transition-colors">
              Artistas
            </a>
            <a href="/eventos" className="text-foreground hover:text-primary transition-colors">
              Eventos
            </a>
            <a href="/precios" className="text-foreground hover:text-primary transition-colors">
              Precios
            </a>
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-muted"
                  onClick={() => setLocation("/dashboard")}
                >
                  Panel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-muted"
                  onClick={() => setLocation("/login")}
                >
                  Acceso
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setLocation("/registro")}
                >
                  Registro
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Descubre artistas y eventos únicos</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              La plataforma de <span className="text-primary">artistas</span> y <span className="text-secondary">eventos</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Conecta con artistas talentosos, descubre eventos increíbles y vive experiencias musicales inolvidables.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Busca artistas, eventos o géneros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-card/50 border-border text-foreground placeholder:text-muted-foreground py-3"
                />
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
                Buscar
              </Button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setLocation("/explorar-artistas")}
            >
              Explorar Artistas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:bg-muted"
              onClick={() => setLocation("/eventos")}
            >
              Ver Eventos
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Eventos Destacados</h3>
              <p className="text-muted-foreground">Los mejores eventos de la semana</p>
            </div>
            <Button
              variant="outline"
              className="border-border hover:bg-muted hidden md:flex"
              onClick={() => setLocation("/eventos")}
            >
              Ver Todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-card/50 border-border overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => setLocation(`/eventos/${event.id}`)}
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-foreground mb-2">{event.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{event.artist}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {event.city}
                    </div>
                    <span className="font-semibold text-primary">{event.price}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Artistas Destacados</h3>
              <p className="text-muted-foreground">Talento en la plataforma</p>
            </div>
            <Button
              variant="outline"
              className="border-border hover:bg-muted hidden md:flex"
              onClick={() => setLocation("/explorar-artistas")}
            >
              Ver Todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArtists.map((artist) => (
              <Card
                key={artist.id}
                className="bg-card/50 border-border overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
                onClick={() => setLocation(`/artista/${artist.id}`)}
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{artist.name}</h4>
                    {artist.verified && (
                      <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{artist.category}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    {artist.city}
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-sm">
                    Ver Perfil
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">¿Eres un artista?</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Publica tus eventos, conecta con tu audiencia y crece tu carrera artística en Tuesdi.
          </p>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setLocation(isAuthenticated ? "/publicar-evento" : "/registro")}
          >
            Comenzar Ahora
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Music2 className="w-6 h-6 text-primary" />
                <span className="font-bold text-foreground">Tuesdi</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma de artistas y eventos
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/explorar-artistas" className="hover:text-primary">Artistas</a></li>
                <li><a href="/eventos" className="hover:text-primary">Eventos</a></li>
                <li><a href="/precios" className="hover:text-primary">Precios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Términos</a></li>
                <li><a href="#" className="hover:text-primary">Privacidad</a></li>
                <li><a href="#" className="hover:text-primary">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Síguenos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary">Instagram</a></li>
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-primary">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Tuesdi. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
