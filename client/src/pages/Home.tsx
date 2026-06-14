/**
 * TUESDI - Tu Escenario Digital v3.0
 * Página Principal (Home)
 *
 * Diseño: Stitch "Digital Stage" (home_planes_refinados_tuesdi)
 * - Hero con título y subtítulo oficiales
 * - Artistas destacados (datos reales con fallback a contenido de ejemplo)
 * - Cómo funciona
 * - Próximos eventos (datos reales con fallback a contenido de ejemplo)
 * - Planes (Beta / Standard / Pro)
 * - CTA final
 */

import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

interface FeaturedArtist {
  slug: string;
  artist_name: string;
  category: string;
  bio: string | null;
  profile_image: string | null;
}

interface UpcomingEvent {
  id: string;
  title: string;
  city: string;
  event_date: string;
  category: string | null;
}

const MOCK_ARTISTS: FeaturedArtist[] = [
  {
    slug: "elena-rivers",
    artist_name: "Elena Rivers",
    category: "Singer / Songwriter",
    bio: "Vocalista Jazz & Soul con más de 10 años de experiencia en salas nacionales.",
    profile_image: "/gallery/dj-publico-verde.jpg",       // cantante con micro
  },
  {
    slug: "echo-pulse",
    artist_name: "Echo Pulse",
    category: "DJ / Producer",
    bio: "Especialista en Techno Melódico y House Progresivo. Residente en SoundSystem.",
    profile_image: "/gallery/guitarrista-humo-escenario.jpg", // DJ de espaldas con público
  },
  {
    slug: "lunar-riot",
    artist_name: "Lunar Riot",
    category: "Rock Band",
    bio: "Cuarteto de Rock Alternativo. Potencia y melodía en cada directo.",
    profile_image: "/gallery/cantante-guitarra-escenario.jpg", // guitarrista en escenario
  },
];

