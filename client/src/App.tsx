import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import ExplorarArtistas from "./pages/ExplorarArtistas";
import Eventos from "./pages/Eventos";
import EventoDetalle from "./pages/EventoDetalle";
import ArtistaProfile from "./pages/ArtistaProfile";
import PublicarEvento from "./pages/PublicarEvento";
import Precios from "./pages/Precios";
import ExitoPublicacion from "./pages/ExitoPublicacion";
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
            <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/registro"} component={Registro} />
      <Route path={"/dashboard"} component={ProtectedRoute(Dashboard)} />
      <Route path={"/explorar-artistas"} component={ExplorarArtistas} />
      <Route path={"/eventos"} component={Eventos} />
      <Route path={"/eventos/:id"} component={EventoDetalle} />
      <Route path={"/artista/:id"} component={ArtistaProfile} />
      <Route path={"/publicar-evento"} component={ProtectedRoute(PublicarEvento)} />
      <Route path={"/precios"} component={Precios} />
      <Route path={"/exito-publicacion"} component={ProtectedRoute(ExitoPublicacion)} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
