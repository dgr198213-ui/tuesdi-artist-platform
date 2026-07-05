/**
 * TUESDI — Panel de Sistema (/system)
 * Acceso restringido: solo admins definidos en public.admin_users.
 * Si el usuario no es admin, redirige a /404 sin revelar que la ruta existe.
 *
 * Funciones:
 *  - Eventos: listar, crear, editar, aprobar/rechazar, borrar
 *  - Artistas: listar, ver perfil público, borrar
 */

import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useImageUpload } from "@/hooks/useImageUpload";

type Artist = {
  id: string;
  artist_name: string;
  slug: string | null;
  city: string | null;
  category: string | null;
  profile_image: string | null;
  created_at: string;
};

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  city: string | null;
  country: string | null;
  event_date: string | null;
  event_time: string | null;
  organizer_name: string | null;
  organizer_email: string | null;
  status: string;
  image_url: string | null;
  created_at: string;
};

type Tab = "events" | "artists";

const CATEGORIES = ["Música", "Teatro", "Danza", "Magia", "Comedia", "DJ", "Circo", "Arte", "Foto/Vídeo", "Otro"];
const EMPTY_FORM = {
  title: "", description: "", category: "Música", city: "", country: "España",
  event_date: "", event_time: "", organizer_name: "", organizer_email: "", status: "approved",
  image_url: "",
};

