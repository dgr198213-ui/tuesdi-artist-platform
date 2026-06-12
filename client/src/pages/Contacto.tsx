/**
 * TUESDI - Tu Escenario Digital v3.0
 * Página de Contacto
 *
 * Página de contacto público para consultas generales.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/sonner";
import { Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";

export default function Contacto() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulación de envío - En producción conectar con Edge Function de Resend
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Mensaje enviado",
        description:
          "Gracias por contactarnos. Te responderemos lo antes posible.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({
        title: "Error",
        description: "No hemos podido enviar tu mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setLocation("/")}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight">
                TUESDI
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Tu Escenario Digital
              </span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="/artistas"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Artistas
            </a>
            <a
              href="/eventos"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Eventos
            </a>
            <a
              href="/planes"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Planes
            </a>
            <a
              href="/quienes-somos"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Quiénes Somos
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/login")}
            >
              Acceso
            </Button>
            <Button
              size="sm"
              className="bg-primary text-white hover:bg-primary/90"
              onClick={() => setLocation("/registro")}
            >
              Registro
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <MessageCircle className="w-4 h-4 text-secondary" />
              <span className="text-xs text-secondary font-bold uppercase tracking-widest">
                Contacto
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              ¿Tienes alguna pregunta?
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Estamos aquí para ayudarte. Contáctanos y te responderemos lo
              antes posible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-card border-white/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground text-sm">
                      hola@tuesdi.es
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-white/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Ubicación</h3>
                    <p className="text-muted-foreground text-sm">España</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-white/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      Horario
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Lun - Vie: 9:00 - 18:00
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-white/10 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-white">
                        Nombre
                      </Label>
                      <Input
                        id="name"
                        placeholder="Tu nombre"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="bg-background border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        className="bg-background border-white/10 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white">
                      Asunto
                    </Label>
                    <Input
                      id="subject"
                      placeholder="¿Sobre qué quieres联系我们?"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                      className="bg-background border-white/10 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">
                      Mensaje
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Escribe tu mensaje aquí..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                      rows={6}
                      className="bg-background border-white/10 text-white resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white hover:bg-primary/90 h-12"
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar mensaje
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-white font-semibold">TUESDI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/aviso-legal" className="hover:text-primary transition-colors">
                Aviso Legal
              </a>
              <a href="/politica-privacidad" className="hover:text-primary transition-colors">
                Privacidad
              </a>
              <a href="/terminos-servicio" className="hover:text-primary transition-colors">
                Términos
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} TUESDI — Tu Escenario Digital.
          </div>
        </div>
      </footer>
    </div>
  );
}