/**
 * TUESDI - Tu Escenario Digital v3.0
 * Editor de Perfil (/dashboard/perfil)
 *
 * Diseño: Stitch "Digital Stage" (editor_de_perfil_tuesdi)
 *
 * - Si el usuario autenticado no tiene fila en `artists` todavía
 *   (alta), este formulario la crea al guardar (onboarding).
 * - Si ya existe, la actualiza.
 * - Las imágenes (avatar / portada) se suben al bucket público
 *   "artist-media" (ver supabase/migrations/002_editor_perfil.sql).
 */

import { supabase } from "@/lib/supabase";
import DashboardShell from "@/components/DashboardShell";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const CATEGORIES = [
  "Cantante",
  "Músico",
  "DJ",
  "Banda",
  "Mago",
  "Humorista",
  "Actor",
  "Bailarín",
  "Performer",
];

const BIO_MAX = 2000;

interface ArtistForm {
  artist_name: string;
  category: string;
  city: string;
  country: string;
  bio: string;
  starting_price: string;
  instagram: string;
  youtube: string;
  spotify: string;
  website: string;
  profile_image: string;
  cover_image: string;
}

const EMPTY_FORM: ArtistForm = {
  artist_name: "",
  category: CATEGORIES[0],
  city: "",
  country: "España",
  bio: "",
  starting_price: "",
  instagram: "",
  youtube: "",
  spotify: "",
  website: "",
  profile_image: "",
  cover_image: "",
};

function slugify(text: string): string {
  return (
    text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "artista"
  );
}

