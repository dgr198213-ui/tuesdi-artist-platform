import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Calendar, MapPin, Music2, Sparkles } from "lucide-react";

export default function Eventos() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const cities = [
    "Todas",
    "Madrid",
    "Barcelona",
    "Valencia",
    "Sevilla",
    "Bilbao",
    "Málaga",
  ];

  // Fetch events with filters
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        let query = supabase.from("events").select("*");

        if (selectedCity && selectedCity !== "Todas") {
          query = query.eq("city", selectedCity);
        }

        if (searchTerm) {
          query = query.or(
            `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,venue.ilike.%${searchTerm}%`
          );
        }

        if (startDate) {
          query = query.gte("event_date", startDate);
        }

        if (endDate) {
          query = query.lte("event_date", endDate);
        }

        const { data, error } = await query.limit(50);

        if (error) {
          console.error("Error fetching events:", error);
          setEvents([]);
        } else {
          setEvents(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [searchTerm, selectedCity, startDate, endDate]);

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
            <a href="/explorar-artistas" className="text-foreground hover:text-primary transition-colors">Artistas</a>
            <a href="/eventos" className="text-primary font-medium">Eventos</a>
            <a href="/precios" className="text-foreground hover:text-primary transition-colors">Precios</a>
          </nav>
          <Button size="sm" onClick={() => setLocation("/dashboard")}>Panel</Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-foreground mb-2">Próximos Eventos</h2>
          <p className="text-muted-foreground">Encuentra las mejores presentaciones musicales cerca de ti.</p>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="space-y-8">
            <div className="bg-card/30 p-6 rounded-xl border border-border">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>

              <div className="space-y-6">
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

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Rango de Fechas</h3>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Desde</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-background border-border text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Hasta</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-background border-border text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <Spinner />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 bg-card/30 rounded-xl border border-dashed border-border">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground text-lg">
                  No se encontraron eventos con los filtros seleccionados
                </p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSelectedCity("Todas");
                    setStartDate("");
                    setEndDate("");
                    setSearchTerm("");
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className="bg-card/50 border-border overflow-hidden hover:border-primary/50 transition-all cursor-pointer group"
                    onClick={() => setLocation(`/eventos/${event.id}`)}
                  >
                    <div className="relative h-44 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40">
                          <Music2 size={48} />
                        </div>
                      )}
                      {event.price && (
                        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-primary font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                          {event.price}
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            {event.event_date} {event.event_time && `• ${event.event_time}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="line-clamp-1">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium text-foreground/80">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{event.city}</span>
                        </div>
                      </div>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                        <Sparkles size={16} />
                        Ver Detalles
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