const MOCK_EVENTS: UpcomingEvent[] = [
  { id: "mock-1", title: "Noche de Jazz", city: "Madrid, ES", event_date: "2026-10-24", category: "Música" },
  { id: "mock-2", title: "Underground Bass", city: "Barcelona, ES", event_date: "2026-10-28", category: "Música" },
  { id: "mock-3", title: "Art Showcase", city: "Valencia, ES", event_date: "2026-11-02", category: "Arte" },
  { id: "mock-4", title: "Indie Fest", city: "Sevilla, ES", event_date: "2026-11-15", category: "Música" },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [artists, setArtists] = useState<FeaturedArtist[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);

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

  useEffect(() => {
    const loadFeatured = async () => {
      const { data: artistsData } = await supabase
        .from("artists")
        .select("slug, artist_name, category, bio, profile_image")
        .order("created_at", { ascending: false })
        .limit(3);

      if (artistsData && artistsData.length > 0) {
        setArtists(artistsData as FeaturedArtist[]);
      }

      const today = new Date().toISOString().split("T")[0];
      const { data: eventsData } = await supabase
        .from("events")
        .select("id, title, city, event_date, category")
        .eq("status", "approved")
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(4);

      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData as UpcomingEvent[]);
      }
    };

    loadFeatured();
  }, []);

  const displayArtists = artists.length > 0 ? artists : MOCK_ARTISTS;
  const displayEvents = events.length > 0 ? events : MOCK_EVENTS;
  const usingMockEvents = events.length === 0;

  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date
      .toLocaleDateString("es-ES", { month: "short", day: "2-digit" })
      .toUpperCase()
      .replace(".", "");
  };

  const goToProfile = () => setLocation(isAuthenticated ? "/dashboard" : "/registro");

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary selection:text-on-primary">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/10 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,129,255,0.15)]">
        <div className="flex justify-between items-center px-margin py-base max-w-7xl mx-auto">
          <button
            className="flex items-center gap-xs"
            onClick={() => setLocation("/")}
          >
            <img
              src="/isotipo-nuevo.png"
              alt="TUESDI"
              className="h-8 w-8 object-contain"
              style={{ filter: "drop-shadow(0 0 0 #000) brightness(1.05)" }}
            />
            <span className="font-headline-md text-headline-md font-bold text-primary">TUESDI</span>
          </button>
          <div className="hidden md:flex items-center gap-md">
            <button className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1">
              Inicio
            </button>
            <button
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setLocation("/artistas")}
            >
              Artistas
            </button>
            <button
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setLocation("/eventos")}
            >
              Eventos
            </button>
            <button
              className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setLocation("/planes")}
            >
              Planes
            </button>
          </div>
          <div className="flex items-center gap-sm">
            {isAuthenticated ? (
              <button
                className="font-label-sm text-label-sm text-primary hover:opacity-80 transition-all duration-300"
                onClick={() => setLocation("/dashboard")}
              >
                Mi Panel
              </button>
            ) : (
              <button
                className="font-label-sm text-label-sm text-primary hover:opacity-80 transition-all duration-300"
                onClick={() => setLocation("/login")}
              >
                Acceso
              </button>
            )}
            <button
              className="bg-primary text-on-primary font-label-sm text-label-sm px-md py-xs rounded-full bloom-primary scale-95 duration-200 ease-in-out hover:scale-100"
              onClick={goToProfile}
            >
              Crear Perfil
            </button>
          </div>
        </div>
      </nav>

      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-xl px-margin overflow-hidden">
          {/* Real background photo */}
          <div className="absolute inset-0 z-0">
            <img
              src="/gallery/concierto-confeti-luces.jpg"
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30"></div>
          </div>
          <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-secondary/10 blur-[120px] rounded-full"></div>
          <div className="max-w-4xl text-center z-10">
            <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full border border-white/10 bg-white/5 mb-md">
              <span className="w-2 h-2 rounded-full bg-secondary pulse-live"></span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
                En Vivo: Beta Abierta
              </span>
            </div>
            <h1 className="font-headline-xl text-[40px] md:text-headline-xl text-on-surface mb-md leading-[1.15]">
              Tu Escenario Digital.<br />
              <span className="text-primary italic">Visibilidad profesional</span><br className="hidden md:block" /> sin intermediarios.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xs max-w-2xl mx-auto">
              Muestra tu trabajo. Protege tu privacidad. Recibe oportunidades.
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant/60 mb-lg max-w-xl mx-auto uppercase tracking-wide">
              Sin comisiones &nbsp;·&nbsp; Sin exponer tus datos &nbsp;·&nbsp; Sin algoritmos
            </p>
            <div className="flex flex-col md:flex-row gap-md justify-center">
              <button
                className="bg-primary text-on-primary font-headline-md text-headline-md px-lg py-sm rounded-lg bloom-primary hover:scale-105 transition-transform duration-300"
                onClick={goToProfile}
              >
                Crear Perfil
              </button>
              <button
                className="neon-border text-on-surface font-headline-md text-headline-md px-lg py-sm rounded-lg hover:bg-white/5"
                onClick={() => setLocation("/artistas")}
              >
                Ver Artistas
              </button>
            </div>
          </div>
          <div className="absolute bottom-base left-1/2 -translate-x-1/2 animate-bounce opacity-50">
            <span className="material-symbols-outlined text-on-surface-variant">keyboard_double_arrow_down</span>
          </div>
        </section>

        {/* Featured Artists Section */}
        <section className="py-xl px-margin max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-lg">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Artistas Destacados</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Descubre el talento que está marcando tendencia
              </p>
            </div>
            <button
              className="font-label-sm text-label-sm text-primary flex items-center gap-xs hover:gap-sm transition-all"
              onClick={() => setLocation("/artistas")}
            >
              Ver todos <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {displayArtists.map((artist) => (
              <div
                key={artist.slug}
                className="glass-card group rounded-xl overflow-hidden cursor-pointer"
                onClick={() => setLocation(`/artista/${artist.slug}`)}
              >
                <div className="aspect-[4/5] relative overflow-hidden">
                  {artist.profile_image ? (
                    <img
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100"
                      src={artist.profile_image}
                      alt={artist.artist_name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant">
                      <span className="material-symbols-outlined text-[64px]">person</span>
                    </div>
                  )}
                  {artist.category && (
                    <div className="absolute top-sm left-sm bg-black/50 backdrop-blur-md px-sm py-xs rounded-full">
                      <span className="font-label-sm text-label-sm text-secondary">{artist.category}</span>
                    </div>
                  )}
                </div>
                <div className="p-md">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">{artist.artist_name}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-md line-clamp-2">
                    {artist.bio || "Artista en TUESDI"}
                  </p>
                  <button className="w-full py-xs border border-white/10 rounded-lg font-label-sm text-label-sm hover:bg-primary hover:text-on-primary transition-all">
                    Ver Portafolio
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-xl bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="text-center mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">¿Cómo funciona?</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Tres pasos para profesionalizar tu presencia digital
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-md border border-primary/20">
                  <span className="material-symbols-outlined text-primary text-[32px]">app_registration</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">1. Regístrate</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Crea tu cuenta de forma gratuita en menos de un minuto.
                </p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-md border border-secondary/20">
                  <span className="material-symbols-outlined text-secondary text-[32px]">account_circle</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">2. Crea tu Perfil</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Añade tus mejores trabajos, enlaces y biografía profesional.
                </p>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center mb-md border border-primary-container/20">
                  <span className="material-symbols-outlined text-primary-container text-[32px]">mail</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">3. Recibe Contactos</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Recibe ofertas directamente a través de nuestro sistema seguro.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-xl px-margin max-w-7xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg">Próximos Eventos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
            {displayEvents.map((event) => (
              <div
                key={event.id}
                className="glass-card rounded-lg p-md cursor-pointer"
                onClick={() => !usingMockEvents && setLocation(`/eventos/${event.id}`)}
              >
                <div className="flex justify-between items-start mb-sm">
                  <div className="bg-primary/20 text-primary px-xs py-1 rounded font-label-sm text-label-sm">
                    {formatEventDate(event.event_date)}
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">event</span>
                </div>
                <h4 className="font-headline-md text-headline-md text-on-surface mb-xs">{event.title}</h4>
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">location_on</span> {event.city}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-lg">
            <button
              className="font-label-sm text-label-sm text-primary flex items-center gap-xs justify-center mx-auto hover:gap-sm transition-all"
              onClick={() => setLocation("/eventos")}
            >
              Ver todos los eventos <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-xl px-margin max-w-7xl mx-auto">
          <div className="text-center mb-xl">
            <div className="inline-flex items-center gap-xs px-md py-xs rounded-full border border-secondary/30 bg-secondary/10 mb-md">
              <span className="w-2 h-2 rounded-full bg-secondary pulse-live"></span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">🚀 Beta Abierta Activa</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Empieza Gratis. Sin Límites.</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto mt-sm">
              Durante la Beta Abierta, accedes a todo lo que ofrece TUESDI de forma completamente gratuita.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-center">
            {/* Beta */}
            <div className="glass-card p-lg rounded-xl flex flex-col h-full border-primary/40 shadow-[0_0_30px_rgba(0,129,255,0.15)] md:scale-105 z-10">
              <div className="flex items-center gap-xs mb-md">
                <span className="w-2 h-2 rounded-full bg-secondary pulse-live"></span>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Activo ahora</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Beta</h3>
              <div className="mb-lg">
                <span className="text-[48px] font-bold text-on-surface">0€</span>
                <span className="text-on-surface-variant">/mes</span>
              </div>
              <ul className="space-y-sm mb-xl flex-grow flex flex-col gap-sm">
                {["Perfil completo", "Galería multimedia", "Contacto privado", "Dashboard + Analíticas", "Publicación de eventos"].map((f) => (
                  <li key={f} className="flex items-center gap-xs font-body-md text-body-md">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className="w-full py-sm rounded-lg bg-primary text-on-primary bloom-primary font-label-sm text-label-sm font-bold hover:opacity-90 transition-all"
                onClick={() => setLocation("/acceso")}
              >
                Crear Perfil Gratis
              </button>
            </div>

            {/* Standard - Coming Soon */}
            <div className="glass-card p-lg rounded-xl flex flex-col h-full opacity-50">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Standard</h3>
              <div className="mb-lg">
                <span className="text-[48px] font-bold text-on-surface/30">6€</span>
                <span className="text-on-surface-variant/50">/mes</span>
              </div>
              <ul className="space-y-sm mb-xl flex-grow flex flex-col gap-sm">
                {["Mejor posicionamiento", "Analíticas avanzadas", "Difusión en canales TUESDI"].map((f) => (
                  <li key={f} className="flex items-center gap-xs font-body-md text-body-md text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-outline text-[18px]">radio_button_unchecked</span> {f}
                  </li>
                ))}
              </ul>
              <div className="w-full py-sm rounded-lg border border-outline-variant text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                Próximamente
              </div>
            </div>

            {/* Pro - Coming Soon */}
            <div className="glass-card p-lg rounded-xl flex flex-col h-full opacity-50">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">Pro</h3>
              <div className="mb-lg">
                <span className="text-[48px] font-bold text-on-surface/30">9,99€</span>
                <span className="text-on-surface-variant/50">/mes</span>
              </div>
              <ul className="space-y-sm mb-xl flex-grow flex flex-col gap-sm">
                {["Prioridad en directorios", "Distintivo Pro verificado", "4 difusiones/mes en redes TUESDI", "Campañas especiales"].map((f) => (
                  <li key={f} className="flex items-center gap-xs font-body-md text-body-md text-on-surface-variant/60">
                    <span className="material-symbols-outlined text-outline text-[18px]">radio_button_unchecked</span> {f}
                  </li>
                ))}
              </ul>
              <div className="w-full py-sm rounded-lg border border-outline-variant text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                Próximamente
              </div>
            </div>
          </div>
          <p className="text-center font-label-sm text-label-sm text-on-surface-variant/50 mt-lg">
            Los datos y perfiles creados durante la Beta se mantienen al activarse los planes de pago.
          </p>
        </section>

        {/* Final CTA */}
        <section className="py-xl relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="/gallery/artista-guitarrista-luces.jpg"
              alt=""
              className="w-full h-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/50"></div>
          </div>
          <div className="absolute inset-0 spotlight opacity-20"></div>
          <div className="max-w-4xl mx-auto px-margin text-center z-10 relative">
            <h2 className="font-headline-xl text-headline-xl text-on-surface mb-md">
              Únete a la revolución artística
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
              No esperes a que te encuentren. Haz que tu talento sea imposible de ignorar.
            </p>
            <button
              className="bg-primary text-on-primary font-headline-md text-headline-md px-xl py-sm rounded-lg bloom-primary hover:scale-105 transition-transform duration-300"
              onClick={goToProfile}
            >
              Empezar Ahora
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim w-full py-xl border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin gap-md max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-headline-md text-headline-md text-on-surface opacity-50 mb-sm">TUESDI</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              © {new Date().getFullYear()} TUESDI — Tu Escenario Digital. Todos los derechos reservados.
            </p>
          </div>
          <div className="flex gap-md flex-wrap justify-center">
            <button
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setLocation("/politica-privacidad")}
            >
              Privacidad
            </button>
            <button
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setLocation("/terminos-servicio")}
            >
              Términos
            </button>
            <button
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setLocation("/contacto")}
            >
              Contacto
            </button>
            <button
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setLocation("/politica-cookies")}
            >
              Cookies
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
