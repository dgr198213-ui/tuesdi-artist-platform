import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRoute, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Mail, Instagram, Music, Music2, Globe, MapPin, Star, ArrowLeft } from "lucide-react";

export default function ArtistaProfile() {
  const [route, params] = useRoute("/artista/:id");
  const [, setLocation] = useLocation();
  const [artist, setArtist] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSubject, setContactSubject] = useState("Contacto");
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const openContactDialog = (subject: string) => {
    setContactSubject(subject);
    setContactForm({ name: "", email: "", message: "" });
    setContactOpen(true);
  };

  const handleSendInquiry = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert("Por favor completa todos los campos");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("inquiries").insert([
        {
          artist_id: artist.id,
          name: contactForm.name,
          email: contactForm.email,
          subject: contactSubject,
          message: contactForm.message,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("Error sending inquiry:", error);
        alert("No se pudo enviar tu mensaje. Intenta de nuevo más tarde.");
      } else {
        alert(`Mensaje enviado a ${artist.name}. Te contactará pronto.`);
        setContactOpen(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error inesperado al enviar el mensaje.");
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    const fetchArtist = async () => {
      if (!params?.id) return;

      try {
        const { data, error } = await supabase
          .from("artists")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) {
          console.error("Error fetching artist:", error);
        } else {
          setArtist(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchEvents = async () => {
      if (!params?.id) return;

      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("artist_id", params.id)
          .gte("event_date", new Date().toISOString().split("T")[0])
          .limit(10);

        if (error) {
          console.error("Error fetching events:", error);
        } else {
          setEvents(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchArtist();
    fetchEvents();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Artista no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo-horizontal.png" alt="TUESDI" className="h-10 md:h-12 object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white"
              onClick={() => setLocation("/explorar-artistas")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Explorar Artistas
            </Button>
          </div>
        </div>
      </header>
      {/* Cover Image */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
        {artist.cover_url ? (
          <img
            src={artist.cover_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary/30">
            <Music2 size={64} />
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {artist.avatar_url ? (
            <img
              src={artist.avatar_url}
              alt={artist.name}
              className="w-32 h-32 rounded-full border-4 border-card object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full border-4 border-card bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-primary">
              <Music2 size={40} />
            </div>
          )}
          <div className="flex-1 pt-4">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{artist.name}</h1>
              {artist.verified && (
                <span className="text-xs bg-secondary/20 text-secondary-foreground px-3 py-1 rounded">
                  Verificado
                </span>
              )}
            </div>
            <p className="text-muted-foreground mb-2">{artist.category}</p>
            <div className="flex items-center gap-4 mb-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-semibold text-foreground">{artist.rating || 0}</span>
                <span className="text-muted-foreground">({artist.reviews || 0} reseñas)</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {artist.city}, {artist.country || "España"}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => openContactDialog("Contacto")}
              >
                Contactar
              </Button>
              <Button
                variant="outline"
                className="border-border hover:bg-muted"
                onClick={() => openContactDialog("Solicitud de consulta")}
              >
                Solicitar Consulta
              </Button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">Desde</p>
            <p className="text-2xl font-bold text-primary">{artist.price_from || "Consultar"}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="bg-card/50 border border-border">
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="gallery">Galería</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="mt-6">
            <Card className="bg-card/50 border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Sobre el artista</h2>
              <p className="text-foreground leading-relaxed mb-6">{artist.bio}</p>
              
              <h3 className="text-lg font-semibold text-foreground mb-4">Enlaces</h3>
              <div className="flex gap-3">
                {artist.instagram_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted"
                    onClick={() => window.open(artist.instagram_url)}
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </Button>
                )}
                {artist.spotify_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted"
                    onClick={() => window.open(artist.spotify_url)}
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Spotify
                  </Button>
                )}
                {artist.website_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted"
                    onClick={() => window.open(artist.website_url)}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Sitio Web
                  </Button>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="mt-6">
            {artist.gallery_urls && artist.gallery_urls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {artist.gallery_urls.map((photo: string, idx: number) => (
                  <div key={idx} className="relative h-48 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 hover:border-primary/50 transition-colors cursor-pointer group">
                    <img
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-card/50 border-border p-6">
                <p className="text-muted-foreground">No hay fotos disponibles</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id} className="bg-card/50 border-border p-4 hover:border-primary/50 transition-colors cursor-pointer">
                    <h3 className="font-semibold text-foreground">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.event_date} • {event.venue}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/50 border-border p-6">
                <p className="text-muted-foreground">No hay eventos próximos</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="bg-card/50 border-border p-6">
              <p className="text-muted-foreground">Reseñas próximamente</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact / Inquiry Dialog */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{contactSubject} con {artist.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tu mensaje se enviará directamente al panel del artista.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contact-name" className="text-foreground mb-2 block">Tu nombre</Label>
              <Input
                id="contact-name"
                placeholder="Nombre"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="contact-email" className="text-foreground mb-2 block">Tu correo</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="tu@email.com"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="contact-message" className="text-foreground mb-2 block">Mensaje</Label>
              <Textarea
                id="contact-message"
                placeholder="Cuéntale al artista qué necesitas..."
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="bg-input border-border min-h-28"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSendInquiry}
              disabled={sending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {sending ? "Enviando..." : "Enviar Mensaje"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
