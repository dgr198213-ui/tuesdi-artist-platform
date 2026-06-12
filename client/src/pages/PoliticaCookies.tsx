import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function PoliticaCookies() {
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
          <h1 className="text-3xl font-bold text-foreground">Política de Cookies</h1>
          <p className="text-muted-foreground mt-2">Última actualización: Junio 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-bold mb-4">1. ¿Qué son las Cookies?</h2>
            <p className="text-muted-foreground leading-relaxed">
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas TUESDI. Se utilizan para recordar preferencias, mejorar la experiencia del usuario y analizar el uso de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Tipos de Cookies que Utilizamos</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Cookies Técnicas (Necesarias)</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Estas cookies son esenciales para el funcionamiento de TUESDI. Se utilizan para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                  <li>Mantener tu sesión de usuario</li>
                  <li>Recordar tus preferencias de idioma</li>
                  <li>Proteger contra ataques de seguridad</li>
                  <li>Permitir la navegación básica</li>
                </ul>
                <p className="text-muted-foreground mt-3 text-sm">
                  <strong className="text-foreground">Consentimiento:</strong> No requieren consentimiento previo. Son obligatorias para usar la plataforma.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Cookies Analíticas</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Estas cookies nos ayudan a entender cómo utilizas TUESDI. Se utilizan para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                  <li>Contar visitas y usuarios</li>
                  <li>Analizar qué páginas son más populares</li>
                  <li>Detectar errores y problemas</li>
                  <li>Mejorar la experiencia del usuario</li>
                </ul>
                <p className="text-muted-foreground mt-3 text-sm">
                  <strong className="text-foreground">Consentimiento:</strong> Requieren tu consentimiento explícito.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Cookies de Terceros</h3>
                <p className="text-muted-foreground leading-relaxed">
                  TUESDI puede utilizar servicios de terceros que establecen sus propias cookies:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
                  <li><strong className="text-foreground">Google Analytics:</strong> Para análisis de tráfico</li>
                  <li><strong className="text-foreground">Stripe:</strong> Para procesar pagos</li>
                  <li><strong className="text-foreground">Supabase:</strong> Para autenticación y almacenamiento</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Duración de las Cookies</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Cookies de Sesión:</strong> Se eliminan cuando cierras el navegador.
              </p>
              <p>
                <strong className="text-foreground">Cookies Persistentes:</strong> Se almacenan durante un período determinado (generalmente 1 año) o hasta que las elimines manualmente.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Gestión de Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Puedes gestionar tus preferencias de cookies de varias formas:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Mediante el banner de consentimiento en la primera visita</li>
              <li>A través de la configuración de tu navegador</li>
              <li>Utilizando herramientas de privacidad de terceros</li>
            </ul>
            <p className="text-muted-foreground mt-4 text-sm">
              <strong className="text-foreground">Nota:</strong> Si desactivas las cookies técnicas, es posible que TUESDI no funcione correctamente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Cómo Desactivar Cookies en tu Navegador</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
              </p>
              <p>
                <strong className="text-foreground">Firefox:</strong> Opciones → Privacidad → Cookies
              </p>
              <p>
                <strong className="text-foreground">Safari:</strong> Preferencias → Privacidad → Cookies
              </p>
              <p>
                <strong className="text-foreground">Edge:</strong> Configuración → Privacidad → Cookies
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Datos Recabados por Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              Las cookies pueden recopilar:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-3">
              <li>Tu dirección IP</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Páginas visitadas</li>
              <li>Tiempo de permanencia en la plataforma</li>
              <li>Búsquedas realizadas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Cambios en la Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              TUESDI puede modificar esta Política de Cookies en cualquier momento. Los cambios entrarán en vigor inmediatamente tras su publicación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para consultas sobre cookies, contacta con: <strong className="text-foreground">privacy@tuesdi.com</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
