import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useSeo } from "@/lib/seo";

export default function PoliticaPrivacidad() {
  useSeo({ title: "Política de privacidad", path: "/politica-privacidad" });
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
          <h1 className="text-3xl font-bold text-foreground">Política de Privacidad</h1>
          <p className="text-muted-foreground mt-2">Última actualización: Junio 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Responsable del Tratamiento</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI es el responsable del tratamiento de tus datos personales de conformidad con el Reglamento General de Protección de Datos (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Datos que Recopilamos</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p className="font-bold text-foreground">De Artistas:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email y teléfono</li>
                <li>Nombre artístico y biografía</li>
                <li>Categoría artística y ciudad</li>
                <li>Fotos y vídeos de perfil</li>
                <li>Datos de suscripción</li>
                <li>Métricas de uso (vistas, clicks, mensajes)</li>
              </ul>

              <p className="font-bold text-foreground mt-6">De Promotores:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email para Magic Link</li>
                <li>Teléfono (opcional)</li>
                <li>Nombre del promotor</li>
                <li>Información del evento</li>
              </ul>

              <p className="font-bold text-foreground mt-6">Datos que NO recopilamos:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Chats internos</li>
                <li>Mensajes privados entre usuarios</li>
                <li>Datos de pagos (gestionados por Stripe)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Finalidad del Tratamiento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos tus datos para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Crear y mantener tu perfil</li>
              <li>Publicar y gestionar eventos</li>
              <li>Enviar Magic Links de confirmación</li>
              <li>Mostrar métricas y estadísticas</li>
              <li>Procesar suscripciones (a través de Stripe)</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Base Legal</h2>
            <p className="text-muted-foreground leading-relaxed">
              El tratamiento de tus datos se basa en:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Tu consentimiento explícito</li>
              <li>Ejecución del contrato de suscripción</li>
              <li>Cumplimiento de obligaciones legales</li>
              <li>Intereses legítimos de TUESDI</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI utiliza cookies técnicas necesarias para el funcionamiento de la plataforma. También utilizamos cookies analíticas (opcional) para mejorar la experiencia del usuario. Puedes gestionar tus preferencias de cookies en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Compartición de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tus datos se comparten con:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li><strong className="text-foreground">Stripe:</strong> Para procesar suscripciones</li>
              <li><strong className="text-foreground">Supabase:</strong> Para almacenar datos</li>
              <li><strong className="text-foreground">Proveedores de email:</strong> Para enviar Magic Links</li>
              <li><strong className="text-foreground">Autoridades:</strong> Si es requerido por ley</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              No vendemos ni compartimos tus datos con terceros para marketing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Derechos del Usuario</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tienes derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Acceder a tus datos personales</li>
              <li>Rectificar datos inexactos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Limitar el tratamiento</li>
              <li>Portabilidad de datos</li>
              <li>Oponerme al tratamiento</li>
              <li>Retirar el consentimiento</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Para ejercer estos derechos, contacta con: <strong className="text-foreground">privacy@tuesdi.com</strong>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Retención de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conservamos tus datos mientras tu cuenta esté activa. Tras la cancelación, eliminamos tus datos en un plazo de 30 días, excepto cuando la ley requiera su conservación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Seguridad</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI implementa medidas de seguridad técnicas y organizativas para proteger tus datos contra acceso no autorizado, alteración o destrucción. Sin embargo, ningún sistema es completamente seguro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Cambios en la Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI puede modificar esta Política de Privacidad en cualquier momento. Los cambios entrarán en vigor inmediatamente tras su publicación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para consultas sobre privacidad, contacta con: <strong className="text-foreground">privacy@tuesdi.com</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
