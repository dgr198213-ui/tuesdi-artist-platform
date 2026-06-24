/**
 * TUESDI - Tu Escenario Digital v3.0
 *
 * Plataforma de visibilidad artística diseñada para que los artistas
 * dispongan de un perfil profesional público donde mostrar su trabajo
 * y recibir solicitudes de contacto de forma privada y segura.
 */

import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

// ---------------------------------------------------------------------------
// Lazy-loaded page components — public routes
// ---------------------------------------------------------------------------
const Home = lazy(() => import("./pages/Home"));
const Escaparate = lazy(() => import("./pages/Escaparate"));
const Acceso = lazy(() => import("./pages/Acceso"));
const EnlaceEnviado = lazy(() => import("./pages/EnlaceEnviado"));
const ExplorarArtistas = lazy(() => import("./pages/ExplorarArtistas"));
const ArtistaProfile = lazy(() => import("./pages/ArtistaProfile"));
const Eventos = lazy(() => import("./pages/Eventos"));
const EventoDetalle = lazy(() => import("./pages/EventoDetalle"));
const PublicarEvento = lazy(() => import("./pages/PublicarEvento"));
const ConfirmarEvento = lazy(() => import("./pages/ConfirmarEvento"));
const ExitoPublicacion = lazy(() => import("./pages/ExitoPublicacion"));
const Precios = lazy(() => import("./pages/Precios"));

// ---------------------------------------------------------------------------
// Lazy-loaded page components — protected routes
// The HOC is applied inside the `.then()` so ProtectedRoute receives a plain
// React.ComponentType rather than a LazyExoticComponent (avoids TS errors).
// ---------------------------------------------------------------------------
const SystemPanel = lazy(() => import("./pages/system/SystemPanel"));

const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({
    default: ProtectedRoute(m.default),
  })),
);
const EditorPerfil = lazy(() =>
  import("./pages/EditorPerfil").then((m) => ({
    default: ProtectedRoute(m.default),
  })),
);
const BandejaContactos = lazy(() =>
  import("./pages/BandejaContactos").then((m) => ({
    default: ProtectedRoute(m.default),
  })),
);
const GestionMedia = lazy(() =>
  import("./pages/GestionMedia").then((m) => ({
    default: ProtectedRoute(m.default),
  })),
);
const Analitica = lazy(() =>
  import("./pages/Analitica").then((m) => ({
    default: ProtectedRoute(m.default),
  })),
);

// ---------------------------------------------------------------------------
// Lazy-loaded page components — legal / info pages
// ---------------------------------------------------------------------------
const TerminosServicio = lazy(() => import("./pages/TerminosServicio"));
const PoliticaPrivacidad = lazy(() => import("./pages/PoliticaPrivacidad"));
const AvisoLegal = lazy(() => import("./pages/AvisoLegal"));
const PoliticaCookies = lazy(() => import("./pages/PoliticaCookies"));
const QuienesSomos = lazy(() => import("./pages/QuienesSomos"));
const Contacto = lazy(() => import("./pages/Contacto"));

// ---------------------------------------------------------------------------
// Suspense fallback
// ---------------------------------------------------------------------------
function RouteLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  );
}

function Router() {
  /**
   * Estructura de rutas según documento maestro TUESDI v3.0
   *
   * Páginas Públicas:
   * - / : Home
   * - /artistas : Directorio general de artistas
   * - /artista/:slug : Perfil individual
   * - /eventos : Directorio de eventos
   * - /planes : Planes de suscripción
   * - /quienes-somos : Quiénes Somos
   * - /contacto : Contacto
   * - /aviso-legal : Aviso Legal
   * - /politica-privacidad : Política de Privacidad
   * - /politica-cookies : Política de Cookies
   * - /terminos-servicio : Términos del Servicio
   *
   * Páginas Privadas (Dashboard):
   * - /dashboard : Dashboard principal
   * - /dashboard/perfil : Gestión de perfil
   * - /dashboard/media : Gestión de multimedia
   * - /dashboard/contactos : Solicitudes de contacto
   * - /dashboard/estadisticas : Métricas
   * - /dashboard/suscripcion : Gestión de suscripción
   */
  return (
    <Suspense fallback={<RouteLoading />}>
      <Switch>
        {/* Páginas Públicas */}
        <Route path="/" component={Home} />
        <Route path="/escaparate" component={Escaparate} />
        <Route path="/artistas" component={ExplorarArtistas} />
        <Route path="/artista/:slug" component={ArtistaProfile} />
        <Route path="/eventos" component={Eventos} />
        <Route path="/eventos/:id" component={EventoDetalle} />
        <Route path="/planes" component={Precios} />
        <Route path="/quienes-somos" component={QuienesSomos} />
        <Route path="/contacto" component={Contacto} />
        <Route path="/aviso-legal" component={AvisoLegal} />
        <Route path="/politica-privacidad" component={PoliticaPrivacidad} />
        <Route path="/politica-cookies" component={PoliticaCookies} />
        <Route path="/terminos-servicio" component={TerminosServicio} />

        {/* Autenticación */}
        <Route path="/acceso" component={Acceso} />
        <Route path="/enlace-enviado" component={EnlaceEnviado} />
        {/* Alias para enlaces antiguos: login/registro -> Acceso (Magic Link) */}
        <Route path="/login" component={Acceso} />
        <Route path="/registro" component={Acceso} />

        {/* Publicación de Eventos (Magic Link) */}
        <Route path="/publicar-evento" component={PublicarEvento} />
        <Route path="/confirmar-evento/:token" component={ConfirmarEvento} />
        <Route path="/exito-publicacion" component={ExitoPublicacion} />

        {/* Dashboard Privado */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/perfil" component={EditorPerfil} />
        <Route path="/dashboard/contactos" component={BandejaContactos} />
        <Route path="/dashboard/media" component={GestionMedia} />
        <Route path="/dashboard/analitica" component={Analitica} />

        {/* 404 */}
        <Route path="/404" component={NotFound} />
        {/* /system — panel admin, acceso verificado dentro del propio componente */}
        <Route path="/system" component={SystemPanel} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

/**
 * TUESDI App
 *
 * Configuración del tema oscuro profesional inspirado en escenarios
 * de espectáculos en vivo con iluminación azul (#0081FF) y cian (#00DBFF)
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;