/**
 * TUESDI - Tu Escenario Digital v3.0
 * Página Principal (Home)
 *
 * Objetivo: Explicar TUESDI en menos de 10 segundos.
 * - Hero con título y subtítulo oficiales
 * - Artistas destacados
 * - Eventos recientes
 * - Cómo funciona
 * - Planes
 * - Preguntas frecuentes
 * - CTA final
 */

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import {
  Search,
  Music2,
  Calendar,
  MapPin,
  ArrowRight,
  Sparkles,
  Instagram,
  Eye,
  Shield,
  Zap,
  Users,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const featuredArtists = [
    {
      id: "luna-martinez",
      name: "Luna Martínez",
      category: "Cantante",
      city: "Madrid",
      image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=80",
      verified: true,
      plan: "pro",
    },
    {
      id: "dj-carlos",
      name: "DJ Carlos",
      category: "DJ",
      city: "Barcelona",
      image: "https://images.unsplash.com/photo-1520872024865-3ff2805d8bb3?auto=format&fit=crop&w=400&q=80",
      verified: false,
      plan: "standard",
    },
    {
      id: "the-rock-stars",
      name: "The Rock Stars",
      category: "Banda",
      city: "Valencia",
      image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=400&q=80",
      verified: true,
      plan: "pro",
    },
    {
      id: "mago-alex",
      name: "Mago Álex",
      category: "Magia",
      city: "Sevilla",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      verified: true,
      plan: "standard",
    },
  ];

  const recentEvents = [
    {
      id: 1,
      title: "Noche de Blues en el Local",
      date: "15 Jun 2024",
      city: "Madrid",
      category: "Concierto",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 2,
      title: "Festival Electrónico Verano",
      date: "22 Jun 2024",
      city: "Barcelona",
      category: "Festival",
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      title: "Jazz en el Parque",
      date: "29 Jun 2024",
      city: "Valencia",
      category: "Concierto",
      image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=80",
    },
  ];

  const howItWorks = [
    {
      icon: UserPlus,
      title: "Crea tu perfil",
      description: "Regístrate en segundos con tu email. Sin contraseñas, sin complicaciones.",
    },
    {
      icon: ImageIcon,
      title: "Muestra tu talento",
      description: "Añade fotos, vídeos y tu biografía. Elige tu plan según tus necesidades.",
    },
    {
      icon: Eye,
      title: "Gana visibilidad",
      description: "Aparece en el directorio y recibe visitas de organizadores y promotores.",
    },
    {
      icon: Mail,
      title: "Recibe contactos",
      description: "Las solicitudes llegan a tu panel privado. Tú decides si responder.",
    },
  ];

  const plans = [
    {
      name: "Beta",
      price: "0€",
      period: "/mes",
      description: "Perfecto para empezar",
      features: [
        "Perfil público",
        "1 fotografía",
        "Biografía básica",
        "Categoría y ciudad",
        "Formulario de contacto",
        "Métricas básicas",
      ],
      highlighted: false,
    },
    {
      name: "Standard",
      price: "6€",
      period: "/mes",
      description: "Más visibilidad",
      features: [
        "Todo lo de Beta",
        "3 fotografías",
        "1 vídeo",
        "Mejor posicionamiento",
        "Métricas ampliadas",
      ],
      highlighted: true,
    },
    {
      name: "Pro",
      price: "9,99€",
      period: "/mes",
      description: "Máxima exposición",
      features: [
        "Todo lo de Standard",
        "3 vídeos",
        "Prioridad en búsquedas",
        "Distintivo Pro",
        "Analítica avanzada",
      ],
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "¿Qué es TUESDI?",
      answer:
        "TUESDI es una plataforma de visibilidad artística. Un escaparate digital donde los artistas muestran su trabajo y reciben solicitudes de contacto de forma privada, sin exponer sus datos personales.",
    },
    {
      question: "¿TUESDI es una agencia artística?",
      answer:
        "No. TUESDI no es una agencia, no intermediamos, no cobramos comisiones y no gestionamos pagos entre usuarios. Somos exclusivamente una plataforma de visibilidad.",
    },
    {
      question: "¿Cómo funciona el contacto con los artistas?",
      answer:
        "Los visitantes envían solicitudes a través de un formulario privado. El artista las recibe en su panel y decide si responder. Nunca se exponen emails, teléfonos o datos personales.",
    },
    {
      question: "¿Puedo publicar eventos?",
      answer:
        "Sí. El ecosistema de eventos es independiente y gratuito. Los organizadores publican a través de un formulario con Magic Link, sin necesidad de cuenta permanente.",
    },
    {
      question: "¿Qué incluye cada plan?",
      answer:
        "Beta es gratuito con perfil básico. Standard (6€/mes) añade 3 fotos, 1 vídeo y mejor posicionamiento. Pro (9,99€/mes) incluye 3 vídeos, prioridad en búsquedas y analítica avanzada.",
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
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
          </nav>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                className="border-primary text-primary hover:bg-primary/10"
                onClick={() => setLocation("/dashboard")}
              >
                Mi Panel
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-primary"
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
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-xs text-secondary font-bold uppercase tracking-widest">
                Tu Escenario Digital
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight max-w-4xl mx-auto">
              Tu escaparate digital para{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                artistas
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Muestra tu talento, aumenta tu visibilidad y recibe solicitudes de
              contacto sin exponer tus datos personales.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 h-14 px-10 text-lg font-semibold shadow-lg shadow-primary/20"
                onClick={() => setLocation("/registro")}
              >
                Crear Perfil
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 h-14 px-10 text-lg font-semibold"
                onClick={() => setLocation("/artistas")}
              >
                Ver Artistas
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="flex items-center bg-card border border-white/10 rounded-2xl overflow-hidden p-2">
                <Search className="ml-4 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Busca artistas por nombre, categoría o ciudad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent border-none text-white placeholder:text-muted-foreground py-5 text-base focus-visible:ring-0"
                />
                <Button
                  className="bg-primary text-white hover:bg-primary/90 px-6 h-11 rounded-xl font-semibold mr-1"
                  onClick={() => setLocation(`/artistas?search=${searchTerm}`)}
                >
                  Buscar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-24 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Artistas Destacados
              </h2>
              <p className="text-muted-foreground">
                Descubre talento emergente en TUESDI
              </p>
            </div>
            <Button
              variant="link"
              className="text-primary font-medium hidden md:flex items-center gap-2"
              onClick={() => setLocation("/artistas")}
            >
              Ver todos los artistas
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredArtists.map((artist) => (
              <Card
                key={artist.id}
                className="bg-card border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setLocation(`/artista/${artist.id}`)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {artist.verified && (
                    <div className="absolute top-3 left-3 bg-secondary text-black p-1.5 rounded-full">
                      <CheckCircle size={14} />
                    </div>
                  )}
                  {artist.plan === "pro" && (
                    <div className="absolute top-3 right-3 bg-primary text-white px-2 py-1 rounded-full text-xs font-bold uppercase">
                      Pro
                    </div>
                  )}
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                    {artist.name}
                  </h3>
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-3">
                    {artist.category}
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    {artist.city}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Events */}
      <section className="py-24 border-t border-white/10 bg-white/[0.02] relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Eventos Recientes
              </h2>
              <p className="text-muted-foreground">
                Oportunidades para artistas y público
              </p>
            </div>
            <Button
              variant="link"
              className="text-primary font-medium hidden md:flex items-center gap-2"
              onClick={() => setLocation("/eventos")}
            >
              Ver todos los eventos
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-card border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                onClick={() => setLocation(`/eventos/${event.id}`)}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {event.category}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      {event.city}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Cómo funciona
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple, directo y sin intermediarios. Así es TUESDI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-24 border-t border-white/10 bg-white/[0.02] relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Planes de suscripción
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-primary/10 to-card border-primary/50"
                    : "bg-card border-white/10"
                } p-8`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                    Más popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                  onClick={() => setLocation("/registro")}
                >
                  Empezar
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-24 border-t border-white/10 relative z-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="bg-card border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left"
                >
                  <span className="text-white font-semibold pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para ganar visibilidad?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Visibilidad para artistas. Oportunidades para eventos. Sin
            intermediarios.
          </p>
          <Button
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 h-14 px-12 text-lg font-semibold shadow-xl shadow-primary/20"
            onClick={() => setLocation("/registro")}
          >
            Crear mi perfil gratis
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-card py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-white font-bold">TUESDI</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Tu Escenario Digital. Plataforma de visibilidad artística sin
                intermediarios.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Plataforma
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="/artistas" className="hover:text-primary transition-colors">
                    Artistas
                  </a>
                </li>
                <li>
                  <a href="/eventos" className="hover:text-primary transition-colors">
                    Eventos
                  </a>
                </li>
                <li>
                  <a href="/planes" className="hover:text-primary transition-colors">
                    Planes
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Empresa
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="/quienes-somos" className="hover:text-primary transition-colors">
                    Quiénes Somos
                  </a>
                </li>
                <li>
                  <a href="/contacto" className="hover:text-primary transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href="/terminos-servicio" className="hover:text-primary transition-colors">
                    Términos del Servicio
                  </a>
                </li>
                <li>
                  <a href="/politica-privacidad" className="hover:text-primary transition-colors">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="/politica-cookies" className="hover:text-primary transition-colors">
                    Política de Cookies
                  </a>
                </li>
                <li>
                  <a href="/aviso-legal" className="hover:text-primary transition-colors">
                    Aviso Legal
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TUESDI — Tu Escenario Digital.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/tuesdi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary transition-all"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icon components
function UserPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function Mail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}