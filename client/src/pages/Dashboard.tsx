import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music2, Calendar, MessageSquare, Eye, Settings } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = {
    views: 1234,
    inquiries: 45,
    events: 8,
    followers: 234,
  };

  const recentEvents = [
    {
      id: 1,
      title: "Concierto en Vivo",
      date: "2024-06-15",
      venue: "Teatro Principal",
      status: "published",
    },
    {
      id: 2,
      title: "Sesión Acústica",
      date: "2024-06-22",
      venue: "Café Cultural",
      status: "draft",
    },
  ];

  const recentInquiries = [
    {
      id: 1,
      name: "Juan García",
      subject: "Consulta para evento corporativo",
      date: "2024-06-08",
      status: "pending",
    },
    {
      id: 2,
      name: "María López",
      subject: "Disponibilidad para boda",
      date: "2024-06-07",
      status: "read",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music2 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Panel de Control</h1>
              <p className="text-sm text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-border hover:bg-muted"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Vistas</p>
                <p className="text-3xl font-bold text-foreground">{stats.views}</p>
              </div>
              <Eye className="w-8 h-8 text-primary/50" />
            </div>
          </Card>

          <Card className="bg-card/50 border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Consultas</p>
                <p className="text-3xl font-bold text-foreground">{stats.inquiries}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-secondary/50" />
            </div>
          </Card>

          <Card className="bg-card/50 border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Eventos</p>
                <p className="text-3xl font-bold text-foreground">{stats.events}</p>
              </div>
              <Calendar className="w-8 h-8 text-accent/50" />
            </div>
          </Card>

          <Card className="bg-card/50 border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Seguidores</p>
                <p className="text-3xl font-bold text-foreground">{stats.followers}</p>
              </div>
              <Music2 className="w-8 h-8 text-primary/50" />
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-card/50 border border-border">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="inquiries">Consultas</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="bg-card/50 border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Eventos Recientes</h3>
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-muted/20 rounded border border-border">
                    <div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.venue} • {event.date}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      event.status === "published"
                        ? "bg-secondary/20 text-secondary-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {event.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-card/50 border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Consultas Recientes</h3>
              <div className="space-y-3">
                {recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between p-3 bg-muted/20 rounded border border-border">
                    <div>
                      <p className="font-medium text-foreground">{inquiry.name}</p>
                      <p className="text-sm text-muted-foreground">{inquiry.subject}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{inquiry.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card className="bg-card/50 border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Mis Eventos</h3>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Nuevo Evento
                </Button>
              </div>
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-muted/20 rounded border border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-foreground">{event.title}</p>
                      <p className="text-sm text-muted-foreground">{event.venue} • {event.date}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded ${
                      event.status === "published"
                        ? "bg-secondary/20 text-secondary-foreground"
                        : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {event.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries" className="mt-6">
            <Card className="bg-card/50 border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Consultas Recibidas</h3>
              <div className="space-y-3">
                {recentInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="flex items-center justify-between p-4 bg-muted/20 rounded border border-border hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{inquiry.name}</p>
                      <p className="text-sm text-muted-foreground">{inquiry.subject}</p>
                    </div>
                    <span className="text-xs text-muted-foreground ml-4">{inquiry.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card className="bg-card/50 border-border p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Editar Perfil</h3>
              <div className="space-y-4">
                <p className="text-muted-foreground">Funcionalidad de edición de perfil próximamente</p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Editar Perfil
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
