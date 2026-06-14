/**
 * TUESDI - Tu Escenario Digital v3.0
 *
 * Plataforma de visibilidad artística diseñada para que los artistas
 * dispongan de un perfil profesional público donde mostrar su trabajo
 * y recibir solicitudes de contacto de forma privada y segura.
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Acceso from "./pages/Acceso";
import EnlaceEnviado from "./pages/EnlaceEnviado";
import Dashboard from "./pages/Dashboard";
import EditorPerfil from "./pages/EditorPerfil";
import BandejaContactos from "./pages/BandejaContactos";
import GestionMedia from "./pages/GestionMedia";
import Analitica from "./pages/Analitica";
import ExplorarArtistas from "./pages/ExplorarArtistas";
import Eventos from "./pages/Eventos";
import EventoDetalle from "./pages/EventoDetalle";
import ArtistaProfile from "./pages/ArtistaProfile";
import PublicarEvento from "./pages/PublicarEvento";
import ConfirmarEvento from "./pages/ConfirmarEvento";
import Precios from "./pages/Precios";
import ExitoPublicacion from "./pages/ExitoPublicacion";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas Legales
import TerminosServicio from "./pages/TerminosServicio";
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad";
import AvisoLegal from "./pages/AvisoLegal";
import PoliticaCookies from "./pages/PoliticaCookies";
import QuienesSomos from "./pages/QuienesSomos";
import Contacto from "./pages/Contacto";

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
    <Switch>
      {/* Páginas Públicas */}
      <Route path={"/"} component={Home} />
      <Route path={"/artistas"} component={ExplorarArtistas} />
      <Route path={"/artista/:slug"} component={ArtistaProfile} />
      <Route path={"/eventos"} component={Eventos} />
      <Route path={"/eventos/:id"} component={EventoDetalle} />
      <Route path={"/planes"} component={Precios} />
      <Route path={"/quienes-somos"} component={QuienesSomos} />
      <Route path={"/contacto"} component={Contacto} />
      <Route path={"/aviso-legal"} component={AvisoLegal} />
      <Route path={"/politica-privacidad"} component={PoliticaPrivacidad} />
      <Route path={"/politica-cookies"} component={PoliticaCookies} />
      <Route path={"/terminos-servicio"} component={TerminosServicio} />

      {/* Autenticación */}
      <Route path={"/acceso"} component={Acceso} />
      <Route path={"/enlace-enviado"} component={EnlaceEnviado} />
      {/* Alias para enlaces antiguos: login/registro -> Acceso (Magic Link) */}
      <Route path={"/login"} component={Acceso} />
      <Route path={"/registro"} component={Acceso} />

      {/* Publicación de Eventos (Magic Link) */}
      <Route path={"/publicar-evento"} component={PublicarEvento} />
      <Route path={"/confirmar-evento/:token"} component={ConfirmarEvento} />
      <Route path={"/exito-publicacion"} component={ExitoPublicacion} />

      {/* Dashboard Privado */}
      <Route path={"/dashboard"} component={ProtectedRoute(Dashboard)} />
      <Route path={"/dashboard/perfil"} component={ProtectedRoute(EditorPerfil)} />
      <Route path={"/dashboard/contactos"} component={ProtectedRoute(BandejaContactos)} />
      <Route path={"/dashboard/media"} component={ProtectedRoute(GestionMedia)} />
      <Route path={"/dashboard/analitica"} component={ProtectedRoute(Analitica)} />

      {/* 404 */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
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
