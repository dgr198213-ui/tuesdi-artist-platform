/**
 * TUESDI - Tu Escenario Digital v3.0
 * Publicar Evento (/publicar-evento)
 * Diseño: Stitch "Digital Stage" (publicar_evento_tuesdi)
 *
 * Flujo: Formulario anónimo → INSERT events (status: pending) →
 *        invoke create-magic-link → redirige a /exito-publicacion?id=xxx
 */

import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";
import { supabase } from "@/lib/supabase";
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { EVENT_CATEGORIES, DEFAULT_COUNTRY } from "@/lib/constants";

interface EventForm {
  title: string;
  description: string;
  category: string;
  city: string;
  country: string;
  event_date: string;
  event_time: string;
  organizer_name: string;
  organizer_email: string;
}

const EMPTY: EventForm = {
  title: "",
  description: "",
  category: EVENT_CATEGORIES[0],
  city: "",
  country: DEFAULT_COUNTRY,
  event_date: "",
  event_time: "",
  organizer_name: "",
  organizer_email: "",
};

export default function PublicarEvento() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState<EventForm>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof EventForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title || !form.category || !form.city || !form.event_date || !form.organizer_email) {
      setError("Completa todos los campos obligatorios: título, categoría, ciudad, fecha y email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.organizer_email)) {
      setError("El email del organizador no tiene un formato válido.");
      return;
    }

    setSubmitting(true);

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

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { data: eventData, error: insertError } = await supabase
      .from("events")
      .insert([{
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        city: form.city.trim(),
        country: form.country.trim() || DEFAULT_COUNTRY,
        event_date: form.event_date,
        event_time: form.event_time || null,
        image_url,
        organizer_name: form.organizer_name.trim() || null,
        organizer_email: form.organizer_email.trim(),
        status: "pending",
        expires_at: expiresAt.toISOString(),
      }])
      .select()
      .single();

    if (insertError || !eventData) {
      setError("No se pudo crear el evento: " + (insertError?.message || "error desconocido"));
      setSubmitting(false);
      return;
    }

    try {
      await supabase.functions.invoke("create-magic-link", {
        body: { eventId: eventData.id, email: form.organizer_email },
      });
    } catch {
      // Si el envío del email falla, el evento está creado; el usuario puede
      // contactar soporte. No bloqueamos la UX.
    }

    setLocation(`/exito-publicacion?id=${eventData.id}`);
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

        <form className="space-y-md" onSubmit={handleSubmit}>
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
                <p className="text-on-surface-variant font-label-sm text-label-sm">Formato sugerido: 16:9. Máximo 10MB.</p>
              </div>
            </div>
            <input ref={fileInputRef} className="absolute inset-0 opacity-0 cursor-pointer" type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* Form Fields */}
          <div className="glass-card rounded-xl p-md space-y-md">
            <h3 className="font-headline-md text-headline-md text-primary">Información del Evento</h3>

            {/* Title */}
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-secondary uppercase tracking-widest ml-1">Título del Evento *</label>
              <input
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20"
                placeholder="Ej: Neón Ritual Night"
                type="text"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            {/* Category + City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Categoría *</label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none appearance-none"
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    required
                  >
                    {EVENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Ciudad *</label>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all placeholder:text-white/20"
                  placeholder="Ej: Madrid, Barcelona..."
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Fecha *</label>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all [color-scheme:dark]"
                  type="date"
                  value={form.event_date}
                  onChange={(e) => update("event_date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Hora (opcional)</label>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all [color-scheme:dark]"
                  type="time"
                  value={form.event_time}
                  onChange={(e) => update("event_time", e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Descripción (opcional)</label>
              <textarea
                className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all placeholder:text-white/20 min-h-[100px] resize-none"
                placeholder="Describe el evento, artistas, ambiente esperado..."
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
          </div>

          {/* Organizer */}
          <div className="glass-card rounded-xl p-md space-y-md">
            <h3 className="font-headline-md text-headline-md text-primary">Datos del Organizador</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Tus datos de contacto nunca se mostrarán públicamente. El Magic Link de confirmación se enviará al email indicado.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest ml-1">Nombre (opcional)</label>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-primary outline-none transition-all placeholder:text-white/20"
                  placeholder="Ej: Sala MuBe Madrid"
                  type="text"
                  value={form.organizer_name}
                  onChange={(e) => update("organizer_name", e.target.value)}
                />
              </div>
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-secondary uppercase tracking-widest ml-1">Email del Organizador *</label>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-lg px-md py-sm text-on-surface font-body-md focus:border-secondary outline-none transition-all placeholder:text-white/20"
                  placeholder="tu@email.com"
                  type="email"
                  value={form.organizer_email}
                  onChange={(e) => update("organizer_email", e.target.value)}
                  required
                />
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
                  Tras enviar el formulario, recibirás un <strong className="text-on-surface">Magic Link</strong> en tu email. Al hacer clic en él, el evento quedará publicado automáticamente en el directorio. Caduca a los 30 días.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="glass-card rounded-xl p-md border-l-4 border-error">
              <p className="font-body-md text-body-md text-error">{error}</p>
            </div>
          )}

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
