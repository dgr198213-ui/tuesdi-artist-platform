/**
 * TUESDI - Tu Escenario Digital v3.0
 * Perfil Público de Artista (/artista/:slug)
 *
 * Diseño: Stitch "Digital Stage" (perfil_de_artista_tuesdi)
 * - Carga el artista por `slug` (esquema 001_inicial_tuesdi.sql)
 * - Galería desde la tabla `media` (type: photo | video)
 * - Artistas similares: misma categoría
 * - Formulario de contacto -> inserta en `contact_requests`
 */

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";

interface Artist {
  id: string;
  slug: string;
  artist_name: string;
  bio: string | null;
  category: string;
  city: string;
  country: string | null;
  starting_price: string | null;
  website: string | null;
  instagram: string | null;
  youtube: string | null;
  spotify: string | null;
  profile_image: string | null;
  cover_image: string | null;
  verified: boolean;
}

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail: string | null;
  position: number;
}

interface RelatedArtist {
  slug: string;
  artist_name: string;
  category: string;
  profile_image: string | null;
}

export default function ArtistaProfile() {
  const [, params] = useRoute("/artista/:slug");
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [related, setRelated] = useState<RelatedArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", date: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  useEffect(() => {
    if (!params?.slug) return;
    setLoading(true);
    setNotFound(false);

    const load = async () => {
      const { data: artistData, error } = await supabase
        .from("artists")
        .select("*")
        .eq("slug", params.slug)
        .maybeSingle();

      if (error || !artistData) { setNotFound(true); setLoading(false); return; }
      setArtist(artistData as Artist);

      const { data: mediaData } = await supabase
        .from("media")
        .select("id, type, url, thumbnail, position")
        .eq("artist_id", artistData.id)
        .order("position", { ascending: true });
      setMedia((mediaData || []) as MediaItem[]);

      const { data: relatedData } = await supabase
        .from("artists")
        .select("slug, artist_name, category, profile_image")
        .eq("category", artistData.category)
        .neq("id", artistData.id)
        .limit(4);
      setRelated((relatedData || []) as RelatedArtist[]);

      setLoading(false);
    };

    load();
  }, [params?.slug]);

  const handleSendContact = async () => {
    if (!artist) return;
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      setSendMsg("Completa nombre, email, asunto y mensaje.");
      return;
    }
    setSending(true);
    setSendMsg("");
    const message = contactForm.date
      ? `Fecha estimada: ${contactForm.date}\n\n${contactForm.message}`
      : contactForm.message;

    const { error } = await supabase.from("contact_requests").insert([{
      artist_id: artist.id,
      sender_name: contactForm.name,
      sender_email: contactForm.email,
      subject: contactForm.subject,
      message,
      status: "new",
    }]);
    setSending(false);
    if (error) {
      setSendMsg("No se pudo enviar la propuesta. Inténtalo de nuevo.");
    } else {
      setSendMsg("Propuesta enviada. El artista la verá en su panel privado.");
      setContactForm({ name: "", email: "", subject: "", date: "", message: "" });
      setTimeout(() => { setContactOpen(false); setSendMsg(""); }, 2000);
    }
  };

  const photos = media.filter((m) => m.type === "photo");
  const videos = media.filter((m) => m.type === "video");

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center text-on-surface-variant">
        Cargando perfil...
      </div>
    );
  }

  if (notFound || !artist) {
    return (
      <div className="bg-background min-h-screen flex flex-col items-center justify-center text-center px-margin gap-md">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Artista no encontrado</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Este perfil no existe o ha sido eliminado.</p>
        <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold bloom-primary" onClick={() => setLocation("/artistas")}>
          Ver Directorio de Artistas
        </button>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface selection:bg-primary selection:text-on-primary-container">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-surface/10 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,129,255,0.15)]">
        <div className="flex justify-between items-center px-margin py-base max-w-7xl mx-auto">
          <button className="font-headline-md text-headline-md font-bold text-primary" onClick={() => setLocation("/")}><img src="/isotipo.png" alt="" className="h-7 w-7 object-contain inline-block mr-1" style={{filter:"brightness(1.05)"}} />TUESDI</button>
          <div className="hidden md:flex gap-md items-center">
            <button className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1" onClick={() => setLocation("/artistas")}>Artistas</button>
            <button className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation("/eventos")}>Eventos</button>
            <button className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation("/planes")}>Planes</button>
          </div>
          <button
            className="bg-primary-container text-on-primary-container px-md py-xs rounded-full font-label-sm text-label-sm hover:opacity-80 transition-all active:scale-95"
            onClick={() => setLocation(isAuthenticated ? "/dashboard" : "/acceso")}
          >
            {isAuthenticated ? "Mi Panel" : "Acceso"}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative w-full h-[716px] md:h-[870px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
        {artist.cover_image ? (
          <img className="absolute inset-0 w-full h-full object-cover" src={artist.cover_image} alt={artist.artist_name} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface to-secondary/10 spotlight"></div>
        )}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-margin flex flex-col justify-end pb-xl">
          <div className="flex flex-wrap items-center gap-xs mb-sm">
            <span className="bg-secondary/20 text-secondary border border-secondary/30 px-sm py-1 rounded-full font-label-sm text-label-sm uppercase">{artist.category}</span>
            <span className="bg-white/10 text-white border border-white/20 px-sm py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span> {artist.city}
            </span>
            {artist.verified && (
              <span className="bg-primary/20 text-primary border border-primary/30 px-sm py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span> Verificado
              </span>
            )}
          </div>
          <h1 className="font-headline-xl text-headline-xl text-white mb-xs tracking-tight">{artist.artist_name}</h1>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl line-clamp-2">
              {artist.bio || "Artista en TUESDI — Tu Escenario Digital."}
            </p>
            {artist.starting_price && (
              <div className="flex flex-col items-start md:items-end">
                <span className="text-on-surface-variant font-label-sm text-label-sm uppercase mb-1">Caché aproximado</span>
                <span className="font-headline-md text-headline-md text-primary">Desde {artist.starting_price}€</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-margin">
        {/* Bio & Contact */}
        <section className="py-xl grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          <div className="lg:col-span-8 space-y-md">
            <h2 className="font-headline-md text-headline-md text-primary mb-sm">Trayectoria Profesional</h2>
            <div className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line">
              {artist.bio || "Este artista todavía no ha añadido una biografía."}
            </div>
            {(artist.instagram || artist.youtube || artist.spotify || artist.website) && (
              <div className="flex gap-md pt-md">
                {artist.instagram && <a href={artist.instagram} target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">photo_camera</span></a>}
                {artist.youtube && <a href={artist.youtube} target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">play_circle</span></a>}
                {artist.spotify && <a href={artist.spotify} target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">music_note</span></a>}
                {artist.website && <a href={artist.website} target="_blank" rel="noreferrer" className="text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">language</span></a>}
              </div>
            )}
          </div>
          <div className="lg:col-span-4 sticky top-32">
            <div className="glass-card p-md rounded-xl bloom-primary">
              <div className="flex items-center gap-sm mb-md">
                <div className="w-2 h-2 rounded-full bg-secondary pulse-live shadow-[0_0_10px_rgba(172,237,255,0.8)]"></div>
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Disponible para reservas</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                Contacta directamente con {artist.artist_name} para consultar disponibilidad y presupuestos personalizados.
              </p>
              <button
                className="w-full bg-primary text-on-primary py-md rounded-lg font-headline-md text-headline-md hover:opacity-90 transition-all duration-300"
                onClick={() => setContactOpen(true)}
              >
                Contactar Artista
              </button>
              <p className="mt-md text-center font-label-sm text-label-sm text-on-surface-variant/60">Privacidad garantizada por el sistema TUESDI</p>
            </div>
          </div>
        </section>

        {/* Multimedia */}
        <section className="py-xl border-t border-white/5">
          <h2 className="font-headline-md text-headline-md text-white mb-lg">Galería &amp; Multimedia</h2>
          {photos.length === 0 && videos.length === 0 ? (
            <div className="glass-card rounded-xl p-xl text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-sm block">photo_library</span>
              Este artista todavía no ha subido contenido multimedia.
            </div>
          ) : (
            <>
              {photos.length > 0 && (
                <div className={`grid gap-md ${photos.length >= 3 ? "grid-cols-1 md:grid-cols-3 md:h-[600px]" : "grid-cols-1 md:grid-cols-2"}`}>
                  {photos.slice(0, 3).map((item, idx) => (
                    <div key={item.id} className={`relative group overflow-hidden rounded-xl ${idx === 0 && photos.length >= 3 ? "md:col-span-2 aspect-video md:aspect-auto" : "aspect-square md:aspect-auto"}`}>
                      <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" src={item.url} alt={artist.artist_name} />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                    </div>
                  ))}
                </div>
              )}
              {videos.length > 0 && (
                <div className="mt-md grid grid-cols-1 md:grid-cols-2 gap-md">
                  {videos.map((item) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="aspect-video w-full rounded-xl overflow-hidden glass-card relative group block">
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-20 h-20 bg-primary/90 text-on-primary rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                          <span className="material-symbols-outlined !text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                        </div>
                      </div>
                      {item.thumbnail ? (
                        <img className="w-full h-full object-cover opacity-60" src={item.thumbnail} alt={artist.artist_name} />
                      ) : (
                        <div className="w-full h-full bg-surface-container"></div>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="py-xl border-t border-white/5">
            <div className="flex justify-between items-center mb-lg">
              <h2 className="font-headline-md text-headline-md text-white">Artistas Similares</h2>
              <button className="text-primary font-label-sm text-label-sm uppercase flex items-center gap-1 hover:underline" onClick={() => setLocation("/artistas")}>
                Ver todos <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
              {related.map((r) => (
                <div key={r.slug} className="glass-card rounded-xl overflow-hidden group hover:border-primary transition-colors cursor-pointer" onClick={() => setLocation(`/artista/${r.slug}`)}>
                  <div className="aspect-square overflow-hidden bg-surface-container">
                    {r.profile_image ? (
                      <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={r.profile_image} alt={r.artist_name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[48px]">person</span>
                      </div>
                    )}
                  </div>
                  <div className="p-sm">
                    <h3 className="font-headline-md text-[18px] text-white">{r.artist_name}</h3>
                    <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-tighter">{r.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim w-full py-xl border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin gap-md max-w-7xl mx-auto">
          <div className="font-headline-md text-headline-md text-on-surface opacity-50"><img src="/isotipo.png" alt="" className="h-7 w-7 object-contain inline-block mr-1" style={{filter:"brightness(1.05)"}} />TUESDI</div>
          <div className="flex flex-wrap justify-center gap-md">
            {[["Privacidad", "/politica-privacidad"], ["Términos", "/terminos-servicio"], ["Contacto", "/contacto"], ["Cookies", "/politica-cookies"]].map(([label, path]) => (
              <button key={path} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation(path)}>{label}</button>
            ))}
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-70">© {new Date().getFullYear()} TUESDI. All rights reserved.</p>
        </div>
      </footer>

      {/* Contact Modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-md bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-2xl p-lg relative">
            <button className="absolute top-base right-base text-on-surface-variant hover:text-white" onClick={() => { setContactOpen(false); setSendMsg(""); }}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="font-headline-md text-headline-md text-white mb-sm">Contactar con {artist.artist_name}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              Tu información de contacto se mantendrá privada hasta que el artista responda.
            </p>
            <div className="space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div>
                  <label className="block font-label-sm text-label-sm text-primary uppercase mb-2">Tu Nombre</label>
                  <input className="w-full bg-surface-container border border-outline-variant rounded-lg p-sm text-white focus:border-primary outline-none transition-all" type="text" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-primary uppercase mb-2">Tu Email</label>
                  <input className="w-full bg-surface-container border border-outline-variant rounded-lg p-sm text-white focus:border-primary outline-none transition-all" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-primary uppercase mb-2">Asunto del Evento</label>
                <input className="w-full bg-surface-container border border-outline-variant rounded-lg p-sm text-white focus:border-primary outline-none transition-all" placeholder="Ej: Festival Jazz Verano" type="text" value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-primary uppercase mb-2">Fecha Estimada (opcional)</label>
                <input className="w-full bg-surface-container border border-outline-variant rounded-lg p-sm text-white focus:border-primary outline-none transition-all" type="date" value={contactForm.date} onChange={(e) => setContactForm({ ...contactForm, date: e.target.value })} />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-primary uppercase mb-2">Mensaje</label>
                <textarea className="w-full bg-surface-container border border-outline-variant rounded-lg p-sm text-white focus:border-primary outline-none transition-all" rows={4} placeholder="Cuéntanos más sobre el tipo de evento y lo que buscas..." value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} />
              </div>
              {sendMsg && <p className="font-label-sm text-label-sm text-secondary">{sendMsg}</p>}
              <button className="w-full bg-primary text-on-primary py-sm rounded-lg font-body-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-60" onClick={handleSendContact} disabled={sending}>
                {sending ? "Enviando..." : "Enviar Propuesta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
