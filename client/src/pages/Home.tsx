import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Search, Music2, Calendar, MapPin, ArrowRight, Sparkles, Instagram } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const featuredEvents = [
    {
      id: 1,
      title: "Concierto de Luna Martínez",
      artist: "Luna Martínez",
      date: "2024-06-15",
      city: "Madrid",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80",
      price: "25€",
    },
    {
      id: 2,
      title: "Noche de DJ Carlos",
      artist: "DJ Carlos",
      date: "2024-06-16",
      city: "Barcelona",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
      price: "15€",
    },
    {
      id: 3,
      title: "The Rock Stars en Vivo",
      artist: "The Rock Stars",
      date: "2024-06-17",
      city: "Valencia",
      image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=80",
      price: "30€",
    },
  ];

  const featuredArtists = [
    {
      id: 1,
      name: "Luna Martínez",
      category: "Cantautor/a",
      city: "Madrid",
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80",
      verified: true,
    },
    {
      id: 2,
      name: "DJ Carlos",
      category: "DJ / Productor",
      city: "Barcelona",
      image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?auto=format&fit=crop&w=300&q=80",
      verified: false,
    },
    {
      id: 3,
      name: "The Rock Stars",
      category: "Banda de Rock",
      city: "Valencia",
      image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=300&q=80",
      verified: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navigation Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo-horizontal.png" alt="TUESDI" className="h-10 md:h-12 object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/explorar-artistas" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">
              Artistas
            </a>
            <a href="/eventos" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">
              Eventos
            </a>
            <a href="/precios" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">
              Precios
            </a>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-primary text-primary hover:bg-primary/10 px-6"
                onClick={() => setLocation("/dashboard")}
              >
                Mi Panel
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-primary"
                  onClick={() => setLocation("/login")}
                >
                  Acceso
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 shadow-lg shadow-primary/20"
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
      <section className="relative py-24 md:py-40 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.jpg" 
            alt="Concert Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-xs text-secondary font-bold uppercase tracking-widest">Tu Escenario Digital</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-[1.1] tracking-tight max-w-4xl mx-auto">
              Tu escaparate digital para <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">artistas y eventos.</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
              Muestra tu talento, descubre oportunidades y conecta directamente sin intermediarios.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105"
                onClick={() => setLocation("/registro")}
              >
                Crear perfil gratis
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 rounded-full px-10 h-14 text-lg font-bold backdrop-blur-sm transition-all hover:scale-105"
                onClick={() => setLocation("/publicar-evento")}
              >
                Publicar evento
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center bg-card border border-white/10 rounded-2xl overflow-hidden p-2">
                <Search className="ml-4 w-6 h-6 text-muted-foreground" />
                <Input
                  placeholder="Busca artistas, eventos o géneros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white placeholder:text-muted-foreground py-6 text-lg focus-visible:ring-0"
                />
                <Button className="bg-primary text-white hover:bg-primary/90 px-8 h-12 rounded-xl font-bold ml-2">
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-24 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Eventos Destacados</h3>
              <p className="text-muted-foreground text-lg">Los mejores eventos de la semana en la plataforma</p>
            </div>
            <Button
              variant="link"
              className="text-primary font-bold text-lg hidden md:flex items-center gap-2"
              onClick={() => setLocation("/eventos")}
            >
              Ver todos los eventos
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-card border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer group rounded-3xl"
                onClick={() => setLocation(`/eventos/${event.id}`)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md px-4 py-1 rounded-full text-primary font-bold text-sm">
                    {event.price}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{event.title}</h4>
                  <p className="text-sm text-muted-foreground mb-4 font-medium">{event.artist}</p>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {event.city}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-24 border-t border-white/5 relative z-10 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h3 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Artistas Destacados</h3>
              <p className="text-muted-foreground text-lg">Talento emergente en Tu Escenario Digital</p>
            </div>
            <Button
              variant="link"
              className="text-primary font-bold text-lg hidden md:flex items-center gap-2"
              onClick={() => setLocation("/explorar-artistas")}
            >
              Explorar todos los artistas
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArtists.map((artist) => (
              <Card
                key={artist.id}
                className="bg-card border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer group rounded-3xl"
                onClick={() => setLocation(`/artista/${artist.id}`)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {artist.verified && (
                    <div className="absolute top-4 left-4 bg-secondary text-background p-1.5 rounded-full shadow-lg">
                      <Sparkles size={16} />
                    </div>
                  )}
                </div>
                <div className="p-6 text-center">
                  <h4 className="text-2xl font-bold text-white mb-1 group-hover:text-primary transition-colors">{artist.name}</h4>
                  <p className="text-sm text-primary font-bold mb-4 uppercase tracking-widest text-xs">{artist.category}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                    <MapPin className="w-4 h-4" />
                    {artist.city}
                  </div>
                  <Button className="w-full bg-white/5 hover:bg-primary hover:text-white text-white border-white/10 rounded-2xl transition-all font-bold">
                    Ver Perfil
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 -skew-y-3 origin-right"></div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight">¿Eres un artista?</h3>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Visibilidad para artistas. Oportunidades para eventos. Sin intermediarios. Únete hoy a la mayor red de talento digital.
          </p>
          <Button
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 rounded-full px-12 h-16 text-xl font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105"
            onClick={() => setLocation(isAuthenticated ? "/publicar-evento" : "/registro")}
          >
            Comenzar Ahora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-background py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <img src="/logo-horizontal.png" alt="TUESDI" className="h-10 object-contain" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La plataforma donde artistas y eventos ganan visibilidad y se conectan sin intermediarios.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Plataforma</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><a href="/explorar-artistas" className="hover:text-primary transition-colors">Artistas</a></li>
                <li><a href="/eventos" className="hover:text-primary transition-colors">Eventos</a></li>
                <li><a href="/precios" className="hover:text-primary transition-colors">Precios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Legal</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><a href="/terminos" className="hover:text-primary transition-colors">Términos de servicio</a></li>
                <li><a href="/privacidad" className="hover:text-primary transition-colors">Política de privacidad</a></li>
                <li><a href="mailto:hola@tuesdi.es" className="hover:text-primary transition-colors">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Síguenos</h4>
              <div className="flex gap-4">
                <a href="https://instagram.com/tuesdi" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary transition-all">
                  <Instagram size={20} />
                </a>
                <a href="https://tiktok.com/@tuesdi" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary transition-all">
                  <Music2 size={20} />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-medium uppercase tracking-widest">
            <p>© {new Date().getFullYear()} TUESDI — Tu Escenario Digital.</p>
            <p>Hecho con pasión por la música.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
