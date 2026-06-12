import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music2, Calendar, MessageSquare, Eye, Settings, LogOut, LayoutDashboard, User, PlusCircle, MapPin, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [artistProfile, setArtistProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    views: 0,
    inquiries: 0,
    events: 0,
    followers: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        // Fetch artist profile
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (artistData) {
          setArtistProfile(artistData);
          setStats({
            views: artistData.views || 0,
            inquiries: artistData.inquiries || 0,
            events: artistData.events_count || 0,
            followers: artistData.followers || 0,
          });

          // Fetch user's events
          const { data: eventsData } = await supabase
            .from("events")
            .select("*")
            .eq("artist_id", artistData.id)
            .order("event_date", { ascending: true })
            .limit(10);

          setEvents(eventsData || []);

          // Fetch user's inquiries
          const { data: inquiriesData } = await supabase
            .from("inquiries")
            .select("*")
            .eq("artist_id", artistData.id)
            .order("created_at", { ascending: false })
            .limit(10);

          setInquiries(inquiriesData || []);
        }
      } else {
        setLocation("/login");
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [setLocation]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  const createProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("artists")
      .insert([
        {
          user_id: user.id,
          name: user.email.split('@')[0],
          bio: "Nuevo artista en TUESDI",
          genres: [],
        },
      ])
      .select()
      .single();
    
    if (data) {
      setArtistProfile(data);
      window.location.reload();
    } else {
      alert("Error al crear el perfil: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
      </div>
    );
  }

  const recentEvents = events.slice(0, 3);
  const recentInquiries = inquiries.slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-white/5 flex flex-col sticky top-0 h-auto md:h-screen z-50">
        <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
          <img src="/logo-horizontal.png" alt="TUESDI" className="h-10 object-contain" />
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Button 
            variant={activeTab === "overview" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3" 
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={18} />
            Resumen
          </Button>
          <Button 
            variant={activeTab === "events" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3" 
            onClick={() => setActiveTab("events")}
            disabled={!artistProfile}
          >
            <Calendar size={18} />
            Mis Eventos
          </Button>
          <Button 
            variant={activeTab === "inquiries" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3" 
            onClick={() => setActiveTab("inquiries")}
            disabled={!artistProfile}
          >
            <MessageSquare size={18} />
            Consultas
          </Button>
          <Button 
            variant={activeTab === "profile" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3" 
            onClick={() => setActiveTab("profile")}
            disabled={!artistProfile}
          >
            <User size={18} />
            Perfil
          </Button>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={() => setActiveTab("profile")} disabled={!artistProfile}>
            <Settings size={18} />
            Configuración
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut size={18} />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-card/50 backdrop-blur-sm border-b border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground capitalize">
              {activeTab === "overview" && "Bienvenido de nuevo"}
              {activeTab === "events" && "Gestión de Eventos"}
              {activeTab === "inquiries" && "Mensajes y Consultas"}
              {activeTab === "profile" && "Configuración de Perfil"}
            </h2>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" 
              onClick={() => setLocation("/publicar-evento")}
              disabled={!artistProfile}
            >
              <PlusCircle size={18} />
              Publicar Evento
            </Button>
          </div>
        </header>

        <div className="p-6 md:p-8">
          {!artistProfile && (
            <Card className="p-8 border-primary/20 bg-primary/5 mb-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-primary w-6 h-6 mt-1" />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Perfil de Artista no detectado</h3>
                    <p className="text-muted-foreground">Para publicar eventos y recibir consultas, necesitas activar tu perfil de artista.</p>
                  </div>
                  <Button onClick={createProfile}>Activar Perfil de Artista Ahora</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-border bg-card/50 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Eye size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vistas Perfil</p>
                      <p className="text-2xl font-bold">{stats.views}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 border-border bg-card/50 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Consultas</p>
                      <p className="text-2xl font-bold">{stats.inquiries}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 border-border bg-card/50 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-accent/10 text-accent">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Eventos</p>
                      <p className="text-2xl font-bold">{stats.events}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6 border-border bg-card/50 hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                      <Music2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Seguidores</p>
                      <p className="text-2xl font-bold">{stats.followers}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Events List */}
                <Card className="p-6 bg-card/50 border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Eventos Recientes</h3>
                    <Button variant="link" className="text-primary" onClick={() => setActiveTab("events")} disabled={!artistProfile}>Ver todos</Button>
                  </div>
                  <div className="space-y-4">
                    {recentEvents.length > 0 ? (
                      recentEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border group hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Calendar size={20} />
                            </div>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-primary transition-colors">{event.title}</p>
                              <p className="text-xs text-muted-foreground">{event.venue} • {event.event_date}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                            event.status === "published"
                              ? "bg-secondary/20 text-secondary-foreground"
                              : "bg-muted/50 text-muted-foreground"
                          }`}>
                            {event.status === "published" ? "Publicado" : "Borrador"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p>No hay eventos registrados</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Recent Inquiries List */}
                <Card className="p-6 bg-card/50 border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Consultas Recientes</h3>
                    <Button variant="link" className="text-primary" onClick={() => setActiveTab("inquiries")} disabled={!artistProfile}>Ver todas</Button>
                  </div>
                  <div className="space-y-4">
                    {recentInquiries.length > 0 ? (
                      recentInquiries.map((inquiry) => (
                        <div key={inquiry.id} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border group hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                              {inquiry.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-foreground group-hover:text-primary transition-colors">{inquiry.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{inquiry.subject}</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{inquiry.created_at}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p>No hay mensajes nuevos</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "events" && artistProfile && (
            <Card className="p-8 bg-card/50 border-border">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold">Mis Eventos</h3>
                  <p className="text-sm text-muted-foreground">Gestiona y publica tus próximas presentaciones.</p>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setLocation("/publicar-evento")}>
                  Crear Nuevo Evento
                </Button>
              </div>
              <div className="space-y-4">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-background/50 rounded-xl border border-border hover:border-primary/50 transition-all gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
                          <Music2 size={32} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-foreground">{event.title}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar size={14} /> {event.event_date} • <MapPin size={14} /> {event.venue}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          event.status === "published"
                            ? "bg-secondary/20 text-secondary-foreground"
                            : "bg-muted/50 text-muted-foreground"
                        }`}>
                          {event.status === "published" ? "Publicado" : "Borrador"}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/eventos/${event.id}`)}
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-background/30 rounded-xl border border-dashed border-border">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-muted-foreground">Aún no has publicado ningún evento.</p>
                    <Button variant="link" className="text-primary mt-2" onClick={() => setLocation("/publicar-evento")}>Publicar mi primer evento</Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Additional tabs like inquiries and profile would go here */}
        </div>
      </main>
    </div>
  );
}
