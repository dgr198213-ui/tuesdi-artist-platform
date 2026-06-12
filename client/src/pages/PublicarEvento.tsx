import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useLocation } from "wouter";
import { Calendar, MapPin, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PublicarEvento() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    city: "",
    country: "",
    price: "",
    promoterEmail: "",
    promoterPhone: "",
    promoterName: "",
  });

  const steps = [
    { number: 1, title: "Información Básica" },
    { number: 2, title: "Ubicación" },
    { number: 3, title: "Contacto" },
    { number: 4, title: "Revisión" },
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Validar campos requeridos
      if (!formData.title || !formData.date || !formData.venue || !formData.city || !formData.promoterEmail) {
        setError("Por favor completa todos los campos requeridos");
        setIsSubmitting(false);
        return;
      }

      // Crear evento con estado "pending"
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .insert([{
          title: formData.title,
          description: formData.description,
          event_date: formData.date,
          event_time: formData.time,
          venue: formData.venue,
          city: formData.city,
          country: formData.country,
          price: formData.price || null,
          promoter_email: formData.promoterEmail,
          promoter_phone: formData.promoterPhone || null,
          promoter_name: formData.promoterName || null,
          status: "pending",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();

      if (eventError || !eventData) {
        console.error("Error creating event:", eventError);
        setError("Error al crear el evento. Intenta de nuevo.");
        setIsSubmitting(false);
        return;
      }

      // ✅ FIX #1: el Magic Link se genera en el servidor (Edge Function),
      // nunca en el cliente. La función genera un HMAC-SHA256 con un secreto
      // de servidor y envía el email directamente desde el backend.
      const { error: fnError } = await supabase.functions.invoke("create-magic-link", {
        body: {
          eventId: eventData.id,
          email: formData.promoterEmail,
          promoterName: formData.promoterName || "Promotor",
        },
      });

      if (fnError) {
        console.error("Error invoking magic link function:", fnError);
        // No bloqueamos: el evento existe, el promotor puede contactar soporte
        // En producción podrías mostrar un aviso, pero no revertir el evento
      }

      setLocation(`/exito-publicacion?id=${eventData.id}`);
    } catch (error) {
      console.error("Error:", error);
      setError("Error inesperado. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 text-center">
        <h1 className="text-xl font-bold">Publicar Evento</h1>
        <p className="text-sm text-muted-foreground">Gratis, sin registro, sin comisiones</p>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          {steps.map((s) => (
            <div key={s.number} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors ${
                step >= s.number
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {step > s.number ? <CheckCircle2 className="w-4 h-4" /> : s.number}
              </div>
              <span className="text-xs hidden sm:block">{s.title}</span>
              {s.number < 4 && (
                <div className={`h-px flex-1 transition-colors ${step > s.number ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form Steps */}
        <Card className="p-6 space-y-4">
          {/* Step 1: Información Básica */}
          {step === 1 && (
            <>
              <h2 className="font-semibold">Información Básica del Evento</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium">Título del Evento *</label>
                <Input
                  placeholder="Ej: Concierto de Jazz en el Café Central"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  placeholder="Describe el evento, artistas invitados, ambiente..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-28 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha *</label>
                  <Input
                    type="date"
                    value={formData.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hora</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 2: Ubicación */}
          {step === 2 && (
            <>
              <h2 className="font-semibold">Ubicación del Evento</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lugar / Venue *</label>
                <Input
                  placeholder="Ej: Sala Razzmatazz"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ciudad *</label>
                  <Input
                    placeholder="Ej: Barcelona"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">País</label>
                  <Input
                    placeholder="España"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Precio de Entrada</label>
                <Input
                  placeholder="Ej: 15€ o Entrada libre"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Step 3: Contacto */}
          {step === 3 && (
            <>
              <h2 className="font-semibold">Información de Contacto</h2>

              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Recibirás un Magic Link para confirmar tu evento. No necesitas crear una cuenta.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Promotor</label>
                <Input
                  placeholder="Tu nombre o nombre de la organización"
                  value={formData.promoterName}
                  onChange={(e) => setFormData({ ...formData, promoterName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Correo Electrónico *</label>
                <Input
                  type="email"
                  placeholder="promotor@email.com"
                  value={formData.promoterEmail}
                  onChange={(e) => setFormData({ ...formData, promoterEmail: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Aquí recibirás el Magic Link para confirmar tu evento</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={formData.promoterPhone}
                  onChange={(e) => setFormData({ ...formData, promoterPhone: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Step 4: Revisión */}
          {step === 4 && (
            <>
              <h2 className="font-semibold">Revisión del Evento</h2>

              <div className="space-y-3 text-sm">
                <div className="p-3 bg-muted rounded-md">
                  <p className="font-medium text-base">{formData.title}</p>
                  {formData.description && <p className="text-muted-foreground mt-1">{formData.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Fecha</p>
                      <p className="text-muted-foreground">{formData.date}{formData.time && ` · ${formData.time}`}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Ubicación</p>
                      <p className="text-muted-foreground">{formData.venue}, {formData.city}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-md">
                  <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-primary">Confirmación por Magic Link</p>
                    <p className="text-muted-foreground">
                      Recibirás un enlace seguro en <strong>{formData.promoterEmail}</strong> para publicar tu evento.
                      El enlace caduca en 30 minutos.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrev} disabled={step === 1}>
            Anterior
          </Button>
          {step < 4 ? (
            <Button onClick={handleNext}>Siguiente</Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Magic Link"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
