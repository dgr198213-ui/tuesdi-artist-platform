import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music2, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-[32rem] relative border-white/5 bg-card/50 backdrop-blur-md shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Music2 className="h-10 w-10 text-primary" />
            </div>
          </div>

          <h1 className="text-6xl font-black text-white mb-2 tracking-tighter">404</h1>

          <h2 className="text-2xl font-bold text-white mb-4">
            Escenario no encontrado
          </h2>

          <p className="text-muted-foreground mb-10 leading-relaxed max-w-[24rem] mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida a otro escenario digital.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/")}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20"
            >
              <Home className="w-5 h-5 mr-2" />
              Ir al Inicio
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="border-white/10 hover:bg-white/5 text-white px-8 py-6 rounded-2xl font-bold transition-all"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver Atrás
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
