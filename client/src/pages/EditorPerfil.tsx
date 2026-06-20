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
import { toast } from "sonner";
import { useLocation } from "wouter";
import { ARTIST_CATEGORIES, BIO_MAX, DEFAULT_COUNTRY, slugify, CATEGORY_DB_VALUE } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { artistProfileSchema, type ArtistProfileForm } from "@/lib/schemas/artistProfile";

export default function EditorPerfil() {
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const {
    register,
    setValue,
    getValues,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<ArtistProfileForm>({
    // zodResolver input type has optional fields from schema .default()/.optional(),
    // but our form type (z.infer = output) requires them — cast to bridge the gap
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(artistProfileSchema) as any,
    defaultValues: {
      artist_name: "",
      category: ARTIST_CATEGORIES[0],
      city: "",
      country: DEFAULT_COUNTRY,
      bio: "",
      starting_price: "",
      instagram: "",
      youtube: "",
      spotify: "",
      website: "",
      profile_image: "",
      cover_image: "",
    },
  });

  const watchedBio = watch("bio");
  const watchedProfileImage = watch("profile_image");
  const watchedCoverImage = watch("cover_image");

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
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (data) {
        setArtistId(data.id);
        setSlug(data.slug);
        // category llega como valor de enum (ej. "musica"); buscamos la
        // etiqueta de UI correspondiente para mostrarla en el <select>
        const categoryLabel =
          Object.keys(CATEGORY_DB_VALUE).find(
            (label) => CATEGORY_DB_VALUE[label] === data.category && ARTIST_CATEGORIES.includes(label as typeof ARTIST_CATEGORIES[number])
          ) ?? ARTIST_CATEGORIES[0];
        reset({
          artist_name: data.display_name || "",
          category: categoryLabel,
          city: data.city || "",
          country: data.country || DEFAULT_COUNTRY,
          bio: data.bio || "",
          starting_price: data.price_note || "",
          instagram: data.instagram || "",
          youtube: data.youtube || "",
          spotify: data.spotify || "",
          website: data.website || "",
          profile_image: data.avatar_url || "",
          cover_image: data.cover_url || "",
        });
      }

      setLoading(false);
    };

    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      toast.error("No se pudo subir la imagen: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("artist-media").getPublicUrl(path);
    setValue(type === "avatar" ? "profile_image" : "cover_image", data.publicUrl, { shouldValidate: true });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!userId) return;

    const isValid = await trigger();
    if (!isValid) {
      toast.error("Revisa los campos marcados en rojo antes de guardar.");
      return;
    }

    setSaving(true);

    const values = getValues();

    let finalSlug = slug;
    if (!finalSlug) {
      const base = slugify(values.artist_name);
      finalSlug = base;
      let n = 2;
      // Garantiza un slug único
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("slug", finalSlug)
          .neq("id", userId)
          .maybeSingle();
        if (!existing) break;
        finalSlug = `${base}-${n}`;
        n += 1;
      }
    }

    const payload = {
      id: userId,
      slug: finalSlug,
      display_name: values.artist_name.trim(),
      category: CATEGORY_DB_VALUE[values.category] ?? "arte",
      city: values.city.trim(),
      country: values.country.trim() || DEFAULT_COUNTRY,
      bio: values.bio,
      price_note: values.starting_price,
      instagram: values.instagram,
      youtube: values.youtube,
      spotify: values.spotify,
      website: values.website,
      avatar_url: values.profile_image,
      cover_url: values.cover_image,
      // El perfil se publica en cuanto el artista guarda con los campos
      // obligatorios completos (no hay panel de roles ni revisión manual).
      is_published: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

    setArtistId(userId);
    setSaving(false);

    if (error) {
      toast.error("Error al guardar: " + error.message);
    } else {
      setSlug(finalSlug);
      toast.success("¡Cambios guardados y perfil publicado!");
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
                  {watchedProfileImage ? (
                    <img alt="Foto de perfil" className="w-full h-full object-cover" src={watchedProfileImage} />
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
                  placeholder="Ej: Neon Dreamer"
                  {...register("artist_name")}
                />
                {errors.artist_name && (
                  <p className="text-red-400 text-xs mt-1">{errors.artist_name.message}</p>
                )}
              </div>
              <div>
                <label className="font-label-sm text-on-surface-variant block mb-base">Categoría</label>
                <select
                  className="w-full bg-black border border-surface-variant focus:border-secondary-container focus:ring-1 focus:ring-secondary-container rounded-lg p-sm text-on-surface transition-all"
                  {...register("category")}
                >
                  {ARTIST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-base">
                <div>
                  <label className="font-label-sm text-on-surface-variant block mb-base">Ciudad</label>
                  <input
                    className="w-full bg-black border border-surface-variant focus:border-secondary-container focus:ring-1 focus:ring-secondary-container rounded-lg p-sm text-on-surface"
                    placeholder="Ej: Madrid"
                    type="text"
                    {...register("city")}
                  />
                  {errors.city && (
                    <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="font-label-sm text-on-surface-variant block mb-base">País</label>
                  <input
                    className="w-full bg-black border border-surface-variant focus:border-secondary-container focus:ring-1 focus:ring-secondary-container rounded-lg p-sm text-on-surface"
                    placeholder="Ej: España"
                    type="text"
                    {...register("country")}
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
                  {...register("instagram")}
                />
              </div>
              {errors.instagram && (
                <p className="text-red-400 text-xs -mt-sm">{errors.instagram.message}</p>
              )}
              <div className="flex items-center gap-sm bg-black/40 border border-surface-variant rounded-lg p-xs pr-sm">
                <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">play_circle</span>
                </div>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm flex-grow text-on-surface"
                  placeholder="YouTube URL"
                  type="text"
                  {...register("youtube")}
                />
              </div>
              {errors.youtube && (
                <p className="text-red-400 text-xs -mt-sm">{errors.youtube.message}</p>
              )}
              <div className="flex items-center gap-sm bg-black/40 border border-surface-variant rounded-lg p-xs pr-sm">
                <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">music_note</span>
                </div>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm flex-grow text-on-surface"
                  placeholder="Spotify Profile"
                  type="text"
                  {...register("spotify")}
                />
              </div>
              {errors.spotify && (
                <p className="text-red-400 text-xs -mt-sm">{errors.spotify.message}</p>
              )}
              <div className="flex items-center gap-sm bg-black/40 border border-surface-variant rounded-lg p-xs pr-sm">
                <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined">language</span>
                </div>
                <input
                  className="bg-transparent border-none focus:ring-0 text-sm flex-grow text-on-surface"
                  placeholder="Sitio Web Personal"
                  type="text"
                  {...register("website")}
                />
              </div>
              {errors.website && (
                <p className="text-red-400 text-xs -mt-sm">{errors.website.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          {/* Biografía */}
          <div className="glass-card rounded-xl p-md flex flex-col flex-grow">
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-md text-headline-md text-primary">Biografía &amp; Trayectoria</h3>
              <span className={`font-label-sm ${watchedBio.length > 1800 ? "text-error" : "text-outline"}`}>
                {watchedBio.length} / {BIO_MAX}
              </span>
            </div>
            <div className="flex-grow flex flex-col bg-black border border-surface-variant rounded-lg overflow-hidden focus-within:border-secondary-container transition-all">
              <textarea
                className="w-full h-[320px] bg-transparent border-none focus:ring-0 p-md text-body-md resize-none leading-relaxed"
                placeholder="Escribe aquí tu trayectoria profesional, logros y lo que hace única tu propuesta artística..."
                maxLength={BIO_MAX}
                {...register("bio")}
              />
            </div>
            {errors.bio && (
              <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>
            )}
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
                    {...register("starting_price")}
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
            {watchedCoverImage ? (
              <img
                alt="Portada del perfil"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                src={watchedCoverImage}
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