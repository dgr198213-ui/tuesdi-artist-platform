/**
 * TUESDI - Tu Escenario Digital v3.0
 * Página de Precios / Planes
 *
 * URL: /planes
 * Planes de suscripción:
 * - Beta: 0€/mes (perfil básico)
 * - Standard: 6€/mes (más contenido y visibilidad)
 * - Pro: 9,99€/mes (máxima exposición)
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, Shield, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";

export default function Precios() {
  const [, setLocation] = useLocation();

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
        "Caché orientativo",
        "Formulario de contacto privado",
        "Métricas básicas",
      ],
      buttonText: "Empezar gratis",
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
        "Evolución semanal",
        "Histórico",
      ],
      buttonText: "Elegir Standard",
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
        "Tendencias",
        "Histórico completo",
      ],
      buttonText: "Elegir Pro",
      highlighted: false,
    },
  ];

  const handleSubscribe = (planName: string) => {
    console.log("Selected plan:", planName);
    setLocation("/registro");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setLocation("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
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
              className="text-sm font-medium text-primary"
            >
              Planes
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
      <section className="py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Planes de suscripción
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Sin comisiones,
            sin intermediarios.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative transition-all duration-300 overflow-hidden ${
                  plan.highlighted
                    ? "bg-gradient-to-b from-primary/10 to-card border-primary/50 shadow-xl shadow-primary/10"
                    : "bg-card border-white/10"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-b-full text-xs font-bold uppercase">
                    Más popular
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    {plan.description}
                  </p>

                  <div className="mb-8">
                    <span className="text-5xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <Button
                    className={`w-full mb-8 h-12 font-semibold transition-all ${
                      plan.highlighted
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                    onClick={() => handleSubscribe(plan.name)}
                  >
                    {plan.buttonText}
                  </Button>

                  <div className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="bg-secondary/20 p-0.5 rounded-full mt-0.5">
                          <Check className="w-4 h-4 text-secondary" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Por qué elegir TUESDI?
            </h2>
            <p className="text-muted-foreground">
              La plataforma de visibilidad artística sin intermediarios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Visibilidad real
              </h3>
              <p className="text-muted-foreground">
                Tu perfil aparece en el directorio y recibe visitas de promotores
                y organizadores interesados.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Privacidad protegida
              </h3>
              <p className="text-muted-foreground">
                Tus datos personales nunca se exponen. Las solicitudes llegan a
                tu panel de forma privada.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Sin compromiso
              </h3>
              <p className="text-muted-foreground">
                Cancela o cambia tu suscripción cuando quieras. Sin penalizaciones
                ni complicaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-white/10 p-6">
              <h3 className="text-white font-semibold mb-3">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-muted-foreground">
                Sí, puedes cambiar de plan cuando quieras desde tu panel de
                control. Los cambios se aplicarán en el siguiente ciclo de
                facturación.
              </p>
            </Card>

            <Card className="bg-card border-white/10 p-6">
              <h3 className="text-white font-semibold mb-3">
                ¿Qué pasa si cancelo mi suscripción?
              </h3>
              <p className="text-muted-foreground">
                Tu perfil pasará automáticamente al plan gratuito (Beta) y
                seguirá visible en el directorio con las funcionalidades de ese
                plan.
              </p>
            </Card>

            <Card className="bg-card border-white/10 p-6">
              <h3 className="text-white font-semibold mb-3">
                ¿TUESDI cobra comisiones por contactos?
              </h3>
              <p className="text-muted-foreground">
                No. TUESDI no cobra comisiones, no intermediamos y no gestionamos
                pagos entre usuarios. Nuestra monetización viene exclusivamente de
                las suscripciones.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Listo para empezar?
          </h2>
          <p className="text-muted-foreground mb-8">
            Crea tu perfil gratis y comienza a ganar visibilidad hoy mismo.
          </p>
          <Button
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 h-14 px-10 text-lg font-semibold"
            onClick={() => setLocation("/registro")}
          >
            Crear perfil gratis
          </Button>
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
              <a
                href="/aviso-legal"
                className="hover:text-primary transition-colors"
              >
                Aviso Legal
              </a>
              <a
                href="/politica-privacidad"
                className="hover:text-primary transition-colors"
              >
                Privacidad
              </a>
              <a
                href="/terminos-servicio"
                className="hover:text-primary transition-colors"
              >
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