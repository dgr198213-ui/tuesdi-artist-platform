import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Calendar, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Eventos() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const cities = [
    "Todas",
    "Madrid",
    "Barcelona",
    "Valencia",
    "Sevilla",
    "Bilbao",
    "Málaga",
  ];

  // Query events with filters
  const { data: events = [], isLoading } = trpc.events.list.useQuery({
    limit: 50,
    offset: 0,
    city: selectedCity && selectedCity !== "Todas" ? selectedCity : undefined,
    search: searchTerm || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const filteredEvents = events.filter((event) => {
    if (selectedCity && selectedCity !== "Todas" && event.city !== selectedCity) {
      return false;
    }
    if (
      searchTerm &&
      !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !event.description?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !event.venue?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (startDate && event.eventDate < startDate) {
      return false;
    }
    if (endDate && event.eventDate > endDate) {
      return false;
    }
    return true;
  });

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
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* City Filter */}
          <div>
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

          {/* Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">
                Desde
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-input border-border"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground block mb-2">
                Hasta
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-input border-border"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center min-h-96">
            <Spinner />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No se encontraron eventos con los filtros seleccionados
            </p>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-card/50 border-border overflow-hidden hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => setLocation(`/eventos/${event.id}`)}
              >
                <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {event.eventDate} {event.eventTime && `• ${event.eventTime}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {event.price && (
                      <span className="font-semibold text-primary">{event.price}</span>
                    )}
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Ver Evento
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
