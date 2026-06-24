/**
 * TUESDI — Panel de Sistema (/system)
 * Acceso restringido: solo admins definidos en public.admin_users
 * Si el usuario no es admin, redirige a 404 sin revelar que la ruta existe.
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

type Artist = { id: string; artist_name: string; city: string; created_at: string };
type Event  = { id: string; title: string; status: string; organizer_email: string; event_date: string; created_at: string };
type User   = { id: string; email: string; created_at: string };

type Tab = "artists" | "events" | "users";

export default function SystemPanel() {
  const [, setLocation] = useLocation();
  const [checking, setChecking]   = useState(true);
  const [isAdmin,  setIsAdmin]    = useState(false);
  const [tab,      setTab]        = useState<Tab>("artists");
  const [artists,  setArtists]    = useState<Artist[]>([]);
  const [events,   setEvents]     = useState<Event[]>([]);
  const [users,    setUsers]      = useState<User[]>([]);
  const [loading,  setLoading]    = useState(false);
  const [msg,      setMsg]        = useState("");

  // — Verificar si el usuario actual es admin —
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLocation("/404"); return; }

      const { data } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!data) { setLocation("/404"); return; }
      setIsAdmin(true);
      setChecking(false);
    })();
  }, []);

  // — Cargar datos según tab activo —
  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    setMsg("");

    (async () => {
      if (tab === "artists") {
        const { data } = await supabase
          .from("artists")
          .select("id, artist_name, city, created_at")
          .order("created_at", { ascending: false });
        setArtists(data ?? []);
      }

      if (tab === "events") {
        const { data } = await supabase
          .from("events")
          .select("id, title, status, organizer_email, event_date, created_at")
          .order("created_at", { ascending: false });
        setEvents(data ?? []);
      }

      if (tab === "users") {
        // Solo admins pueden leer auth.users vía RPC — usamos la tabla admin visible
        const { data: session } = await supabase.auth.getSession();
        // Listamos lo que podemos: artists + email de eventos como proxy de usuarios
        const { data: evData } = await supabase
          .from("events")
          .select("organizer_email, created_at")
          .order("created_at", { ascending: false });
        const unique = [...new Map((evData ?? []).map(e => [e.organizer_email, {
          id: e.organizer_email, email: e.organizer_email, created_at: e.created_at
        }])).values()];
        setUsers(unique);
      }

      setLoading(false);
    })();
  }, [tab, isAdmin]);

  // — Acciones —
  const deleteArtist = async (id: string, name: string) => {
    if (!confirm(`¿Borrar artista "${name}"? Esto eliminará también su media.`)) return;
    await supabase.from("media").delete().eq("artist_id", id);
    await supabase.from("artists").delete().eq("id", id);
    setArtists(prev => prev.filter(a => a.id !== id));
    setMsg(`Artista "${name}" eliminado.`);
  };

  const deleteEvent = async (id: string, title: string) => {
    if (!confirm(`¿Borrar evento "${title}"?`)) return;
    await supabase.from("magic_links").delete().eq("event_id", id);
    await supabase.from("events").delete().eq("id", id);
    setEvents(prev => prev.filter(e => e.id !== id));
    setMsg(`Evento "${title}" eliminado.`);
  };

  const approveEvent = async (id: string, title: string) => {
    await supabase.from("events").update({ status: "approved" }).eq("id", id);
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "approved" } : e));
    setMsg(`Evento "${title}" aprobado.`);
  };

  const deleteAllEvents = async () => {
    if (!confirm("¿Borrar TODOS los eventos y magic_links?")) return;
    await supabase.from("magic_links").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("events").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setEvents([]);
    setMsg("Todos los eventos eliminados.");
  };

  const deleteAllArtists = async () => {
    if (!confirm("¿Borrar TODOS los artistas y su media?")) return;
    await supabase.from("media").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("inquiries").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("artists").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    setArtists([]);
    setMsg("Todos los artistas eliminados.");
  };

  if (checking) return null;
  if (!isAdmin) return null;

  const TABS: { key: Tab; label: string }[] = [
    { key: "artists", label: `Artistas (${artists.length})` },
    { key: "events",  label: `Eventos (${events.length})` },
    { key: "users",   label: `Emails (${users.length})` },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-mono">
      {/* Topbar */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/40 uppercase tracking-widest">TUESDI</span>
          <span className="text-white/20">/</span>
          <span className="text-xs text-white/80">system</span>
        </div>
        <button
          onClick={() => setLocation("/")}
          className="text-xs text-white/40 hover:text-white/80 transition-colors"
        >
          ← volver al sitio
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-white/10 pb-4">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 text-xs rounded transition-colors ${
                tab === t.key
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Mensaje de feedback */}
        {msg && (
          <div className="mb-4 text-xs text-green-400 border border-green-400/20 bg-green-400/5 px-4 py-2 rounded">
            ✓ {msg}
          </div>
        )}

        {loading && (
          <div className="text-xs text-white/30 py-8 text-center">Cargando...</div>
        )}

        {/* ——— ARTISTS ——— */}
        {!loading && tab === "artists" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-white/40">{artists.length} artistas</span>
              {artists.length > 0 && (
                <button
                  onClick={deleteAllArtists}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors border border-red-400/20 px-3 py-1 rounded"
                >
                  Borrar todos
                </button>
              )}
            </div>
            {artists.length === 0 ? (
              <p className="text-xs text-white/30 py-8 text-center">Sin artistas.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/30 border-b border-white/10">
                    <th className="text-left py-2 pr-4">Nombre</th>
                    <th className="text-left py-2 pr-4">Ciudad</th>
                    <th className="text-left py-2 pr-4">Registrado</th>
                    <th className="text-right py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.map(a => (
                    <tr key={a.id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2.5 pr-4 text-white/80">{a.artist_name}</td>
                      <td className="py-2.5 pr-4 text-white/50">{a.city || "—"}</td>
                      <td className="py-2.5 pr-4 text-white/30">
                        {new Date(a.created_at).toLocaleDateString("es-ES")}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => deleteArtist(a.id, a.artist_name)}
                          className="text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ——— EVENTS ——— */}
        {!loading && tab === "events" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-white/40">{events.length} eventos</span>
              {events.length > 0 && (
                <button
                  onClick={deleteAllEvents}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors border border-red-400/20 px-3 py-1 rounded"
                >
                  Borrar todos
                </button>
              )}
            </div>
            {events.length === 0 ? (
              <p className="text-xs text-white/30 py-8 text-center">Sin eventos.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/30 border-b border-white/10">
                    <th className="text-left py-2 pr-4">Título</th>
                    <th className="text-left py-2 pr-4">Estado</th>
                    <th className="text-left py-2 pr-4 hidden sm:table-cell">Email</th>
                    <th className="text-left py-2 pr-4 hidden sm:table-cell">Fecha</th>
                    <th className="text-right py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(e => (
                    <tr key={e.id} className="border-b border-white/5 hover:bg-white/3">
                      <td className="py-2.5 pr-4 text-white/80">{e.title}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          e.status === "approved"
                            ? "bg-green-400/10 text-green-400"
                            : "bg-yellow-400/10 text-yellow-400"
                        }`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-white/40 hidden sm:table-cell">{e.organizer_email}</td>
                      <td className="py-2.5 pr-4 text-white/30 hidden sm:table-cell">
                        {new Date(e.event_date).toLocaleDateString("es-ES")}
                      </td>
                      <td className="py-2.5 text-right flex gap-3 justify-end">
                        {e.status === "pending" && (
                          <button
                            onClick={() => approveEvent(e.id, e.title)}
                            className="text-green-400/60 hover:text-green-400 transition-colors"
                          >
                            aprobar
                          </button>
                        )}
                        <button
                          onClick={() => deleteEvent(e.id, e.title)}
                          className="text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ——— USERS / EMAILS ——— */}
        {!loading && tab === "users" && (
          <div>
            <p className="text-xs text-white/30 mb-4">
              Emails que han interactuado con la plataforma (organizadores de eventos).
              Para borrar un usuario de Auth ve a Supabase Dashboard → Authentication → Users.
            </p>
            {users.length === 0 ? (
              <p className="text-xs text-white/30 py-8 text-center">Sin registros.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/30 border-b border-white/10">
                    <th className="text-left py-2 pr-4">Email</th>
                    <th className="text-left py-2">Último evento</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-white/5">
                      <td className="py-2.5 pr-4 text-white/70">{u.email}</td>
                      <td className="py-2.5 text-white/30">
                        {new Date(u.created_at).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
