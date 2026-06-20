/**
 * TUESDI - Tu Escenario Digital v3.0
 * Publicar Evento (/publicar-evento)
 * Diseño: Stitch "Digital Stage" (publicar_evento_tuesdi)
 *
 * Flujo (Opción C — sin cuenta, con validación por email):
 * Formulario anónimo → invoke submit-event (crea evento is_published:false,
 * rate limiting + honeypot, envía email) → redirige a /exito-publicacion?id=xxx
 */

import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";
import { supabase } from "@/lib/supabase";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { EVENT_CATEGORIES, DEFAULT_COUNTRY, CATEGORY_DB_VALUE } from "@/lib/constants";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema, type EventForm } from "@/lib/schemas/eventForm";
import { toast } from "sonner";

export default function PublicarEvento() {
  const [, setLocation] = useLocation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit: rhfHandleSubmit,
    getValues,
    formState: { errors },
  } = useForm<EventForm>({
    // Zod 4 .default() makes input type include `undefined`; cast to match output type
    resolver: zodResolver(eventFormSchema) as unknown as Resolver<EventForm>,
    defaultValues: {
      title: "",
      description: "",
      category: EVENT_CATEGORIES[0],
      location: "",
      city: "",
      country: DEFAULT_COUNTRY,
      event_date: "",
      event_time: "",
      organizer_name: "",
      organizer_email: "",
      website: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato no permitido", { description: "Solo se aceptan JPG, PNG y WebP." });
      e.target.value = "";
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("Imagen demasiado grande", { description: "El tamaño máximo es 5 MB." });
      e.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async () => {
    setSubmitting(true);

    const form = getValues();

    let image_url: string | null = null;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop() || "jpg";
      const path = `events/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("artist-media")
        .upload(path, imageFile, { upsert: true, contentType: imageFile.type });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("artist-media").getPublicUrl(path);
        image_url = urlData.publicUrl;
      }
    }

    // Combinar fecha + hora en un timestamp ISO (columna `date` es timestamptz)
    const dateTime = new Date(`${form.event_date}T${form.event_time || "00:00"}:00`);

    const { data, error } = await supabase.functions.invoke("submit-event", {
      body: {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: CATEGORY_DB_VALUE[form.category] ?? "arte",
        location: form.location.trim(),
        city: form.city.trim(),
        date: dateTime.toISOString(),
        image_url,
        organizer_name: form.organizer_name.trim() || null,
        organizer_email: form.organizer_email.trim(),
        website: form.website, // honeypot, debe llegar vacío
      },
    });

    if (error || !data?.success) {
      toast.error("No se pudo crear el evento: " + (data?.error || error?.message || "error desconocido"));
      setSubmitting(false);
      return;
    }

    setLocation(`/exito-publicacion?id=${data.eventId}`);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* Nav */}
      <PageNav active="eventos" />

      {/* Ambient */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none"></div>

      <main className="relative z-10 max-w-3xl mx-auto px-margin pt-[120px] pb-xl">
        {/* Page header */}
        <header className="text-center mb-xl">
          <div className="inline-flex items-center gap-xs bg-secondary/10 border border-secondary/20 px-md py-xs rounded-full mb-md">
            <span className="material-symbols-outlined text-secondary text-[16px]">add_circle</span>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Publicación Gratuita</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-sm">Publica tu Evento</h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg max-w-2xl mx-auto">
            Comparte tu visión con el mundo. Tu evento aparecerá en el directorio una vez validado por email.
          </p>
        </header>

        <form className="space-y-md" onSubmit={rhfHandleSubmit(onSubmit)}>
          {/* Honeypot — campo oculto, invisible para humanos, los bots lo rellenan */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            className="absolute -left-[9999px] w-px h-px opacity-0"
            aria-hidden="true"
            {...register("website")}
          />

          {/* Cover Upload */}
          <div
            className="glass-card rounded-xl p-base md:p-md text-center group cursor-pointer relative overflow-hidden transition-all duration-500 hover:border-secondary/50 min-h-[220px] flex flex-col items-center justify-center border-dashed border-2 border-white/20"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-70" />
            ) : null}
            <div className={`relative z-10 space-y-sm ${imagePreview ? "bg-black/50 p-md rounded-xl" : ""}`}>
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant group-hover:text-secondary transition-colors duration-300">
                {imagePreview ? "edit" : "add_a_photo"}
              </span>
              <div className="space-y-xs">
                <p className="font-headline-md text-headline-md text-on-surface">
                  {imagePreview ? "Cambiar imagen de portada" : "Añadir imagen de portada"}
                </p>
                <p className="text-on-surface-variant font-label-sm text-label-sm">Formato sugerido: 16:9. Máximo 5 MB (JPG, PNG, WebP).</p>
              </div>
            </div>
            <input ref={fileInputRef} className="absolute inset-0 opacity-0 cursor-pointer" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
          </div>

          {/* Form Fields */}
          <div className="glass-card rounded-xl p-md space-y-md">
            <div className="flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary">Información del Evento</h3>
              <div className="flex items-center gap-1 text-on-surface-variant/60 bg-white/5 px-2 py-1 rounded text-[10px] uppercase tracking-tighter">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                No editable tras publicar
              </div>
            </div>

            {/* Title */}
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-widest ml-1">Título del Evento *</label>
              <input
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20"
                placeholder="Ej: Neón Ritual Night"
                type="text"
                {...register("title")}
              />
              {errors.title && <p className="text-red-400 text-xs ml-1">{errors.title.message}</p>}
            </div>

            {/* Category + City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Categoría *</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none appearance-none"
                    {...register("category")}
                  >
                    {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
                {errors.category && <p className="text-red-400 text-xs ml-1">{errors.category.message}</p>}
              </div>
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Ciudad *</label>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all placeholder:text-white/20"
                  placeholder="Ej: Madrid, Barcelona..."
                  type="text"
                  {...register("city")}
                />
                {errors.city && <p className="text-red-400 text-xs ml-1">{errors.city.message}</p>}
              </div>
            </div>

            {/* Location (venue) */}
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Lugar / Recinto *</label>
              <input
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all placeholder:text-white/20"
                placeholder="Ej: Sala Apolo, Plaza Mayor..."
                type="text"
                {...register("location")}
              />
              {errors.location && <p className="text-red-400 text-xs ml-1">{errors.location.message}</p>}
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Fecha *</label>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all [color-scheme:dark]"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  {...register("event_date")}
                />
                {errors.event_date && <p className="text-red-400 text-xs ml-1">{errors.event_date.message}</p>}
              </div>
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Hora (opcional)</label>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all [color-scheme:dark]"
                  type="time"
                  {...register("event_time")}
                />
                {errors.event_time && <p className="text-red-400 text-xs ml-1">{errors.event_time.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Descripción (opcional)</label>
              <textarea
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all placeholder:text-white/20 min-h-[100px] resize-none"
                placeholder="Describe el evento, artistas, ambiente esperado..."
                {...register("description")}
              />
              {errors.description && <p className="text-red-400 text-xs ml-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Organizer */}
          <div className="glass-card rounded-xl p-md space-y-md">
            <h3 className="font-headline-md text-headline-md text-primary">Datos del Organizador</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Tus datos de contacto nunca se mostrarán públicamente. El enlace de confirmación se enviará al email indicado.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Nombre (opcional)</label>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all placeholder:text-white/20"
                  placeholder="Ej: Sala MuBe Madrid"
                  type="text"
                  {...register("organizer_name")}
                />
                {errors.organizer_name && <p className="text-red-400 text-xs ml-1">{errors.organizer_name.message}</p>}
              </div>
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-widest ml-1">Email del Organizador *</label>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-secondary outline-none transition-all placeholder:text-white/20"
                  placeholder="tu@email.com"
                  type="email"
                  {...register("organizer_email")}
                />
                {errors.organizer_email && <p className="text-red-400 text-xs ml-1">{errors.organizer_email.message}</p>}
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="glass-card rounded-xl p-md border-l-4 border-secondary/50">
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-secondary">info</span>
              <div className="space-y-xs">
                <p className="font-label-sm text-label-sm text-secondary uppercase">¿Cómo funciona?</p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Tras enviar el formulario, recibirás un enlace de confirmación en tu email. Al hacer clic en él, el evento quedará publicado automáticamente en el directorio. El enlace caduca en 24 horas.
                </p>
              </div>
            </div>
          </div>

          <button
            className="w-full bg-primary text-on-primary py-md rounded-xl font-headline-md text-headline-md bloom-primary hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-sm"
            type="submit"
            disabled={submitting}
          >
            {submitting ? (
              <><span className="material-symbols-outlined animate-spin">sync</span> Publicando...</>
            ) : (
              <><span className="material-symbols-outlined">send</span> Publicar Evento</>
            )}
          </button>
        </form>
      </main>

      {/* Footer */}
      <PageFooter />
    </div>
  );
}
