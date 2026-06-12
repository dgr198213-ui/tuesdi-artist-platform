import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function AvisoLegal() {
  const [, setLocation] = useLocation();

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
          <h1 className="text-3xl font-bold text-foreground">Aviso Legal</h1>
          <p className="text-muted-foreground mt-2">Última actualización: Junio 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Identificación del Responsable</h2>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              <p><strong className="text-foreground">Denominación Social:</strong> TUESDI</p>
              <p><strong className="text-foreground">Domicilio:</strong> España</p>
              <p><strong className="text-foreground">Email de contacto:</strong> info@tuesdi.com</p>
              <p><strong className="text-foreground">Teléfono:</strong> Disponible en la página de contacto</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Propiedad Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos los contenidos de TUESDI, incluyendo textos, gráficos, logos, imágenes, videos y software, están protegidos por derechos de autor y propiedad intelectual. Está prohibida la reproducción, distribución o transmisión sin autorización expresa.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Los usuarios conservan los derechos sobre el contenido que suben (fotos, vídeos, biografía). Al subirlo, otorgan a TUESDI una licencia para mostrar ese contenido en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Exención de Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI proporciona la plataforma "tal cual". No garantiza:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Disponibilidad continua del servicio</li>
              <li>Ausencia de errores o interrupciones</li>
              <li>Exactitud de la información publicada por usuarios</li>
              <li>Cumplimiento de acuerdos entre usuarios</li>
              <li>Seguridad absoluta de los datos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI no será responsable de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Daños directos o indirectos derivados del uso de la plataforma</li>
              <li>Pérdida de datos o ingresos</li>
              <li>Interrupciones del servicio</li>
              <li>Acciones de terceros</li>
              <li>Incumplimiento de acuerdos entre usuarios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Normativa Aplicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Este Aviso Legal se rige por la legislación de España y la Unión Europea, incluyendo:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Ley de Servicios de la Sociedad de la Información (LSSI)</li>
              <li>Reglamento General de Protección de Datos (RGPD)</li>
              <li>Ley Orgánica de Protección de Datos (LOPDGDD)</li>
              <li>Ley de Comercio Electrónico</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Jurisdicción y Competencia</h2>
            <p className="text-muted-foreground leading-relaxed">
              Cualquier disputa derivada de estos términos se resolverá ante los juzgados competentes de España. Los usuarios aceptan la jurisdicción española.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Modificación del Aviso</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI se reserva el derecho de modificar este Aviso Legal en cualquier momento. Los cambios entrarán en vigor inmediatamente tras su publicación en la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para consultas sobre este Aviso Legal, contacta con: <strong className="text-foreground">legal@tuesdi.com</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
