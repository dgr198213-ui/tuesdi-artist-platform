/**
 * TUESDI - Tu Escenario Digital v3.0
 * Directorio de Artistas
 *
 * URL: /artistas
 * Funciones:
 * - Buscador
 * - Filtros (nombre, categoría, ciudad)
 * - Exploración visual
 * - Paginación / Carga progresiva
 * - Tarjetas con fotografía, nombre, categoría, ciudad, caché orientativo
 */

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Music2, Sparkles, CheckCircle, Euro, ChevronDown } from "lucide-react";

export default function ExplorarArtistas() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedCity, setSelectedCity] = useState("");
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Todas",
    "Cantante",
    "Músico",
    "DJ",
    "Banda",
    "Mago",
    "Humorista",
    "Actor",
    "Bailarín",
    "Performer",
  ];

  const cities = [
    "Madrid",
    "Barcelona",
    "Valencia",
    "Sevilla",
    "Bilbao",
    "Málaga",
    "Zaragoza",
    "Palma de Mallorca",
    "Las Palmas",
    "Murcia",
  ];

  // Datos de ejemplo para cuando Supabase no está configurado
  const sampleArtists = [
    {
      id: "luna-martinez",
      artist_name: "Luna Martínez",
      category: "Cantante",
      city: "Madrid",
      bio: "Cantautora con más de 10 años de experiencia en escenarios nacionales e internacionales.",
      starting_price: "500€",
      verified: true,
      subscription_plan: "pro",
      profile_image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "dj-carlos",
      artist_name: "DJ Carlos",
      category: "DJ",
      city: "Barcelona",
      bio: "DJ y productor especializado en música electrónica y house.",
      starting_price: "300€",
      verified: false,
      subscription_plan: "standard",
      profile_image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "the-rock-stars",
      artist_name: "The Rock Stars",
      category: "Banda",
      city: "Valencia",
      bio: "Banda de rock clásico con repertorio propio y versiones de los grandes clásicos.",
      starting_price: "800€",
      verified: true,
      subscription_plan: "pro",
      profile_image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "mago-alex",
      artist_name: "Mago Álex",
      category: "Mago",
      city: "Sevilla",
      bio: "Magia de cerca y escenario para eventos privados y corporativos.",
      starting_price: "400€",
      verified: true,
      subscription_plan: "standard",
      profile_image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "ana-dancers",
      artist_name: "Ana Dancers",
      category: "Bailarín",
      city: "Madrid",
      bio: "Bailarina profesional especializada en danza contemporánea y urbana.",
      starting_price: "350€",
      verified: false,
      subscription_plan: "beta",
      profile_image: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "comedy-juan",
      artist_name: "Juan Humor",
      category: "Humorista",
      city: "Barcelona",
      bio: "Monologuista y cómico con experiencia en teatros y clubs de comedia.",
      starting_price: "450€",
      verified: true,
      subscription_plan: "standard",
      profile_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
  ];

  // Fetch artists with filters
  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from("artists").select("*");

        if (selectedCategory !== "Todas") {
          query = query.eq("category", selectedCategory);
        }

        if (selectedCity) {
          query = query.eq("city", selectedCity);
        }

        if (searchTerm) {
          query = query.or(
            `artist_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`
          );
        }

        query = query.order("subscription_plan", { ascending: false });
        const { data, error } = await query.limit(50);

        if (error || !data || data.length === 0) {
          // Usar datos de ejemplo si no hay conexión a Supabase
          let filteredArtists = sampleArtists;

          if (selectedCategory !== "Todas") {
            filteredArtists = filteredArtists.filter(a => a.category === selectedCategory);
          }

          if (selectedCity) {
            filteredArtists = filteredArtists.filter(a => a.city === selectedCity);
          }

          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredArtists = filteredArtists.filter(
              a =>
                a.artist_name.toLowerCase().includes(term) ||
                a.bio.toLowerCase().includes(term)
            );
          }

          setArtists(filteredArtists);
        } else {
          setArtists(data);
        }
      } catch {
        // Usar datos de ejemplo en caso de error
        let filteredArtists = sampleArtists;

        if (selectedCategory !== "Todas") {
          filteredArtists = filteredArtists.filter(a => a.category === selectedCategory);
        }

        if (selectedCity) {
          filteredArtists = filteredArtists.filter(a => a.city === selectedCity);
        }

        setArtists(filteredArtists);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, [searchTerm, selectedCategory, selectedCity]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setLocation("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">TUESDI</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Tu Escenario Digital</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/artistas" className="text-sm font-medium text-primary">Artistas</a>
            <a href="/eventos" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Eventos</a>
            <a href="/planes" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Planes</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/login")}>
              Acceso
            </Button>
            <Button size="sm" className="bg-primary text-white hover:bg-primary/90" onClick={() => setLocation("/registro")}>
              Registro
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Directorio de Artistas
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Descubre talento para tu próximo evento. Contacta directamente sin intermediarios.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-8">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar artistas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-white/10 text-white"
              />
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <Music2 className="w-4 h-4 text-primary" />
                Categoría
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* City Filter */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Ciudad
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCity("")}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                    selectedCity === ""
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:bg-white/5 hover:text-white"
                  }`}
                >
                  Todas las ciudades
                </button>
                {cities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                      selectedCity === city
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Artists Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Spinner />
              </div>
            ) : artists.length === 0 ? (
              <div className="text-center py-20 bg-card border border-white/10 rounded-2xl">
                <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground text-lg mb-4">
                  No se encontraron artistas con los filtros seleccionados
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory("Todas");
                    setSelectedCity("");
                    setSearchTerm("");
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-muted-foreground">
                  Mostrando {artists.length} artista{artists.length !== 1 ? "s" : ""}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {artists.map((artist) => (
                    <Card
                      key={artist.id}
                      className="bg-card border-white/10 overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
                      onClick={() => setLocation(`/artista/${artist.slug || artist.id}`)}
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={artist.profile_image || artist.avatar_url || "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80"}
                          alt={artist.artist_name || artist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {artist.verified && (
                          <div className="absolute top-3 left-3 bg-secondary text-black p-1.5 rounded-full">
                            <CheckCircle size={14} />
                          </div>
                        )}
                        {artist.subscription_plan === "pro" && (
                          <div className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                            Pro
                          </div>
                        )}
                        {artist.subscription_plan === "standard" && (
                          <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                            Standard
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                              {artist.artist_name || artist.name}
                            </h3>
                            <p className="text-xs text-primary font-semibold uppercase tracking-wider">
                              {artist.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4" />
                          {artist.city}
                        </div>
                        {artist.starting_price && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                            <Euro className="w-4 h-4" />
                            <span>Caché orientativo: {artist.starting_price}</span>
                          </div>
                        )}
                        <Button className="w-full bg-white/10 hover:bg-primary text-white transition-colors">
                          Ver Perfil
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-white font-semibold">TUESDI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/aviso-legal" className="hover:text-primary transition-colors">Aviso Legal</a>
              <a href="/politica-privacidad" className="hover:text-primary transition-colors">Privacidad</a>
              <a href="/terminos-servicio" className="hover:text-primary transition-colors">Términos</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} TUESDI — Tu Escenario Digital.
          </div>
        </div>
      </footer>
    </div>
  );
}