export default function EditorPerfil() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [form, setForm] = useState<ArtistForm>(EMPTY_FORM);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }
      setUserId(session.user.id);

      const { data } = await supabase
        .from("artists")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        setArtistId(data.id);
        setSlug(data.slug);
        setForm({
          artist_name: data.artist_name || "",
          category: data.category || CATEGORIES[0],
          city: data.city || "",
          country: data.country || "España",
          bio: data.bio || "",
          starting_price: data.starting_price || "",
          instagram: data.instagram || "",
          youtube: data.youtube || "",
          spotify: data.spotify || "",
          website: data.website || "",
          profile_image: data.profile_image || "",
          cover_image: data.cover_image || "",
        });
      }

      setLoading(false);
    };

    load();
  }, []);

  const updateField = (field: keyof ArtistForm, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleImageUpload = async (file: File, type: "avatar" | "cover") => {
    if (!userId) return;
    const setUploading = type === "avatar" ? setUploadingAvatar : setUploadingCover;
    setUploading(true);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${type}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("artist-media").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

    if (error) {
      alert("No se pudo subir la imagen: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("artist-media").getPublicUrl(path);
    updateField(type === "avatar" ? "profile_image" : "cover_image", data.publicUrl);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!userId) return;

    if (!form.artist_name.trim() || !form.category || !form.city.trim()) {
      setSaveMsg("Completa Nombre Artístico, Categoría y Ciudad antes de guardar.");
      return;
    }

    setSaving(true);
    setSaveMsg("");

    let finalSlug = slug;
    if (!finalSlug) {
      const base = slugify(form.artist_name);
      finalSlug = base;
      let n = 2;
      // Garantiza un slug único
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data: existing } = await supabase
          .from("artists")
          .select("id")
          .eq("slug", finalSlug)
          .maybeSingle();
        if (!existing) break;
        finalSlug = `${base}-${n}`;
        n += 1;
      }
    }

    const payload = {
      user_id: userId,
      slug: finalSlug,
      artist_name: form.artist_name.trim(),
      category: form.category,
      city: form.city.trim(),
      country: form.country.trim() || "España",
      bio: form.bio,
      starting_price: form.starting_price,
      instagram: form.instagram,
      youtube: form.youtube,
      spotify: form.spotify,
      website: form.website,
      profile_image: form.profile_image,
      cover_image: form.cover_image,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (artistId) {
      ({ error } = await supabase.from("artists").update(payload).eq("id", artistId));
    } else {
      const { data, error: insertError } = await supabase
        .from("artists")
        .insert([payload])
        .select()
        .single();
      error = insertError;
      if (data) {
        setArtistId(data.id);
      }
    }

    setSaving(false);

    if (error) {
      setSaveMsg("Error al guardar: " + error.message);
    } else {
      setSlug(finalSlug);
      setSaveMsg("¡Cambios guardados!");
      setTimeout(() => setSaveMsg(""), 4000);
    }
  };

  if (loading) {
    return (
      <DashboardShell active="profile" title="Editar Perfil">
        <p className="text-on-surface-variant">Cargando perfil...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell active="profile" title="Editar Perfil">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-white">Configura tu escenario digital</h2>
          <p className="text-on-surface-variant font-body-md mt-xs">
            Personaliza cómo te ven los promotores y fans en TUESDI.
          </p>
        </div>
        <div className="flex gap-md items-center">
          {saveMsg && (
            <span className="font-label-sm text-label-sm text-secondary-container">{saveMsg}</span>
          )}
          <button
            className="neon-border text-secondary-container px-md py-sm rounded-lg font-bold hover:bg-secondary-container/10 transition-colors flex items-center gap-xs disabled:opacity-40"
            disabled={!slug}
            onClick={() => slug && setLocation(`/artista/${slug}`)}
          >
            <span className="material-symbols-outlined text-base">visibility</span>
            Ver Perfil Público
          </button>
          <button
            className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold bloom-primary hover:opacity-90 transition-colors flex items-center gap-xs disabled:opacity-60"
            onClick={handleSave}
            disabled={saving}
          >
            <span className="material-symbols-outlined text-base">save</span>
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-gutter">
          {/* Información Básica */}
          <div className="glass-card rounded-xl p-md">
            <h3 className="font-headline-md text-headline-md mb-md text-primary">Información Básica</h3>
            <div className="flex flex-col items-center mb-md">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-variant group-hover:border-primary transition-colors bg-surface-container flex items-center justify-center">
                  {form.profile_image ? (
                    <img alt="Foto de perfil" className="w-full h-full object-cover" src={form.profile_image} />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-[48px]">person</span>
                  )}
                </div>
                <button
                  className="absolute bottom-0 right-0 bg-primary p-base rounded-full text-on-primary shadow-lg transform translate-x-1/4 translate-y-1/4 disabled:opacity-60"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">
                    {uploadingAvatar ? "sync" : "photo_camera"}
                  </span>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "avatar")}
                />
              </div>
            </div>
            <div className="space-y-md">
              <div>
                <label className="font-label-sm text-on-surface-variant block mb-base">Nombre Artístico</label>
                <input
                  className="w-full bg-black border border-surface-variant focus:border-secondary-container focus:ring-1 focus:ring-secondary-container rounded-lg p-sm text-on-surface transition-all"
                  type="text"
                  value={form.artist_name}
                  onChange={(e) => updateField("artist_name", e.target.value)}
                  placeholder="Ej: Neon Dreamer"
                />
              </div>
              <div>
                <label className="font-label-sm text-on-surface-variant block mb-base">Categoría</label>
                <select
                  className="w-full bg-black border border-surface-variant focus:border-secondary-container focus:ring-1 focus:ring-secondary-container rounded-lg p-sm text-on-surface transition-all"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-base">
                <div>
                  <label className="font-label-sm text-on-surface-variant block mb-base">Ciudad</label>
                  <input
                    className="w-full bg-black border border-surface-variant focus:border-secondary-container focus:ring-1 focus:ring-secondary-container rounded-lg p-sm text-on-surface"
                    placeholder="Ej: Madrid"
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-label-sm text-on-surface-variant block mb-base">País</label>
                  <input
                    className="w-full bg-black border border-surface-variant focus:border-secondary-container focus:ring-1 focus:ring-secondary-container rounded-lg p-sm text-on-surface"
                    placeholder="Ej: España"
                    type="text"
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="glass-card rounded-xl p-md">
            <h3 className="font-headline-md text-headline-md mb-md text-primary">Redes Sociales</h3>
            <div className="space-y-md">
              <div className="flex items-center gap-sm bg-black/40 border border-surface-variant rounded-lg p-xs pr-sm">
                <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">link</span>
                </div>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm flex-grow text-on-surface"
                  placeholder="Instagram URL"
                  type="text"
                  value={form.instagram}
                  onChange={(e) => updateField("instagram", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-sm bg-black/40 border border-surface-variant rounded-lg p-xs pr-sm">
                <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">play_circle</span>
                </div>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm flex-grow text-on-surface"
                  placeholder="YouTube URL"
                  type="text"
                  value={form.youtube}
                  onChange={(e) => updateField("youtube", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-sm bg-black/40 border border-surface-variant rounded-lg p-xs pr-sm">
                <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">music_note</span>
                </div>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm flex-grow text-on-surface"
                  placeholder="Spotify Profile"
                  type="text"
                  value={form.spotify}
                  onChange={(e) => updateField("spotify", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-sm bg-black/40 border border-surface-variant rounded-lg p-xs pr-sm">
                <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">language</span>
                </div>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm flex-grow text-on-surface"
                  placeholder="Sitio Web Personal"
                  type="text"
                  value={form.website}
                  onChange={(e) => updateField("website", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          {/* Biografía */}
          <div className="glass-card rounded-xl p-md flex flex-col flex-grow">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-md text-headline-md text-primary">Biografía &amp; Trayectoria</h3>
              <span className={`font-label-sm ${form.bio.length > 1800 ? "text-error" : "text-outline"}`}>
                {form.bio.length} / {BIO_MAX}
              </span>
            </div>
            <div className="flex-grow flex flex-col bg-black border border-surface-variant rounded-lg overflow-hidden focus-within:border-secondary-container transition-all">
              <textarea
                className="w-full h-[320px] bg-transparent border-none focus:ring-0 p-md text-body-md resize-none leading-relaxed"
                placeholder="Escribe aquí tu trayectoria profesional, logros y lo que hace única tu propuesta artística..."
                value={form.bio}
                maxLength={BIO_MAX}
                onChange={(e) => updateField("bio", e.target.value)}
              />
            </div>
          </div>

          {/* Caché */}
          <div className="glass-card rounded-xl p-md">
            <h3 className="font-headline-md text-headline-md mb-md text-primary">Contratación (Caché)</h3>
            <div className="flex flex-col md:flex-row gap-md items-start">
              <div className="w-full md:w-1/3">
                <label className="font-label-sm text-on-surface-variant block mb-base">Caché orientativo</label>
                <div className="relative">
                  <span className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">€</span>
                  <input
                    className="w-full bg-black border border-surface-variant focus:border-secondary-container focus:ring-1 focus:ring-secondary-container rounded-lg p-sm pl-8 text-on-surface text-lg font-bold"
                    placeholder="Ej: 300 - 500"
                    type="text"
                    value={form.starting_price}
                    onChange={(e) => updateField("starting_price", e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-2/3 bg-surface-container-low/50 p-md rounded-lg border-l-4 border-secondary-container">
                <div className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-secondary-container">info</span>
                  <div>
                    <p className="font-label-sm text-secondary-container uppercase mb-xs">Nota sobre privacidad</p>
                    <p className="text-sm text-on-surface-variant leading-tight">
                      Este valor es solo orientativo para los organizadores. No se mostrará públicamente de forma
                      explícita, sino que ayudará al algoritmo a emparejarte con eventos adecuados a tu rango.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portada */}
          <div className="relative h-48 rounded-xl overflow-hidden group bg-surface-container">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            {form.cover_image ? (
              <img
                alt="Portada del perfil"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src={form.cover_image}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[48px]">image</span>
              </div>
            )}
            <div className="absolute bottom-md left-md z-20">
              <button
                className="bg-black/60 backdrop-blur-md border border-white/20 text-white px-md py-sm rounded-full text-sm font-bold flex items-center gap-xs hover:bg-black/80 transition-all disabled:opacity-60"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                type="button"
              >
                <span className="material-symbols-outlined text-sm">
                  {uploadingCover ? "sync" : "edit"}
                </span>
                {uploadingCover ? "Subiendo..." : "Cambiar Imagen de Portada"}
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], "cover")}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
