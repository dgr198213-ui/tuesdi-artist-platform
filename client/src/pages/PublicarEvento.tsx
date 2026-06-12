import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useLocation } from "wouter";
import { Calendar, MapPin, DollarSign, CheckCircle2, Image as ImageIcon, ArrowLeft } from "lucide-react";

export default function PublicarEvento() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    city: "",
    country: "",
    price: "",
    contactEmail: "",
    contactPhone: "",
    promoterName: "",
  });

  const steps = [
    { number: 1, title: "Información Básica" },
    { number: 2, title: "Ubicación" },
    { number: 3, title: "Contacto" },
    { number: 4, title: "Imagen" },
    { number: 5, title: "Revisión" },
  ];

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert("Debes estar autenticado");
        return;
      }

      // Get artist ID
      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (artistError || !artistData) {
        console.error("Artist profile not found:", artistError);
        alert("No se encontró tu perfil de artista. Asegúrate de haber completado tu registro como artista.");
        return;
      }

      // Insert event using the columns mentioned in the user's pasted_content.txt
      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            event_date: formData.date,
            event_time: formData.time,
            venue: formData.venue,
            city: formData.city,
            country: formData.country,
            price: parseFloat(formData.price) || 0,
            promoter_email: formData.contactEmail,
            promoter_phone: formData.contactPhone,
            promoter_name: formData.promoterName || session.user.email,
            artist_id: artistData.id,
            status: "published",
          },
        ])
        .select();

      if (error) {
        console.error("Error creating event:", error);
        alert(`Error al crear el evento: ${error.message}`);
      } else {
        const newEventId = data && data[0] ? data[0].id : "";
        setLocation(`/exito-publicacion${newEventId ? `?id=${newEventId}` : ""}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error inesperado al crear el evento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo-horizontal.png" alt="TUESDI" className="h-10 md:h-12 object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Panel
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex justify-between mb-12">
          {steps.map((s) => (
            <div key={s.number} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2 ${
                  step >= s.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s.number ? <CheckCircle2 className="w-5 h-5" /> : s.number}
              </div>
              <p className="text-xs text-center text-muted-foreground">{s.title}</p>
              {s.number < 5 && (
                <div
                  className={`h-1 flex-1 mx-2 mt-2 ${
                    step > s.number ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Steps */}
        <Card className="bg-card/50 border-border p-8 mb-8">
          {/* Step 1: Información Básica */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Información Básica del Evento</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Título del Evento
                </label>
                <Input
                  placeholder="Ej: Concierto de Luna Martínez"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Descripción
                </label>
                <Textarea
                  placeholder="Describe el evento..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-input border-border min-h-32"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fecha
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Hora
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ubicación */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Ubicación del Evento</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Lugar/Venue
                </label>
                <Input
                  placeholder="Ej: Teatro Principal"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ciudad
                  </label>
                  <Input
                    placeholder="Madrid"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    País
                  </label>
                  <Input
                    placeholder="España"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="bg-input border-border"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contacto */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Información de Contacto</h2>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nombre del Promotor/Organizador
                </label>
                <Input
                  placeholder="Tu nombre o empresa"
                  value={formData.promoterName}
                  onChange={(e) =>
                    setFormData({ ...formData, promoterName: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Correo Electrónico de Contacto
                </label>
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Teléfono de Contacto
                </label>
                <Input
                  placeholder="+34 600 000 000"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Precio de Entrada (€)
                </label>
                <Input
                  type="number"
                  placeholder="25"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  className="bg-input border-border"
                />
              </div>
            </div>
          )}

          {/* Step 4: Imagen */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Imagen del Evento</h2>
              <div className="border-2 border-dashed border-border rounded-3xl p-12 text-center bg-background/50">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-10 h-10 text-primary" />
                </div>
                <p className="text-lg font-medium text-white mb-2">Selecciona una imagen para tu evento</p>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Se recomienda una imagen de alta calidad que muestre el escenario o el artista.</p>
                <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary rounded-2xl px-8 h-12 font-bold">
                  Elegir Archivo
                </Button>
                <p className="mt-6 text-xs text-muted-foreground">Formato sugerido: JPG o PNG (máx. 5MB)</p>
              </div>
            </div>
          )}

          {/* Step 5: Revisión */}
          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Revisión del Evento</h2>
              <div className="space-y-4">
                <div className="p-4 bg-muted/20 rounded border border-border">
                  <p className="text-sm text-muted-foreground">Título</p>
                  <p className="font-semibold text-foreground">{formData.title}</p>
                </div>
                <div className="p-4 bg-muted/20 rounded border border-border">
                  <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                  <p className="font-semibold text-foreground">{formData.date} • {formData.time}</p>
                </div>
                <div className="p-4 bg-muted/20 rounded border border-border">
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-semibold text-foreground">{formData.venue}, {formData.city}</p>
                </div>
                <div className="p-4 bg-muted/20 rounded border border-border">
                  <p className="text-sm text-muted-foreground">Contacto</p>
                  <p className="font-semibold text-foreground">{formData.contactEmail} • {formData.contactPhone}</p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={step === 1}
            className="border-border hover:bg-muted disabled:opacity-50"
          >
            Anterior
          </Button>
          {step < 5 ? (
            <Button
              onClick={handleNext}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Publicando..." : "Publicar Evento"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
