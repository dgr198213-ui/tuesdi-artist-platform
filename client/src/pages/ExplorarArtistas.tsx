import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Music2, MapPin } from "lucide-react";

export default function ExplorarArtistas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    "Todos",
    "Cantautor/a",
    "DJ / Productor",
    "Banda de Rock",
    "Artista Flamenco",
    "Música Electrónica",
    "Cantante Pop",
  ];

  const artists = [
    {
      id: 1,
      name: "Luna Martínez",
      category: "Cantautor/a",
      city: "Madrid",
      image: "https://via.placeholder.com/200",
      verified: true,
    },
    {
      id: 2,
      name: "DJ Carlos",
      category: "DJ / Productor",
      city: "Barcelona",
      image: "https://via.placeholder.com/200",
      verified: false,
    },
    {
      id: 3,
      name: "The Rock Stars",
      category: "Banda de Rock",
      city: "Valencia",
      image: "https://via.placeholder.com/200",
      verified: true,
    },
  ];

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
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "bg-primary text-primary-foreground" : "border-border"}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <Card key={artist.id} className="bg-card/50 border-border overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                <img
                  src={artist.image}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{artist.name}</h3>
                  {artist.verified && (
                    <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                      Verificado
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{artist.category}</p>
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
      </div>
    </div>
  );
}
