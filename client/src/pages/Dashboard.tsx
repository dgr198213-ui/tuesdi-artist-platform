import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music2, Calendar, MessageSquare, Eye, Settings, LogOut, LayoutDashboard, User, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [events, setEvents] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [stats, setStats] = useState({
    views: 0,
    inquiries: 0,
    events: 0,
    followers: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);

        // Fetch artist profile
        const { data: artistData } = await supabase
          .from("artists")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (artistData) {
          setStats({
            views: artistData.views || 0,
            inquiries: artistData.inquiries || 0,
            events: artistData.events_count || 0,
            followers: artistData.followers || 0,
          });
        }

        // Fetch user's events
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .eq("artist_id", artistData?.id)
          .order("event_date", { ascending: true })
          .limit(10);

        setEvents(eventsData || []);

        // Fetch user's inquiries
        const { data: inquiriesData } = await supabase
          .from("inquiries")
          .select("*")
          .eq("artist_id", artistData?.id)
          .order("created_at", { ascending: false })
          .limit(10);

        setInquiries(inquiriesData || []);
      } else {
        setLocation("/login");
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/");
  };

  const recentEvents = events.slice(0, 3);
  const recentInquiries = inquiries.slice(0, 3);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border flex flex-col sticky top-0 h-auto md:h-screen z-50">
        <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
          <img src="/logo.png" alt="Tuesdi Logo" className="w-8 h-8 object-contain" />
          <span className="text-xl font-bold text-foreground">Tuesdi</span>
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
          >
            <Calendar size={18} />
            Mis Eventos
          </Button>
          <Button 
            variant={activeTab === "inquiries" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3" 
            onClick={() => setActiveTab("inquiries")}
          >
            <MessageSquare size={18} />
            Consultas
          </Button>
          <Button 
            variant={activeTab === "profile" ? "secondary" : "ghost"} 
            className="w-full justify-start gap-3" 
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} />
            Perfil
          </Button>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={() => setLocation("/precios")}>
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
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={() => setLocation("/publicar-evento")}>
              <PlusCircle size={18} />
              Publicar Evento
            </Button>
          </div>
        </header>

        <div className="p-6 md:p-8">
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
                    <Button variant="link" className="text-primary" onClick={() => setActiveTab("events")}>Ver todos</Button>
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
                    <Button variant="link" className="text-primary" onClick={() => setActiveTab("inquiries")}>Ver todas</Button>
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

          {activeTab === "events" && (
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
                        <Button variant="outline" size="sm">Editar</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-background/30 rounded-xl border border-dashed border-border">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-lg text-muted-foreground mb-4">Aún no has publicado ningún evento</p>
                    <Button onClick={() => setLocation("/publicar-evento")}>Publicar mi primer evento</Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === "inquiries" && (
            <Card className="p-8 bg-card/50 border-border">
              <div className="mb-8">
                <h3 className="text-xl font-bold">Consultas Recibidas</h3>
                <p className="text-sm text-muted-foreground">Mensajes de organizadores y fans interesados en tu trabajo.</p>
              </div>
              <div className="space-y-4">
                {inquiries.length > 0 ? (
                  inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="p-6 bg-background/50 rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {inquiry.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground">{inquiry.name}</h4>
                            <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{inquiry.created_at}</span>
                      </div>
                      <h5 className="font-semibold text-foreground mb-2">{inquiry.subject}</h5>
                      <p className="text-sm text-muted-foreground line-clamp-2">{inquiry.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-background/30 rounded-xl border border-dashed border-border">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p className="text-lg text-muted-foreground">No tienes mensajes nuevos en este momento</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-8 bg-card/50 border-border">
                <h3 className="text-xl font-bold mb-8">Editar Información de Artista</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nombre Artístico</label>
                      <Input placeholder="Ej: Luna Martínez" className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Categoría</label>
                      <Input placeholder="Ej: DJ / Productor" className="bg-background" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Biografía</label>
                    <textarea className="w-full min-h-[150px] p-3 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Cuéntanos sobre tu trayectoria..."></textarea>
                  </div>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">Guardar Cambios</Button>
                </div>
              </Card>
              
              <Card className="p-8 bg-card/50 border-border flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1 mb-6">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                    <User size={64} className="text-muted-foreground" />
                  </div>
                </div>
                <h4 className="text-lg font-bold mb-2">Foto de Perfil</h4>
                <p className="text-xs text-muted-foreground mb-6">Recomendado: 400x400px, máx 2MB</p>
                <Button variant="outline" size="sm" className="w-full">Cambiar Imagen</Button>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
