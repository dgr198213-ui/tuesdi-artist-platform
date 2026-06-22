/**
 * TUESDI - Tu Escenario Digital v3.0
 * Directorio de Eventos (/eventos)
 * Diseño: Stitch "Digital Stage" (directorio_de_eventos_tuesdi_1 + _2)
 */

import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";
import FetchErrorState from "@/components/FetchErrorState";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { EVENT_CATEGORIES, FILTER_CITIES, FILTER_ALL } from "@/lib/constants";

const CATEGORIES = [FILTER_ALL, ...EVENT_CATEGORIES];
const CITIES = [...FILTER_CITIES];
const PAGE_SIZE = 12;

interface Event {
  id: string;
  title: string;
  description: string | null;
  category: string;
  city: string;
  country: string | null;
  event_date: string;
  event_time: string | null;
  image_url: string | null;
  organizer_name: string | null;
  status: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const month = d.toLocaleDateString("es-ES", { month: "short" }).toUpperCase().replace(".", "");
  const day = d.getDate().toString().padStart(2, "0");
  return { month, day };
}

export default function Eventos() {
  const [, setLocation] = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [city, setCity] = useState("Todas");

  const fetchEvents = useCallback(async (currentPage: number, reset: boolean) => {
    setIsLoading(true);
    setHasError(false);

    const { data, error } = await supabase.functions.invoke("get-events", {
      body: {
        search: search || undefined,
        category: category !== "Todas" ? category : undefined,
        city: city !== "Todas" ? city : undefined,
        page: currentPage,
        pageSize: PAGE_SIZE,
      },
    });

    if (error || !data?.events) {
      console.error("[Eventos] Error cargando eventos:", error);
      setHasError(true);
    } else {
      setEvents(reset ? data.events : (prev) => [...prev, ...data.events]);
      setHasMore(data.hasMore);
    }
    setIsLoading(false);
  }, [search, category, city]);

  useEffect(() => {
    setPage(0);
    fetchEvents(0, true);
  }, [fetchEvents]);

  const applyFilters = () => {
    setSearch(searchInput);
    setPage(0);
  };

  const clearFilters = () => {
    setSearchInput(""); setSearch("");
    setCategory("Todas"); setCity("Todas");
    setPage(0);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchEvents(next, false);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary/30">
      {/* Nav */}
      <PageNav active="eventos" />

      <main className="pt-xl min-h-screen">
        {/* Hero */}
        <section className="relative px-margin py-xl max-w-7xl mx-auto overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 bg-secondary/5 blur-[80px] rounded-full"></div>
          <div className="relative z-10 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-sm mb-base">
              <div className="w-2 h-2 rounded-full bg-secondary pulse-live"></div>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">En Vivo</span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-md">
              Descubre oportunidades y <span className="text-primary">eventos culturales</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
              Explora la agenda de eventos culturales y artísticos. Publicación gratuita, sin comisiones.
            </p>
          </div>
        </section>

        {/* Search & Filter */}
        <section className="px-margin mb-lg max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-md items-center glass-card p-sm rounded-xl mb-md">
            <div className="flex-1 relative w-full">
              <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">search</span>
              <input
                className="w-full bg-surface-container-lowest border-none rounded-lg pl-xl pr-md py-sm focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline/50 font-body-md outline-none"
                placeholder="Buscar por evento, ciudad o artista..."
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              />
            </div>
            <div className="flex flex-wrap md:flex-nowrap gap-sm w-full md:w-auto">
              <select
                className="bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-base text-on-surface-variant focus:border-primary outline-none min-w-[140px]"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c === "Todas" ? "Categoría" : c}</option>)}
              </select>
              <select
                className="bg-surface-container-lowest border border-outline-variant rounded-lg py-sm px-base text-on-surface-variant focus:border-primary outline-none min-w-[140px]"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {CITIES.map((c) => <option key={c} value={c}>{c === "Todas" ? "Ciudad" : c}</option>)}
              </select>
              <button
                className="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold bloom-primary hover:opacity-90 transition-all flex items-center gap-xs whitespace-nowrap"
                onClick={applyFilters}
              >
                <span className="material-symbols-outlined">search</span> Buscar
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              {isLoading ? "Buscando..." : `${events.length}${hasMore ? "+" : ""} eventos encontrados`}
            </p>
            <button
              className="bg-secondary text-black px-md py-xs rounded-full font-label-sm text-label-sm font-bold hover:opacity-90 transition-all flex items-center gap-xs"
              onClick={() => setLocation("/publicar-evento")}
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Publicar Evento
            </button>
          </div>
        </section>

        {/* Grid */}
        <section className="max-w-7xl mx-auto px-margin pb-xl">
          {hasError ? (
            <FetchErrorState
              resourceLabel="los eventos"
              onRetry={() => fetchEvents(0, true)}
            />
          ) : isLoading && events.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="glass-card rounded-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-surface-container"></div>
                  <div className="p-md space-y-sm">
                    <div className="h-3 bg-surface-container rounded w-1/3"></div>
                    <div className="h-4 bg-surface-container rounded w-3/4"></div>
                    <div className="h-3 bg-surface-container rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="glass-card rounded-xl p-xl text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[64px] mb-md block">event_busy</span>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Sin eventos próximos</h3>
              <p className="font-body-md text-body-md mb-lg">No hay eventos que coincidan con tu búsqueda.</p>
              <div className="flex flex-col sm:flex-row gap-md justify-center">
                <button className="text-primary font-label-sm text-label-sm underline" onClick={clearFilters}>Limpiar filtros</button>
                <button
                  className="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold bloom-primary"
                  onClick={() => setLocation("/publicar-evento")}
                >
                  Publicar el primero
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
                {events.map((event) => {
                  const { month, day } = formatDate(event.event_date);
                  return (
                    <div
                      key={event.id}
                      className="glass-card rounded-xl overflow-hidden flex flex-col group cursor-pointer"
                      onClick={() => setLocation(`/eventos/${event.id}`)}
                    >
                      <div className="relative h-48 overflow-hidden bg-surface-container">
                        {event.image_url ? (
                          <img loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={event.image_url} alt={event.title} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center spotlight">
                            <span className="material-symbols-outlined text-[48px] text-primary/30">event</span>
                          </div>
                        )}
                        <div className="absolute top-base right-base bg-background/80 backdrop-blur-md px-sm py-xs rounded text-center min-w-[50px]">
                          <span className="block font-label-sm text-label-sm text-primary">{month}</span>
                          <span className="block font-headline-md text-headline-md leading-none">{day}</span>
                        </div>
                      </div>
                      <div className="p-md flex flex-col flex-1">
                        <div className="flex items-center gap-xs mb-base">
                          <span className="font-label-sm text-label-sm px-sm py-1 rounded-full border border-white/10 text-on-surface-variant uppercase">{event.category}</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md text-on-surface mb-xs group-hover:text-primary transition-colors">{event.title}</h3>
                        <div className="flex items-center gap-xs text-on-surface-variant mb-base">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          <span className="font-body-md text-body-md">{event.city}</span>
                        </div>
                        {event.event_time && (
                          <div className="flex items-center gap-xs text-on-surface-variant mb-md">
                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                            <span className="font-label-sm text-label-sm">{event.event_time}</span>
                          </div>
                        )}
                        <div className="mt-auto pt-md border-t border-white/5">
                          <button className="w-full py-sm rounded-lg bg-white/5 border border-white/10 hover:border-primary hover:text-primary transition-all font-bold text-white">
                            Ver Evento
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-xl">
                  <button
                    className="neon-border text-secondary px-xl py-sm rounded-lg font-bold hover:bg-secondary/10 transition-all flex items-center gap-sm disabled:opacity-50"
                    onClick={loadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><span className="material-symbols-outlined animate-spin">sync</span> Cargando...</>
                    ) : (
                      <><span className="material-symbols-outlined">expand_more</span> Cargar más eventos</>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <PageFooter />
    </div>
  );
}
