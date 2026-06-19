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

import { useAuth } from "@/hooks/useAuth";
import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useState, useEffect, useCallback } from "react";
import ProductShowcase from "@/components/ProductShowcase";

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
    profile_image: "/gallery/cantante-jazz-elena.jpg",
  },
  {
    slug: "echo-pulse",
    artist_name: "Echo Pulse",
    category: "DJ / Producer",
    bio: "Especialista en Techno Melódico y House Progresivo. Residente en SoundSystem.",
    profile_image: "/gallery/guitarrista-humo-escenario.jpg",
  },
  {
    slug: "lunar-riot",
    artist_name: "Lunar Riot",
    category: "Rock Band",
    bio: "Cuarteto de Rock Alternativo. Potencia y melodía en cada directo.",
    profile_image: "/gallery/cantante-guitarra-escenario.jpg",
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
  const { isAuthenticated } = useAuth();
  const [artists, setArtists] = useState<FeaturedArtist[]>([]);
  const [events, setEvents] = useState<UpcomingEvent[]>([]);

  const loadFeatured = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

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
      <PageNav active="home" />

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
            <div className="inline-flex items-center gap-sm px-sm py-1.5 rounded-full border border-secondary/30 bg-secondary/10 mb-md">
              <span className="w-2 h-2 rounded-full bg-secondary pulse-live shrink-0"></span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest leading-none">
                En vivo: Beta Abierta
              </span>
            </div>
            <h1 className="font-headline-xl text-[40px] md:text-headline-xl text-on-surface mb-md leading-tight max-w-3xl mx-auto">
              Tu escenario digital para mostrar tu trabajo o publicar tu evento.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-md max-w-2xl mx-auto">
              Conectamos artistas independientes y promotores culturales en un espacio soberano. Sin algoritmos que oculten tu alcance, sin comisiones ocultas y con absoluta privacidad.
            </p>
            <div className="flex flex-col md:flex-row gap-md justify-center mb-sm">
              <button
                className="bg-primary text-on-primary font-headline-md text-headline-md px-lg py-sm rounded-lg bloom-primary hover:scale-105 transition-transform duration-300"
                onClick={() => setLocation("/acceso")}
              >
                Crear perfil de artista
              </button>
              <button
                className="neon-border text-on-surface font-headline-md text-headline-md px-lg py-sm rounded-lg hover:bg-white/5"
                onClick={() => setLocation("/publicar-evento")}
              >
                Publicar evento gratis
              </button>
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant/50 mb-lg">
              Sin tarjetas de crédito · Registro en 1 minuto vía Magic Link
            </p>
          </div>
          <div className="absolute bottom-base left-1/2 -translate-x-1/2 animate-bounce opacity-50">
            <span className="material-symbols-outlined text-on-surface-variant">keyboard_double_arrow_down</span>
          </div>
        </section>

        {/* Caminos de Entrada Section */}
        <section className="py-xl px-margin max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <div className="glass-card p-xl rounded-2xl border-l-4 border-l-primary hover:bg-primary/5 transition-colors group cursor-pointer" onClick={() => setLocation("/acceso")}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-primary text-[32px]">palette</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-white mb-sm">Para Artistas</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
                Construye tu portafolio profesional en minutos, sube material multimedia según tu plan y recibe propuestas de contratación en tu bandeja privada sin exponer tu email ni tu teléfono.
              </p>
              <span className="text-primary font-bold flex items-center gap-xs group-hover:gap-sm transition-all">
                Empezar como artista <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            </div>
            <div className="glass-card p-xl rounded-2xl border-l-4 border-l-secondary hover:bg-secondary/5 transition-colors group cursor-pointer" onClick={() => setLocation("/publicar-evento")}>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-md">
                <span className="material-symbols-outlined text-secondary text-[32px]">event_available</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-white mb-sm">Para Promotores</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
                Publica las fechas de tus eventos de forma gratuita con un formulario rápido. Confirma al instante mediante tu enlace mágico y pon tu agenda frente al público y los artistas de tu zona.
              </p>
              <span className="text-secondary font-bold flex items-center gap-xs group-hover:gap-sm transition-all">
                Publicar evento gratis <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            </div>
          </div>
        </section>

        {/* TUESDI por dentro Section */}
        <section className="py-xl px-margin max-w-7xl mx-auto">
          <div className="text-center mb-xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">TUESDI por dentro</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Una herramienta real para profesionales de la cultura
            </p>
          </div>
          <ProductShowcase />
        </section>

        {/* Featured Artists Section */}
        <section className="py-xl px-margin max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-lg gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Artistas destacados</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Descubre perfiles profesionales con portfolio verificado, categoría y contacto privado directo. Muestra tu talento en un escaparate limpio e inspirado en escenarios en vivo.
              </p>
            </div>
            <button
              className="font-label-sm text-label-sm text-primary flex items-center gap-xs hover:gap-sm transition-all whitespace-nowrap"
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
        <section className="py-2xl bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-margin">
            <div className="text-center mb-xl">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Cómo funciona</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Flujos ágiles diseñados para el sector cultural
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
              {/* Artistas */}
              <div className="space-y-lg">
                <div className="flex items-center gap-sm mb-md">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">palette</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-white">Para Artistas</h3>
                </div>
                <div className="space-y-md border-l border-white/10 pl-md">
                  {[
                    { t: "Crea tu perfil", d: "Regístrate vía Magic Link y construye tu portafolio en minutos." },
                    { t: "Sube tu material", d: "Añade fotos y vídeos para mostrar tu talento al mundo." },
                    { t: "Recibe propuestas", d: "Gestiona contactos directos en tu bandeja privada sin intermediarios." }
                  ].map((step, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface-container-low"></div>
                      <h4 className="font-bold text-on-surface text-sm mb-0.5">{step.t}</h4>
                      <p className="text-on-surface-variant text-sm">{step.d}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Promotores */}
              <div className="space-y-lg">
                <div className="flex items-center gap-sm mb-md">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">event_available</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-white">Para Promotores</h3>
                </div>
                <div className="space-y-md border-l border-white/10 pl-md">
                  {[
                    { t: "Publica el evento", d: "Rellena el formulario rápido con los detalles de tu fecha." },
                    { t: "Verifica tu autoría", d: "Confirma la publicación al instante mediante tu enlace mágico." },
                    { t: "Gana visibilidad", d: "Tu evento aparece en la agenda pública frente a artistas y público." }
                  ].map((step, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-surface-container-low"></div>
                      <h4 className="font-bold text-on-surface text-sm mb-0.5">{step.t}</h4>
                      <p className="text-on-surface-variant text-sm">{step.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="py-xl px-margin max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-lg gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Próximos eventos culturales</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                La agenda viva de la plataforma. Fechas reales publicadas de forma transparente. Da visibilidad a tu propuesta en minutos con un flujo simple guiado por token HMAC seguro.
              </p>
            </div>
            <button
              className="font-label-sm text-label-sm text-primary flex items-center gap-xs hover:gap-sm transition-all whitespace-nowrap"
              onClick={() => setLocation("/eventos")}
            >
              Ver agenda completa <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
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
            <div className="inline-flex items-center gap-sm px-md py-xs rounded-full border border-secondary/30 bg-secondary/10 mb-md">
              <span className="w-2 h-2 rounded-full bg-secondary pulse-live shrink-0"></span>
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest leading-none">Beta Abierta Activa</span>
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
        <section className="py-2xl relative overflow-hidden">
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
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-md">
              Haz que tu talento sea imposible de ignorar.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl">
              Crea tu cuenta gratis en la Beta abierta de TUESDI hoy mismo y asegura tu espacio antes del lanzamiento de los planes avanzados.
            </p>
            <div className="flex flex-col items-center gap-sm">
              <button
                className="bg-primary text-on-primary font-headline-md text-headline-md px-xl py-sm rounded-lg bloom-primary hover:scale-105 transition-transform duration-300"
                onClick={() => setLocation("/acceso")}
              >
                Empezar ahora (Gratis)
              </button>
              <p className="font-label-sm text-label-sm text-on-surface-variant/50">
                Sin tarjetas de crédito · Registro en 1 minuto vía Magic Link
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <PageFooter />
    </div>
  );
}
