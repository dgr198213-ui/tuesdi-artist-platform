/**
 * TUESDI - Tu Escenario Digital v3.0
 * Bandeja de Contactos (/dashboard/contactos)
 * Diseño: Stitch "Digital Stage" (bandeja_de_contactos_tuesdi)
 */

import { supabase } from "@/lib/supabase";
import DashboardShell from "@/components/DashboardShell";
import { useEffect, useState } from "react";

type FilterType = "all" | "new" | "read";

interface ContactMessage {
  id: string;
  subject: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
}

function formatDate(d: string) {
  const date = new Date(d);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return `Hoy, ${date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return `Ayer, ${date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function BandejaContactos() {
  const [artistId, setArtistId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile) { setLoading(false); return; }
      setArtistId(profile.id);

      const { data } = await supabase
        .from("messages")
        .select("id, subject, body, is_read, created_at")
        .eq("recipient_id", profile.id)
        .order("created_at", { ascending: false });

      const list = (data || []) as ContactMessage[];
      setContacts(list);
      if (list.length > 0) setSelected(list[0]);
      setLoading(false);
    };
    load();
  }, []);

  const markAsRead = async (id: string) => {
    await supabase.from("messages").update({ is_read: true }).eq("id", id);
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, is_read: true } : c));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, is_read: true } : prev);
  };

  const handleSelect = async (contact: ContactMessage) => {
    setSelected(contact);
    if (!contact.is_read) await markAsRead(contact.id);
  };

  const filtered = filter === "all" ? contacts : filter === "new" ? contacts.filter((c) => !c.is_read) : contacts.filter((c) => c.is_read);
  const newCount = contacts.filter((c) => !c.is_read).length;

  const FILTERS: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "New" },
    { key: "read", label: "Read" },
  ];

  return (
    <DashboardShell active="contacts" title="Contacts">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs flex items-center gap-sm">
            Bandeja de Contactos
            {newCount > 0 && (
              <span className="bg-secondary text-black font-label-sm text-label-sm font-bold px-sm py-1 rounded-full">{newCount}</span>
            )}
          </h2>
          <div className="flex items-center gap-xs text-on-surface-variant/70">
            <span className="material-symbols-outlined text-sm">info</span>
            <p className="font-label-sm text-label-sm">Estos datos son privados y solo visibles para ti</p>
          </div>
        </div>
        <div className="flex items-center gap-xs bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`px-md py-xs rounded-lg font-label-sm text-label-sm font-bold transition-all ${filter === f.key ? "bg-surface-container-high text-primary" : "text-on-surface-variant hover:bg-surface-variant/50"}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-on-surface-variant">Cargando...</div>
      ) : contacts.length === 0 ? (
        <div className="glass-card rounded-xl p-xl text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[64px] block mb-md">inbox</span>
          <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">Sin solicitudes</h3>
          <p className="font-body-md">Cuando alguien contacte contigo desde tu perfil público, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="flex gap-gutter h-[calc(100vh-260px)] overflow-hidden">
          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-sm pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-xl text-on-surface-variant font-body-md">Sin mensajes en esta categoría.</div>
            ) : filtered.map((c) => (
              <div
                key={c.id}
                className={`glass-card p-md rounded-xl flex items-center gap-md group cursor-pointer transition-all ${selected?.id === c.id ? "bg-surface-container-high border-l-4 border-l-primary" : "hover:bg-surface-container/30"}`}
                onClick={() => handleSelect(c)}
              >
                <div className="h-12 w-12 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 border border-outline-variant/30">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-on-surface truncate">{c.subject || "(sin asunto)"}</h4>
                    {!c.is_read ? (
                      <span className="text-[10px] text-primary uppercase font-bold tracking-widest bg-primary/10 px-xs py-[2px] rounded-full shrink-0">New</span>
                    ) : (
                      <span className="text-[10px] text-on-surface-variant/50 uppercase font-bold tracking-widest shrink-0">Read</span>
                    )}
                  </div>
                  <p className="font-body-md text-sm text-on-surface-variant truncate">{c.body}</p>
                  <p className="text-[11px] text-on-surface-variant/50 mt-[2px]">{formatDate(c.created_at)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Detail Pane */}
          {selected && (
            <div className="w-[340px] shrink-0 glass-card rounded-2xl p-lg flex flex-col overflow-y-auto">
              <div className="flex justify-between items-start mb-lg">
                <div className="h-20 w-20 rounded-2xl bg-surface-container-highest flex items-center justify-center border-2 border-primary/30">
                  <span className="material-symbols-outlined text-3xl">mail</span>
                </div>
                <div className="flex gap-xs">
                  <button
                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface-variant/50 hover:bg-surface-variant transition-colors text-on-surface"
                    title="Marcar como leído"
                    onClick={() => markAsRead(selected.id)}
                  >
                    <span className="material-symbols-outlined">done_all</span>
                  </button>
                </div>
              </div>

              <div className="mb-lg">
                {selected.subject && <h3 className="font-headline-md text-headline-md text-secondary">{selected.subject}</h3>}
                <p className="font-label-sm text-[11px] text-on-surface-variant/60 mt-xs">{formatDate(selected.created_at)}</p>
              </div>

              <div className="flex-1">
                <p className="font-label-sm text-[10px] text-on-surface-variant font-bold uppercase mb-sm">Mensaje</p>
                <div className="font-body-md text-body-md leading-relaxed text-on-surface/90 whitespace-pre-line">
                  {selected.body || "(mensaje vacío)"}
                </div>
              </div>

              <div className="mt-lg pt-lg border-t border-outline-variant/20">
                <p className="font-label-sm text-[11px] text-on-surface-variant/60 text-center">
                  Para responder, hazlo desde tu propio correo una vez identifiques al remitente.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardShell>
  );
}
