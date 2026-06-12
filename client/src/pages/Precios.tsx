import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, Zap, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";

export default function Precios() {
  const [, setLocation] = useLocation();

  const plans = [
    {
      name: "Beta",
      price: "0€",
      period: "/mes",
      description: "Tu perfil público en TUESDI, sin coste.",
      features: [
        "Perfil público de artista",
        "1 fotografía",
        "Biografía",
        "Categoría y ciudad",
        "Caché orientativo",
        "Formulario de contacto privado",
        "Métricas básicas (visitas, solicitudes)",
      ],
      buttonText: "Crear Perfil Gratis",
      highlighted: false,
    },
    {
      name: "Standard",
      price: "6€",
      period: "/mes",
      description: "Más contenido y mejor posicionamiento en el directorio.",
      features: [
        "Todo lo del plan Beta",
        "3 fotografías",
        "1 vídeo",
        "Mejor posicionamiento en búsquedas",
        "Métricas ampliadas (evolución semanal, histórico)",
      ],
      buttonText: "Pasar a Standard",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "9,99€",
      period: "/mes",
      description: "Máxima visibilidad y analítica avanzada para profesionales.",
      features: [
        "Todo lo del plan Standard",
        "3 fotografías",
        "3 vídeos",
        "Prioridad interna en el directorio",
        "Distintivo Pro",
        "Analítica avanzada y tendencias",
      ],
      buttonText: "Pasar a Pro",
      highlighted: true,
    },
  ];

  const handleSubscribe = (planName: string) => {
    // La gestión de suscripciones via Stripe se conectará en una fase posterior.
    // Por ahora, redirige al registro para crear el perfil de artista.
    console.log("Selected plan:", planName);
    setLocation("/registro");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo-horizontal.png" alt="TUESDI" className="h-10 md:h-12 object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="/explorar-artistas" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">
              Artistas
            </a>
            <a href="/eventos" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">
              Eventos
            </a>
            <a href="/precios" className="text-sm font-semibold text-primary transition-colors uppercase tracking-wider">
              Precios
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-primary text-primary hover:bg-primary/10 px-6"
              onClick={() => setLocation("/login")}
            >
              Acceso
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-b from-primary/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Planes para Artistas</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empieza gratis con el plan Beta y crece a tu ritmo. Sin comisiones, sin intermediarios.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border transition-all duration-300 overflow-hidden rounded-3xl ${
                plan.highlighted
                  ? "border-primary bg-card/80 shadow-2xl shadow-primary/20 scale-105 z-10"
                  : "border-white/5 bg-card/50"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-white px-4 py-1 text-xs font-bold uppercase tracking-widest transform rotate-0 rounded-bl-xl flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Recomendado
                  </div>
                </div>
              )}

              <div className="p-10">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-8 min-h-[40px]">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">{plan.period}</span>
                </div>

                <Button
                  className={`w-full mb-10 h-12 rounded-2xl font-bold transition-all ${
                    plan.highlighted
                      ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
                      : "bg-white/5 text-white hover:bg-white/10 border-white/10"
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.name)}
                >
                  {plan.buttonText}
                </Button>

                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="bg-primary/20 p-1 rounded-full">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-5xl mx-auto">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary">
              <Zap className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Activación Instantánea</h4>
            <p className="text-muted-foreground">Tu perfil estará activo y visible para promotores en cuestión de segundos tras el registro.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-secondary/10 rounded-3xl flex items-center justify-center mx-auto text-secondary">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Sin Compromiso</h4>
            <p className="text-muted-foreground">Puedes cancelar o cambiar tu suscripción en cualquier momento desde tu panel de control.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto text-accent">
              <Star className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Métricas Reales</h4>
            <p className="text-muted-foreground">Sin datos falsos: visitas, solicitudes y tendencias reales sobre tu perfil.</p>
          </div>
        </div>
      </div>

      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; 2026 TUESDI — Tu Escenario Digital. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
