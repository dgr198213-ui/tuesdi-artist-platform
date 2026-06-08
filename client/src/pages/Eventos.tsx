import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Calendar, MapPin, Music2 } from "lucide-react";

export default function Eventos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["Todos", "Música en Vivo", "DJ", "Teatro", "Danza", "Otros"];

  const events = [
    {
      id: 1,
      title: "Concierto de Luna Martínez",
      date: "2024-06-15",
      time: "20:00",
      venue: "Teatro Principal",
      city: "Madrid",
      category: "Música en Vivo",
      image: "https://via.placeholder.com/300x200",
      price: "25€",
    },
    {
      id: 2,
      title: "Noche de DJ Carlos",
      date: "2024-06-16",
      time: "22:00",
      venue: "Club Nocturno",
      city: "Barcelona",
      category: "DJ",
      image: "https://via.placeholder.com/300x200",
      price: "15€",
    },
    {
      id: 3,
      title: "The Rock Stars en Vivo",
      date: "2024-06-17",
      time: "21:00",
      venue: "Auditorio Municipal",
      city: "Valencia",
      category: "Música en Vivo",
      image: "https://via.placeholder.com/300x200",
      price: "30€",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Catálogo de Eventos</h1>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
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

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="bg-card/50 border-border overflow-hidden hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-48 h-48 md:h-auto bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden flex-shrink-0">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{event.title}</h3>
                      <span className="text-xs bg-secondary/20 text-secondary-foreground px-3 py-1 rounded">
                        {event.category}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{event.venue}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date} • {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {event.city}
                      </div>
                      <div className="font-semibold text-primary">{event.price}</div>
                    </div>
                  </div>
                  <Button className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
