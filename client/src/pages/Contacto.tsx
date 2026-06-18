/**
 * TUESDI - Tu Escenario Digital v3.0
 * Página de Contacto
 *
 * Página de contacto público para consultas generales.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Contacto() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    // Honeypot: campo oculto para detectar bots. Nunca visible para humanos.
    website: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Detección de bot en el cliente: el campo honeypot debe estar siempre vacío
    if (formData.website) {
      // Simulamos éxito para no revelar la detección al bot
      setFormData({ name: "", email: "", subject: "", message: "", website: "" });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: formData,
      });

      if (error) throw error;

      toast.success("Mensaje enviado", {
        description: "Gracias por contactarnos. Te responderemos lo antes posible.",
      });
      setFormData({ name: "", email: "", subject: "", message: "", website: "" });
    } catch {
      toast.error("Error al enviar", {
        description: "No hemos podido enviar tu mensaje. Inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageNav />

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
                      placeholder="¿Sobre qué quieres contactarnos?"
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

                  {/* Honeypot anti-spam: invisible para humanos, los bots lo rellenan */}
                  <div className="absolute left-[-9999px]" aria-hidden="true" tabIndex={-1}>
                    <label htmlFor="website">No rellenar este campo</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      tabIndex={-1}
                      autoComplete="off"
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
      <PageFooter />
    </div>
  );
}
