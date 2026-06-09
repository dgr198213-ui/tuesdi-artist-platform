import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Music2 } from "lucide-react";

export default function ExplorarArtistas() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedCity, setSelectedCity] = useState("");
  const [artists, setArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    "Todos",
    "Cantautor/a",
    "DJ / Productor",
    "Banda de Rock",
    "Artista Flamenco",
    "Música Electrónica",
    "Cantante Pop",
  ];

  const cities = [
    "Madrid",
    "Barcelona",
    "Valencia",
    "Sevilla",
    "Bilbao",
    "Málaga",
    "Todas",
  ];

  // Fetch artists with filters
  useEffect(() => {
    const fetchArtists = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from("artists").select("*");

        if (selectedCategory !== "Todos") {
          query = query.eq("category", selectedCategory);
        }

        if (selectedCity && selectedCity !== "Todas") {
          query = query.eq("city", selectedCity);
        }

        if (searchTerm) {
          query = query.or(
            `name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`
          );
        }

        const { data, error } = await query.limit(50);

        if (error) {
          console.error("Error fetching artists:", error);
          setArtists([]);
        } else {
          setArtists(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
        setArtists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtists();
  }, [searchTerm, selectedCategory, selectedCity]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo.png" alt="Tuesdi Logo" className="w-10 h-10 object-contain" />
            <h1 className="text-2xl font-bold text-foreground">Tuesdi</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/explorar-artistas" className="text-primary font-medium">Artistas</a>
            <a href="/eventos" className="text-foreground hover:text-primary transition-colors">Eventos</a>
            <a href="/precios" className="text-foreground hover:text-primary transition-colors">Precios</a>
          </nav>
          <Button size="sm" onClick={() => setLocation("/dashboard")}>Panel</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">Explorar Artistas</h2>
          <p className="text-muted-foreground">Descubre el mejor talento artístico para tu próximo evento.</p>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-8">
            <div>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-card border-border"
                />
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Categoría</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat)}
                        className="text-xs"
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Ciudad</h3>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((city) => (
                      <Button
                        key={city}
                        variant={selectedCity === city ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCity(city)}
                        className="text-xs"
                      >
                        {city}
                      </Button>
                    ))}
                  </div>
                </div>
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
              <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border">
                <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground text-lg">
                  No se encontraron artistas con los filtros seleccionados
                </p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSelectedCategory("Todos");
                    setSelectedCity("Todas");
                    setSearchTerm("");
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {artists.map((artist) => (
                  <Card
                    key={artist.id}
                    className="bg-card/50 border-border overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => setLocation(`/artista/${artist.id}`)}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                      {artist.avatar_url ? (
                        <img
                          src={artist.avatar_url}
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40">
                          <Music2 size={48} />
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {artist.name}
                          </h3>
                          <p className="text-sm text-primary font-medium">{artist.category}</p>
                        </div>
                        {artist.verified && (
                          <div className="bg-secondary/20 text-secondary-foreground p-1 rounded-full" title="Verificado">
                            <Sparkles size={14} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                        <MapPin className="w-4 h-4" />
                        {artist.city}
                      </div>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Ver Perfil Completo
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
