import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Heart, Zap, Eye, Handshake } from "lucide-react";
import { useSeo } from "@/lib/seo";

export default function QuienesSomos() {
  useSeo({ title: "Quiénes somos", description: "TUESDI conecta artistas independientes con quienes buscan talento. Sin intermediación, sin comisiones, con el control siempre del artista.", path: "/quienes-somos" });
  const [, setLocation] = useLocation();

  const values = [
    {
      icon: Handshake,
      title: "Sin intermediarios",
      description: "Facilitamos el primer contacto. La negociación y el trabajo siempre son directos entre vosotros."
    },
    {
      icon: Eye,
      title: "Privacidad por diseño",
      description: "Tu email y tu teléfono nunca se muestran públicamente. Tú decides qué compartir y cuándo."
    },
    {
      icon: Zap,
      title: "Control del artista",
      description: "Tú decides qué muestras, quién te contacta y si respondes. Siempre."
    },
    {
      icon: Heart,
      title: "Sin comisiones",
      description: "No cobramos por tus acuerdos. Tu trabajo y tu tarifa son solo tuyos."
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
            <h2 className="text-3xl font-bold text-foreground mb-4">Por qué existe TUESDI</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              La mayoría de plataformas quieren quedarse en medio de la relación entre artistas y organizadores: cobran comisión, procesan pagos, gestionan las conversaciones. Nosotros creemos justo lo contrario. Creemos que un artista debe decidir con quién trabaja y cómo. TUESDI existe para facilitar ese primer contacto sin convertirse en intermediario.
            </p>
          </section>

          {/* Mission */}
          <section>
            <h2 className="text-3xl font-bold text-foreground mb-4">Nuestra Misión</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Dar a los artistas un espacio profesional donde mostrar su trabajo y recibir oportunidades sin perder el control sobre sus datos ni sobre sus relaciones profesionales.
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
                TUESDI no nació para convertirse en un marketplace, ni en una agencia, ni en una plataforma de contratación. Nació de una observación simple: la mayoría de plataformas del sector controlan toda la relación entre dos personas — cobran comisión, procesan pagos, almacenan conversaciones, actúan como intermediarios.
              </p>
              <p>
                Decidimos construir algo distinto. La función de TUESDI termina en el momento en que el artista recibe una solicitud. A partir de ahí, el artista decide si responder, negocia directamente y trabaja directamente. Nosotros solo facilitamos ese primer contacto.
              </p>
              <p>
                Hoy, TUESDI conecta artistas de todas las disciplinas con promotores que buscan talento auténtico, sin quedarnos nunca en medio del acuerdo.
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
