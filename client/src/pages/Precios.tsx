import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function Precios() {
  const plans = [
    {
      name: "Free",
      price: "0€",
      description: "Para comenzar",
      features: [
        "1 foto de perfil",
        "Perfil público",
        "Hasta 5 eventos",
        "Contacto básico",
      ],
      highlighted: false,
    },
    {
      name: "Standard",
      price: "9,99€",
      period: "/mes",
      description: "Para artistas activos",
      features: [
        "3 fotos de perfil",
        "1 video",
        "Hasta 10 eventos",
        "Estadísticas básicas",
        "Soporte por email",
        "Insignia de verificación",
      ],
      highlighted: true,
    },
    {
      name: "Pro",
      price: "19,99€",
      period: "/mes",
      description: "Para profesionales",
      features: [
        "3 fotos de perfil",
        "3 videos",
        "Eventos ilimitados",
        "Estadísticas avanzadas",
        "Soporte prioritario",
        "Insignia de verificación",
        "Análisis de audiencia",
        "Promoción destacada",
      ],
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Planes y Precios</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Elige el plan perfecto para tu carrera artística
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border transition-all ${
                plan.highlighted
                  ? "border-primary bg-card/80 shadow-lg scale-105"
                  : "border-border bg-card/50"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>

                <Button
                  className={`w-full mb-8 ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border-border hover:bg-muted"
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  {plan.name === "Free" ? "Comenzar" : "Suscribirse"}
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-4">
            <Card className="bg-card/50 border-border p-6">
              <h3 className="font-semibold text-foreground mb-2">¿Puedo cambiar de plan?</h3>
              <p className="text-muted-foreground">
                Sí, puedes cambiar tu plan en cualquier momento desde tu panel de control.
              </p>
            </Card>
            <Card className="bg-card/50 border-border p-6">
              <h3 className="font-semibold text-foreground mb-2">¿Hay período de prueba?</h3>
              <p className="text-muted-foreground">
                Sí, todos los planes de pago incluyen 7 días de prueba gratuita.
              </p>
            </Card>
            <Card className="bg-card/50 border-border p-6">
              <h3 className="font-semibold text-foreground mb-2">¿Puedo cancelar en cualquier momento?</h3>
              <p className="text-muted-foreground">
                Sí, puedes cancelar tu suscripción en cualquier momento sin penalización.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
