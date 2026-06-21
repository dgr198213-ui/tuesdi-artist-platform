/**
 * TUESDI - Tu Escenario Digital v3.0
 * Directorio de Artistas (/artistas)
 *
 * Diseño: Stitch "Digital Stage" (directorio_de_artistas_tuesdi_1 + _2)
 * - Búsqueda por nombre, filtro por categoría y ciudad
 * - Grid con 12 artistas por bloque + botón "Cargar más"
 * - Usa esquema v3.0: slug, artist_name, category, city, starting_price, profile_image
 */

import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { ARTIST_CATEGORIES, FILTER_CITIES, FILTER_ALL } from "@/lib/constants";

const CATEGORIES = [FILTER_ALL, ...ARTIST_CATEGORIES];
const CITIES = [...FILTER_CITIES];
const PAGE_SIZE = 12;

interface Artist {
  id: string;
  slug: string;
  artist_name: string;
  category: string;
  city: string;
  starting_price: string | null;
  profile_image: string | null;
  verified: boolean;
  subscription_plan: string | null;
}

export default function ExplorarArtistas() {
  const [, setLocation] = useLocation();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("Todas");
  const [city, setCity] = useState("Todas");
  const [activeFilters, setActiveFilters] = useState<{ type: string; value: string }[]>([]);

  const fetchArtists = useCallback(async (currentPage: number, reset: boolean) => {
    setIsLoading(true);
    setHasError(false);
    let query = supabase
      .from("artists")
      .select("id, slug, artist_name, category, city, starting_price, profile_image, verified, subscription_plan")
      .order("subscription_plan", { ascending: false })
      .order("created_at", { ascending: false })
      .range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1);

    if (search) query = query.ilike("artist_name", `%${search}%`);
    if (category !== "Todas") query = query.eq("category", category);
    if (city !== "Todas") query = query.ilike("city", `%${city}%`);

    const { data, error } = await query;
    if (error || !data) {
      console.error("[ExplorarArtistas] Error cargando artistas:", error);
      setHasError(true);
    } else {
      setArtists(reset ? data : (prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    }
    setIsLoading(false);
  }, [search, category, city]);

  useEffect(() => {
    setPage(0);
    fetchArtists(0, true);
  }, [fetchArtists]);

  const applyFilters = () => {
    const filters: { type: string; value: string }[] = [];
    if (category !== "Todas") filters.push({ type: "Categoría", value: category });
    if (city !== "Todas") filters.push({ type: "Ciudad", value: city });
    setActiveFilters(filters);
    setSearch(searchInput);
    setPage(0);
  };

  const removeFilter = (type: string) => {
    if (type === "Categoría") setCategory("Todas");
    if (type === "Ciudad") setCity("Todas");
    setActiveFilters((prev) => prev.filter((f) => f.type !== type));
  };

  const clearAll = () => {
    setCategory("Todas"); setCity("Todas");
    setSearchInput(""); setSearch("");
    setActiveFilters([]);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchArtists(next, false);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary selection:text-on-primary">
      {/* Nav */}
      <PageNav active="artistas" />

      {/* Hero filtros */}
      <section className="pt-[120px] pb-xl px-margin max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-lg gap-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Directorio de Artistas</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Descubre y contacta con el talento que buscas.</p>
          </div>
          <div className="flex items-center gap-xs text-secondary font-label-sm text-label-sm bg-secondary/10 px-md py-sm rounded-full neon-border">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>fiber_manual_record</span>
            {artists.length}+ Artistas Disponibles
          </div>
        </div>

        {/* Filters Bar */}
        <div className="glass-card p-md rounded-xl flex flex-col lg:flex-row gap-md items-center mb-md">
          <div className="relative w-full lg:flex-1">
            <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              className="w-full bg-black border border-surface-variant rounded-lg pl-12 pr-md py-sm focus:outline-none focus:border-primary transition-all text-white font-body-md"
              placeholder="Buscar por nombre o palabra clave..."
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          <div className="flex flex-wrap lg:flex-nowrap gap-sm w-full lg:w-auto">
            <div className="relative w-full sm:w-auto">
              <select
                className="appearance-none bg-black border border-surface-variant rounded-lg px-md py-sm pr-10 focus:outline-none focus:border-primary transition-all text-white font-body-md w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => <option key={c}>{c === "Todas" ? "Categoría: Todas" : c}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
            <div className="relative w-full sm:w-auto">
              <select
                className="appearance-none bg-black border border-surface-variant rounded-lg px-md py-sm pr-10 focus:outline-none focus:border-primary transition-all text-white font-body-md w-full"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {CITIES.map((c) => <option key={c}>{c === "Todas" ? "Ciudad: Todas" : c}</option>)}
              </select>
              <span className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
            <button
              className="bg-primary hover:opacity-80 text-on-primary font-bold px-lg py-sm rounded-lg transition-all flex items-center gap-sm whitespace-nowrap bloom-primary"
              onClick={applyFilters}
            >
              <span className="material-symbols-outlined">filter_list</span> Filtrar
            </button>
          </div>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <div className="flex gap-sm items-center overflow-x-auto">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest whitespace-nowrap">Filtros Activos:</span>
            <div className="flex gap-xs">
              {activeFilters.map((f) => (
                <span key={f.type} className="bg-primary/20 text-primary border border-primary/30 px-sm py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                  {f.value}
                  <button onClick={() => removeFilter(f.type)}><span className="material-symbols-outlined text-[14px]">close</span></button>
                </span>
              ))}
              <button className="text-on-surface-variant hover:text-white transition-colors font-label-sm text-label-sm underline underline-offset-4 ml-sm" onClick={clearAll}>
                Limpiar todo
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-margin mb-xl">
        {hasError ? (
          <div className="glass-card rounded-xl p-xl text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[64px] mb-md block text-error">error_outline</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">No se pudo cargar el directorio</h3>
            <p className="font-body-md text-body-md mb-lg">Hubo un problema al conectar con el servidor. Inténtalo de nuevo.</p>
            <button
              className="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold bloom-primary"
              onClick={() => fetchArtists(0, true)}
            >
              Reintentar
            </button>
          </div>
        ) : isLoading && artists.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden animate-pulse">
                <div className="h-64 bg-surface-container"></div>
                <div className="p-5 space-y-sm">
                  <div className="h-4 bg-surface-container rounded w-3/4"></div>
                  <div className="h-3 bg-surface-container rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : artists.length === 0 ? (
          <div className="glass-card rounded-xl p-xl text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[64px] mb-md block">search_off</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Sin resultados</h3>
            <p className="font-body-md text-body-md">No hay artistas que coincidan con los filtros actuales.</p>
            <button className="mt-lg text-primary font-label-sm text-label-sm underline" onClick={clearAll}>Limpiar filtros</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
              {artists.map((artist) => (
                <div key={artist.id} className="glass-card rounded-xl overflow-hidden group flex flex-col h-full cursor-pointer" onClick={() => setLocation(`/artista/${artist.slug}`)}>
                  <div className="relative h-64 overflow-hidden bg-surface-container">
                    {artist.profile_image ? (
                      <img loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={artist.profile_image} alt={artist.artist_name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[64px]">person</span>
                      </div>
                    )}
                    <div className="absolute top-md left-md flex gap-xs">
                      {artist.subscription_plan === "pro" && (
                        <span className="bg-secondary/80 backdrop-blur-md text-black text-[10px] font-bold uppercase tracking-wider px-sm py-1 rounded">Pro</span>
                      )}
                      {artist.verified && (
                        <span className="bg-primary/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-sm py-1 rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verificado
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-xs">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-white group-hover:text-primary transition-colors">{artist.artist_name}</h3>
                        <p className="text-primary font-label-sm text-label-sm uppercase tracking-widest">{artist.category}</p>
                      </div>
                    </div>
                    <div className="mt-auto pt-md flex flex-col gap-sm">
                      <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">location_on</span> {artist.city}
                        </div>
                        {artist.starting_price && (
                          <div className="flex items-center gap-1 text-white font-bold">
                            <span className="material-symbols-outlined text-[16px]">payments</span> {artist.starting_price}€
                          </div>
                        )}
                      </div>
                      <button className="w-full py-sm rounded-lg border border-white/10 hover:border-primary hover:text-primary transition-all font-bold text-white bg-white/5">
                        Ver Perfil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                    <><span className="material-symbols-outlined">expand_more</span> Cargar más artistas</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <PageFooter />
    </div>
  );
}
