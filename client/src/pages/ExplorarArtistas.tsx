import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, MapPin } from "lucide-react";

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
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Explorar Artistas</h1>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar artistas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-3">Categoría</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "border-border"
                }
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* City Filter */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Ciudad</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedCity === city ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCity(city)}
                className={
                  selectedCity === city
                    ? "bg-primary text-primary-foreground"
                    : "border-border"
                }
              >
                {city}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-96">
            <Spinner />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && artists.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No se encontraron artistas con los filtros seleccionados
            </p>
          </div>
        )}

        {/* Artists Grid */}
        {!isLoading && artists.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map((artist) => (
              <Card
                key={artist.id}
                className="bg-card/50 border-border overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => setLocation(`/artista/${artist.id}`)}
              >
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                  {artist.avatar_url && (
                    <img
                      src={artist.avatar_url}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {artist.name}
                    </h3>
                    {artist.verified && (
                      <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                        Verificado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {artist.category}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    {artist.city}
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Ver Perfil
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
