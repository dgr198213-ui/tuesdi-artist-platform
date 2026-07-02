import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "¿TUESDI cobra comisión?",
    a: "No. TUESDI no cobra comisión sobre ningún acuerdo, actuación o evento. Los planes de pago dan más visibilidad y capacidad de galería, nunca un porcentaje de tu trabajo."
  },
  {
    q: "¿TUESDI participa en la contratación?",
    a: "No. TUESDI facilita el primer contacto entre artista y organizador. A partir de ahí, la negociación, el acuerdo y el trabajo ocurren siempre directamente entre vosotros."
  },
  {
    q: "¿Quién decide responder a una propuesta?",
    a: "Siempre el artista. Tú eliges qué solicitudes contestar y cuáles ignorar, sin ninguna obligación."
  },
  {
    q: "¿Mi correo o teléfono son públicos?",
    a: "Nunca. Tus datos de contacto no se muestran en tu perfil público. Solo tú decides si los compartes al responder una propuesta."
  },
  {
    q: "¿Hay chat dentro de TUESDI?",
    a: "No. TUESDI no aloja conversaciones. Recibes la propuesta inicial en tu bandeja privada, y si decides responder, la conversación continúa directamente por vuestros propios canales."
  },
  {
    q: "¿TUESDI organiza eventos?",
    a: "No. TUESDI ofrece un directorio público de eventos y otro de artistas. Son dos escaparates independientes, no un sistema de contratación ni de venta de entradas."
  },
];

export default function FAQ() {
  const [, setLocation] = useLocation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            ← Volver
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Preguntas Frecuentes</h1>
          <p className="text-muted-foreground mt-2">Todo lo que necesitas saber sobre cómo funciona TUESDI.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <Card key={i} className="bg-card/50 border-border overflow-hidden">
              <button
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-bold text-foreground">{item.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-primary/10 border border-primary/30 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">¿Sigues con dudas?</h3>
          <p className="text-muted-foreground mb-6">Escríbenos y te respondemos personalmente.</p>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setLocation("/contacto")}
          >
            Contactar con Nosotros
          </Button>
        </div>
      </div>
    </div>
  );
}
