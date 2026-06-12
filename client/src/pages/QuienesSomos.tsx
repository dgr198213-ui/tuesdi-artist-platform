import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Heart, Zap, Eye, Handshake } from "lucide-react";

export default function QuienesSomos() {
  const [, setLocation] = useLocation();

  const values = [
    {
      icon: Handshake,
      title: "Conectividad",
      description: "Conectamos artistas con oportunidades reales sin intermediarios."
    },
    {
      icon: Eye,
      title: "Transparencia",
      description: "Sin comisiones ocultas, sin sorpresas. Todo es claro."
    },
    {
      icon: Zap,
      title: "Visibilidad",
      description: "Damos a los artistas la plataforma que merecen."
    },
    {
      icon: Heart,
      title: "Pasión",
      description: "Creemos en el talento en vivo y su poder transformador."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            ← Volver
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Quiénes Somos</h1>
          <p className="text-muted-foreground mt-2">La historia detrás de TUESDI</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Mission */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">Nuestra Misión</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              TUESDI existe para democratizar la visibilidad artística. Creemos que el talento en vivo no debería estar limitado por intermediarios, comisiones o fricción. Nuestro objetivo es crear un espacio donde artistas de cualquier disciplina puedan mostrar su trabajo y conectar directamente con oportunidades reales.
            </p>
          </section>

          {/* Vision */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">Nuestra Visión</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Un mundo donde el talento en vivo prospera sin barreras. Donde los artistas controlan su visibilidad, los promotores encuentran talento auténtico, y las oportunidades fluyen sin fricción. TUESDI es la plataforma que hace posible este futuro.
            </p>
          </section>

          {/* Values */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-8">Nuestros Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <Card key={value.title} className="p-6 bg-card/50 border-border hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Story */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">Nuestra Historia</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                TUESDI nace de una observación simple: el talento en vivo está fragmentado. Los artistas luchan por visibilidad, los promotores tienen dificultades para encontrar talento, y los intermediarios se llevan una parte del pastel.
              </p>
              <p>
                Decidimos construir una plataforma diferente. Una donde no hay comisiones, no hay intermediarios, no hay fricción. Solo artistas, eventos, y oportunidades directas.
              </p>
              <p>
                Hoy, TUESDI conecta artistas de todas las disciplinas con promotores que buscan talento auténtico. Somos una plataforma pequeña, pero con un propósito claro: democratizar el acceso a oportunidades artísticas.
              </p>
            </div>
          </section>

          {/* Claim */}
          <section className="bg-primary/10 border border-primary/30 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Tu Escaparate Digital para Artistas y Eventos
            </h3>
            <p className="text-lg text-muted-foreground">
              Talento en vivo, sin límites.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">¿Preguntas?</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Si tienes preguntas sobre TUESDI, nuestro equipo está aquí para ayudarte.
            </p>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setLocation("/contacto")}
            >
              Contactar con Nosotros
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
