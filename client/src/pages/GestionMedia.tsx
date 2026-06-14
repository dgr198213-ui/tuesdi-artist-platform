/**
 * TUESDI - Tu Escenario Digital v3.0
 * Gestión Multimedia (/dashboard/media)
 * Diseño: Stitch "Digital Stage" (gesti_n_multimedia_tuesdi)
 */

import { supabase } from "@/lib/supabase";
import DashboardShell from "@/components/DashboardShell";
import { useEffect, useRef, useState } from "react";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  url: string;
  thumbnail: string | null;
  position: number;
}

interface ArtistPlan {
  subscription_plan: string | null;
}

const PLAN_LIMITS: Record<string, { photos: number; videos: number }> = {
  pro: { photos: 3, videos: 3 },
  standard: { photos: 3, videos: 1 },
  beta: { photos: 1, videos: 0 },
};

export default function GestionMedia() {
  const [artistId, setArtistId] = useState<string | null>(null);
  const [plan, setPlan] = useState<string>("beta");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [showAddVideo, setShowAddVideo] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserId(session.user.id);

      const { data: artist } = await supabase
        .from("artists")
        .select("id, subscription_plan")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!artist) { setLoading(false); return; }
      setArtistId(artist.id);
      setPlan(artist.subscription_plan || "beta");

      const { data } = await supabase
        .from("media")
        .select("id, type, url, thumbnail, position")
        .eq("artist_id", artist.id)
        .order("position", { ascending: true });

      setMedia((data || []) as MediaItem[]);
      setLoading(false);
    };
    load();
  }, []);

  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.beta;
  const photos = media.filter((m) => m.type === "photo");
  const videos = media.filter((m) => m.type === "video");

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !userId || !artistId) return;

    const available = limits.photos - photos.length;
    if (available <= 0) { alert(`Tu plan ${plan} solo permite ${limits.photos} foto(s).`); return; }
    const toUpload = files.slice(0, available);

    setUploading(true);
    for (const file of toUpload) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/media-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("artist-media").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) continue;
      const { data: urlData } = supabase.storage.from("artist-media").getPublicUrl(path);
      const { data: newItem } = await supabase.from("media").insert([{
        artist_id: artistId,
        type: "photo",
        url: urlData.publicUrl,
        thumbnail: urlData.publicUrl,
        position: media.length + 1,
      }]).select().single();
      if (newItem) setMedia((prev) => [...prev, newItem as MediaItem]);
    }
    setUploading(false);
  };

  const handleAddVideo = async () => {
    if (!videoUrl || !artistId) return;
    if (videos.length >= limits.videos) { alert(`Tu plan ${plan} solo permite ${limits.videos} vídeo(s).`); return; }

    const { data: newItem } = await supabase.from("media").insert([{
      artist_id: artistId,
      type: "video",
      url: videoUrl,
      thumbnail: null,
      position: media.length + 1,
    }]).select().single();

    if (newItem) {
      setMedia((prev) => [...prev, newItem as MediaItem]);
      setVideoUrl("");
      setShowAddVideo(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este archivo?")) return;
    await supabase.from("media").delete().eq("id", id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const planLabel = plan === "pro" ? "Pro" : plan === "standard" ? "Standard" : "Beta";

  return (
    <DashboardShell active="media" title="Multimedia">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-xl gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Gestión Multimedia</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Gestiona tus fotos y vídeos del perfil público.</p>
        </div>
        <div className="flex gap-sm">
          <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
          <button
            className="neon-border text-secondary px-md py-sm rounded-lg font-bold hover:bg-secondary/10 transition-all flex items-center gap-xs disabled:opacity-50"
            onClick={() => photoInputRef.current?.click()}
            disabled={uploading || photos.length >= limits.photos}
          >
            <span className="material-symbols-outlined">{uploading ? "sync" : "add_photo_alternate"}</span>
            {uploading ? "Subiendo..." : "Subir Foto"}
          </button>
          {limits.videos > 0 && (
            <button
              className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold bloom-primary hover:opacity-90 transition-all flex items-center gap-xs disabled:opacity-50"
              onClick={() => setShowAddVideo(true)}
              disabled={videos.length >= limits.videos}
            >
              <span className="material-symbols-outlined">video_call</span>
              Añadir Vídeo
            </button>
          )}
        </div>
      </div>

      {/* Plan limits */}
      <div className="grid grid-cols-2 gap-md mb-xl">
        <div className="glass-card rounded-xl p-md">
          <div className="flex justify-between font-label-sm text-label-sm mb-sm">
            <span className="text-outline uppercase">Fotos</span>
            <span className="font-bold text-on-surface">{photos.length} / {limits.photos}</span>
          </div>
          <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-secondary transition-all" style={{ width: `${Math.min((photos.length / limits.photos) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="glass-card rounded-xl p-md">
          <div className="flex justify-between font-label-sm text-label-sm mb-sm">
            <span className="text-outline uppercase">Vídeos</span>
            <span className="font-bold text-on-surface">{videos.length} / {limits.videos}</span>
          </div>
          <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
            {limits.videos > 0 ? (
              <div className="h-full bg-primary transition-all" style={{ width: `${Math.min((videos.length / limits.videos) * 100, 100)}%` }}></div>
            ) : (
              <div className="h-full w-full bg-surface-container-high flex items-center justify-center">
                <span className="font-label-sm text-[9px] text-outline">No disponible en plan {planLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square glass-card rounded-xl animate-pulse bg-surface-container"></div>
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="glass-card rounded-xl p-xl text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[64px] block mb-md text-primary/30">photo_library</span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Tu galería está vacía</h3>
          <p className="font-body-md mb-lg">Sube tu primera foto para empezar a construir tu escaparate digital.</p>
          <button
            className="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold bloom-primary hover:opacity-90"
            onClick={() => photoInputRef.current?.click()}
          >
            Subir Primera Foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
          {media.map((item) => (
            <div key={item.id} className="relative aspect-square group rounded-xl overflow-hidden glass-card">
              {item.type === "photo" ? (
                <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={item.url} alt="" />
              ) : (
                <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center gap-sm">
                  <span className="material-symbols-outlined text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant text-center px-sm truncate w-full text-center">Vídeo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-sm">
                {item.type === "video" && (
                  <a href={item.url} target="_blank" rel="noreferrer" className="w-10 h-10 glass-card rounded-full flex items-center justify-center hover:border-primary transition-colors">
                    <span className="material-symbols-outlined text-white text-[18px]">open_in_new</span>
                  </a>
                )}
                <button
                  className="w-10 h-10 bg-error/80 rounded-full flex items-center justify-center hover:bg-error transition-colors"
                  onClick={() => handleDelete(item.id)}
                >
                  <span className="material-symbols-outlined text-white text-[18px]">delete</span>
                </button>
              </div>
              <div className="absolute top-xs left-xs">
                <span className="bg-black/60 backdrop-blur-md px-xs py-[2px] rounded font-label-sm text-[10px] uppercase text-on-surface-variant">
                  {item.type === "photo" ? "Foto" : "Vídeo"}
                </span>
              </div>
            </div>
          ))}

          {/* Add photo slot */}
          {photos.length < limits.photos && (
            <button
              className="aspect-square glass-card rounded-xl flex flex-col items-center justify-center gap-sm border-dashed hover:border-primary hover:text-primary transition-all text-on-surface-variant"
              onClick={() => photoInputRef.current?.click()}
            >
              <span className="material-symbols-outlined text-[32px]">add_photo_alternate</span>
              <span className="font-label-sm text-label-sm">Añadir Foto</span>
            </button>
          )}
          {limits.videos > 0 && videos.length < limits.videos && (
            <button
              className="aspect-square glass-card rounded-xl flex flex-col items-center justify-center gap-sm border-dashed hover:border-primary hover:text-primary transition-all text-on-surface-variant"
              onClick={() => setShowAddVideo(true)}
            >
              <span className="material-symbols-outlined text-[32px]">video_call</span>
              <span className="font-label-sm text-label-sm">Añadir Vídeo</span>
            </button>
          )}
        </div>
      )}

      {/* Plan upgrade notice */}
      {plan === "beta" && (
        <div className="mt-xl glass-card rounded-xl p-md border-l-4 border-secondary/50 flex items-start gap-md">
          <span className="material-symbols-outlined text-secondary text-[28px] shrink-0">upgrade</span>
          <div>
            <p className="font-headline-md text-headline-md text-on-surface mb-xs">Amplía tu galería</p>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">
              Con el plan <strong className="text-on-surface">Standard</strong> (6€/mes) puedes tener hasta 3 fotos + 1 vídeo. Con el plan <strong className="text-on-surface">Pro</strong> (9,99€/mes), 3 fotos + 3 vídeos.
            </p>
          </div>
        </div>
      )}

      {/* Add video modal */}
      {showAddVideo && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-md">
          <div className="glass-card rounded-2xl p-lg w-full max-w-md relative">
            <button className="absolute top-base right-base text-on-surface-variant hover:text-white" onClick={() => setShowAddVideo(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Añadir Vídeo</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">Pega la URL de YouTube, Vimeo u otra plataforma.</p>
            <input
              className="w-full bg-surface-container border border-outline-variant rounded-lg p-sm text-on-surface font-body-md focus:border-primary outline-none mb-md"
              placeholder="https://youtube.com/watch?v=..."
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <button
              className="w-full bg-primary text-on-primary py-sm rounded-lg font-bold bloom-primary hover:opacity-90 disabled:opacity-60"
              onClick={handleAddVideo}
              disabled={!videoUrl}
            >
              Añadir Vídeo
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
