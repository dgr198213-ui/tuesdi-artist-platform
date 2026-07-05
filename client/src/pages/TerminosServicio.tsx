import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function TerminosServicio() {
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
          <h1 className="text-3xl font-bold text-foreground">Términos de Servicio</h1>
          <p className="text-muted-foreground mt-2">Última actualización: Junio 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. Aceptación de Términos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Al acceder y utilizar TUESDI, aceptas estos Términos de Servicio en su totalidad. Si no estás de acuerdo con alguna parte, no debes usar la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Descripción del Servicio</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI es una plataforma digital que conecta artistas con eventos publicados por promotores. La plataforma no actúa como intermediario en transacciones entre usuarios ni gestiona pagos entre artistas y promotores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Roles y Responsabilidades</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Artistas:</strong> Pueden crear un perfil, publicar su información y recibir consultas de promotores. Solo los artistas tienen acceso al panel de control.
              </p>
              <p>
                <strong className="text-foreground">Promotores:</strong> Pueden publicar eventos de forma gratuita sin necesidad de crear una cuenta. Los promotores reciben un Magic Link para confirmar sus eventos.
              </p>
              <p>
                <strong className="text-foreground">TUESDI:</strong> No es responsable de acuerdos, contrataciones o transacciones entre usuarios. No gestiona pagos ni comisiones.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. No Intermediación</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI no actúa como intermediario. No existe:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Comisiones sobre ingresos de artistas</li>
              <li>Gestión de pagos entre usuarios</li>
              <li>Garantía de contratación</li>
              <li>Responsabilidad sobre acuerdos entre usuarios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Caducidad de Eventos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los eventos se eliminan automáticamente después de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>90 días desde su publicación</li>
              <li>7 días después de la fecha del evento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Suscripciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Las suscripciones de artistas se gestionan exclusivamente a través de Stripe. TUESDI no almacena datos de tarjetas de crédito. Stripe gestiona renovaciones, cancelaciones y facturación.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Los planes tienen una validez de un mes desde su activación y se renuevan mensualmente. Cada plan determina el número máximo de fotografías y vídeos que puede contener el perfil del artista.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              <strong className="text-foreground">Ajuste de contenido al cambiar de plan:</strong> si un plan pasa a otro con límites inferiores (por cambio voluntario, cancelación o impago), el contenido que exceda los límites del nuevo plan será <strong className="text-foreground">eliminado automáticamente</strong>, comenzando por los elementos más antiguos y conservando siempre los más recientes. Esta eliminación es definitiva. Recomendamos al artista conservar copias propias de su material y revisar su galería antes de cambiar de plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Contenido del Usuario</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI se reserva el derecho de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Eliminar contenido que viole estos términos</li>
              <li>Suspender cuentas de usuarios que incumplan las normas</li>
              <li>Moderar perfiles y eventos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Magic Link</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los promotores reciben un Magic Link por email para confirmar sus eventos. El Magic Link expira en 30 minutos. Si no se confirma, el evento se descarta automáticamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI no es responsable de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Acuerdos incumplidos entre usuarios</li>
              <li>Disputas comerciales</li>
              <li>Daños derivados del uso de la plataforma</li>
              <li>Pérdida de datos (aunque implementamos medidas de seguridad)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Legislación Aplicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estos Términos se rigen por la legislación de España y la Unión Europea. Cualquier disputa se resolverá en los juzgados competentes de España.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">11. Cambios en los Términos</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios entrarán en vigor inmediatamente tras su publicación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">12. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para consultas sobre estos Términos, contacta con: <strong className="text-foreground">legal@tuesdi.com</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