export default function SystemPanel() {
  const [, setLocation] = useLocation();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState<Tab>("events");

  const [events, setEvents] = useState<EventRow[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(null);

  // Form de crear/editar evento
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { uploadImage, loading: uploading } = useImageUpload({ bucket: "artist-media" });

  const flash = (text: string, kind: "ok" | "err" = "ok") => {
    setMsg({ text, kind });
    setTimeout(() => setMsg(null), 4000);
  };

  // — Verificar admin —
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLocation("/404"); return; }
      const { data } = await supabase
        .from("admin_users").select("user_id").eq("user_id", session.user.id).maybeSingle();
      if (!data) { setLocation("/404"); return; }
      setUserId(session.user.id);
      setIsAdmin(true);
      setChecking(false);
    })();
  }, []);

  // — Cargar datos —
  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    if (tab === "events") {
      const { data } = await supabase
        .from("events")
        .select("id, title, description, category, city, country, event_date, event_time, organizer_name, organizer_email, status, image_url, created_at")
        .order("created_at", { ascending: false });
      setEvents(data ?? []);
    } else {
      const { data } = await supabase
        .from("artists")
        .select("id, artist_name, slug, city, category, profile_image, created_at")
        .order("created_at", { ascending: false });
      setArtists(data ?? []);
    }
    setLoading(false);
  }, [tab, isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  // — Acciones de eventos —
  const approveEvent = async (id: string) => {
    const { error } = await supabase.from("events").update({ status: "approved" }).eq("id", id);
    if (error) return flash("No se pudo aprobar: " + error.message, "err");
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "approved" } : e));
    flash("Evento aprobado.");
  };

  const rejectEvent = async (id: string) => {
    const { error } = await supabase.from("events").update({ status: "rejected" }).eq("id", id);
    if (error) return flash("No se pudo rechazar: " + error.message, "err");
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "rejected" } : e));
    flash("Evento rechazado.");
  };

  const deleteEvent = async (id: string, title: string) => {
    if (!confirm(`¿Borrar el evento "${title}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from("magic_links").delete().eq("event_id", id);
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) return flash("No se pudo borrar: " + error.message, "err");
    setEvents(prev => prev.filter(e => e.id !== id));
    flash("Evento borrado.");
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (e: EventRow) => {
    setEditingId(e.id);
    setForm({
      title: e.title ?? "", description: e.description ?? "", category: e.category ?? "Música",
      city: e.city ?? "", country: e.country ?? "España", event_date: e.event_date ?? "",
      event_time: e.event_time ?? "", organizer_name: e.organizer_name ?? "",
      organizer_email: e.organizer_email ?? "", status: e.status ?? "approved",
      image_url: e.image_url ?? "",
    });
    setShowForm(true);
  };

  const handleImagePick = async (file: File) => {
    if (!userId) return flash("Sesión no válida.", "err");
    const url = await uploadImage(file, userId, `event-${Date.now()}`);
    if (url) {
      setForm(f => ({ ...f, image_url: url }));
      flash("Imagen subida.");
    } else {
      flash("No se pudo subir la imagen.", "err");
    }
  };

  const saveEvent = async () => {
    if (!form.title.trim() || !form.city.trim() || !form.event_date) {
      return flash("Título, ciudad y fecha son obligatorios.", "err");
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      city: form.city.trim(),
      country: form.country.trim() || "España",
      event_date: form.event_date,
      event_time: form.event_time || null,
      organizer_name: form.organizer_name.trim() || null,
      organizer_email: form.organizer_email.trim() || "admin@tuesdi.com",
      status: form.status,
      image_url: form.image_url || null,
    };

    if (editingId) {
      const { error } = await supabase.from("events").update(payload).eq("id", editingId);
      setSaving(false);
      if (error) return flash("No se pudo guardar: " + error.message, "err");
      flash("Evento actualizado.");
    } else {
      const { error } = await supabase.from("events").insert([{ id: crypto.randomUUID(), ...payload }]);
      setSaving(false);
      if (error) return flash("No se pudo crear: " + error.message, "err");
      flash("Evento creado.");
    }
    setShowForm(false);
    loadData();
  };

  // — Acciones de artistas —
  const deleteArtist = async (id: string, name: string) => {
    if (!confirm(`¿Borrar al artista "${name}"? Se eliminará su perfil y multimedia.`)) return;
    await supabase.from("media").delete().eq("artist_id", id);
    const { error } = await supabase.from("artists").delete().eq("id", id);
    if (error) return flash("No se pudo borrar: " + error.message, "err");
    setArtists(prev => prev.filter(a => a.id !== id));
    flash("Artista borrado.");
  };

  if (checking) return null;
  if (!isAdmin) return null;

  const pendingCount = events.filter(e => e.status === "pending").length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-mono">
      {/* Topbar */}
      <header className="border-b border-white/10 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 bg-[#0a0a0f] z-40">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40 uppercase tracking-widest">TUESDI</span>
          <span className="text-white/20">/</span>
          <span className="text-xs text-white/80">system</span>
        </div>
        <button onClick={() => setLocation("/")} className="text-xs text-white/40 hover:text-white/80 transition-colors">
          ← salir
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/10 pb-4">
          <button
            onClick={() => setTab("events")}
            className={`px-4 py-1.5 text-xs rounded transition-colors ${tab === "events" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            Eventos ({events.length}){pendingCount > 0 && <span className="ml-1 text-yellow-400">· {pendingCount} pend.</span>}
          </button>
          <button
            onClick={() => setTab("artists")}
            className={`px-4 py-1.5 text-xs rounded transition-colors ${tab === "artists" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"}`}
          >
            Artistas ({artists.length})
          </button>
        </div>

        {/* Flash message */}
        {msg && (
          <div className={`mb-4 text-xs px-4 py-2 rounded border ${msg.kind === "ok" ? "text-green-400 border-green-400/20 bg-green-400/5" : "text-red-400 border-red-400/20 bg-red-400/5"}`}>
            {msg.kind === "ok" ? "✓ " : "✕ "}{msg.text}
          </div>
        )}

        {loading && <div className="text-xs text-white/30 py-8 text-center">Cargando...</div>}

        {/* ===== EVENTOS ===== */}
        {!loading && tab === "events" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-white/40">{events.length} eventos en total</span>
              <button
                onClick={openCreate}
                className="text-xs bg-primary text-white px-3 py-1.5 rounded hover:opacity-90 transition-opacity font-bold"
              >
                + Crear evento
              </button>
            </div>

            {events.length === 0 ? (
              <p className="text-xs text-white/30 py-12 text-center">Sin eventos. Crea el primero con el botón de arriba.</p>
            ) : (
              <div className="space-y-2">
                {events.map(e => (
                  <div key={e.id} className="border border-white/10 rounded-lg p-3 hover:border-white/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white/90 text-sm font-bold truncate">{e.title}</span>
                          <StatusBadge status={e.status} />
                        </div>
                        <p className="text-white/40 text-xs mt-0.5">
                          {e.category} · {e.city} · {e.event_date ? new Date(e.event_date).toLocaleDateString("es-ES") : "sin fecha"}
                          {e.event_time ? ` ${e.event_time}` : ""}
                        </p>
                        {e.organizer_email && (
                          <p className="text-white/25 text-[11px] mt-0.5 truncate">{e.organizer_name ? `${e.organizer_name} · ` : ""}{e.organizer_email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2 pt-2 border-t border-white/5 text-xs">
                      {e.status === "pending" && (
                        <>
                          <button onClick={() => approveEvent(e.id)} className="text-green-400/70 hover:text-green-400">aprobar</button>
                          <button onClick={() => rejectEvent(e.id)} className="text-yellow-400/70 hover:text-yellow-400">rechazar</button>
                        </>
                      )}
                      {e.status !== "approved" && e.status !== "pending" && (
                        <button onClick={() => approveEvent(e.id)} className="text-green-400/70 hover:text-green-400">aprobar</button>
                      )}
                      <button onClick={() => openEdit(e)} className="text-white/50 hover:text-white/90">editar</button>
                      <button onClick={() => deleteEvent(e.id, e.title)} className="text-red-400/60 hover:text-red-400 ml-auto">borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== ARTISTAS ===== */}
        {!loading && tab === "artists" && (
          <div>
            {artists.length === 0 ? (
              <p className="text-xs text-white/30 py-12 text-center">Sin artistas registrados todavía.</p>
            ) : (
              <div className="space-y-2">
                {artists.map(a => (
                  <div key={a.id} className="border border-white/10 rounded-lg p-3 flex items-center gap-3 hover:border-white/20 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                      {a.profile_image
                        ? <img src={a.profile_image} alt="" className="w-full h-full object-cover" />
                        : <span className="text-white/30 text-xs">{a.artist_name?.[0]?.toUpperCase() ?? "?"}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white/90 text-sm font-bold truncate">{a.artist_name}</p>
                      <p className="text-white/40 text-xs">{a.category || "—"} · {a.city || "—"}</p>
                    </div>
                    <div className="flex gap-3 text-xs shrink-0">
                      {a.slug && (
                        <button onClick={() => window.open(`/artista/${a.slug}`, "_blank")} className="text-white/50 hover:text-white/90">ver</button>
                      )}
                      <button onClick={() => deleteArtist(a.id, a.artist_name)} className="text-red-400/60 hover:text-red-400">borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== MODAL CREAR/EDITAR EVENTO ===== */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-white/10 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white">{editingId ? "Editar evento" : "Crear evento"}</h2>
              <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white text-lg leading-none">×</button>
            </div>

            <div className="space-y-3">
              <Field label="Título *">
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Nombre del evento" />
              </Field>
              <Field label="Descripción">
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputCls + " min-h-[70px] resize-y"} placeholder="Detalles del evento" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Categoría">
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Estado">
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputCls}>
                    <option value="approved">Aprobado (visible)</option>
                    <option value="pending">Pendiente</option>
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ciudad *">
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inputCls} placeholder="Madrid" />
                </Field>
                <Field label="País">
                  <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fecha *">
                  <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} className={inputCls} />
                </Field>
                <Field label="Hora">
                  <input type="time" value={form.event_time} onChange={e => setForm({ ...form, event_time: e.target.value })} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Organizador">
                  <input value={form.organizer_name} onChange={e => setForm({ ...form, organizer_name: e.target.value })} className={inputCls} placeholder="Nombre" />
                </Field>
                <Field label="Email organizador">
                  <input value={form.organizer_email} onChange={e => setForm({ ...form, organizer_email: e.target.value })} className={inputCls} placeholder="opcional" />
                </Field>
              </div>

              {/* Imagen del evento */}
              <Field label="Imagen del evento">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {form.image_url
                      ? <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-white/20 text-[10px]">sin foto</span>}
                  </div>
                  <div className="flex-1">
                    <label className="inline-block text-xs bg-white/10 hover:bg-white/15 text-white/80 rounded px-3 py-2 cursor-pointer transition-colors">
                      {uploading ? "Subiendo..." : form.image_url ? "Cambiar foto" : "Subir foto"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        disabled={uploading}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleImagePick(f); }}
                      />
                    </label>
                    {form.image_url && (
                      <button onClick={() => setForm(f => ({ ...f, image_url: "" }))} className="ml-2 text-xs text-red-400/60 hover:text-red-400">quitar</button>
                    )}
                    <p className="text-[10px] text-white/30 mt-1">JPG, PNG o WebP · máx 5 MB</p>
                  </div>
                </div>
              </Field>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 text-xs text-white/60 border border-white/10 rounded py-2 hover:bg-white/5">Cancelar</button>
              <button onClick={saveEvent} disabled={saving} className="flex-1 text-xs bg-primary text-white font-bold rounded py-2 hover:opacity-90 disabled:opacity-50">
                {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear evento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full bg-black border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] text-white/40 uppercase tracking-wide block mb-1">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "bg-green-400/10 text-green-400",
    pending: "bg-yellow-400/10 text-yellow-400",
    rejected: "bg-red-400/10 text-red-400",
    expired: "bg-white/10 text-white/40",
  };
  const label: Record<string, string> = {
    approved: "aprobado", pending: "pendiente", rejected: "rechazado", expired: "expirado",
  };
  return <span className={`px-2 py-0.5 rounded text-[10px] shrink-0 ${map[status] ?? "bg-white/10 text-white/40"}`}>{label[status] ?? status}</span>;
}
