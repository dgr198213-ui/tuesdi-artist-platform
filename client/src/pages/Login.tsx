import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Music2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setLocation("/dashboard");
      }
    };
    checkAuth();
  }, [setLocation]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(error.message);
      } else {
        setLocation("/dashboard");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer" onClick={() => setLocation("/")}>
            <img src="/logo-horizontal.png" alt="TUESDI" className="h-12 object-contain" />
          </div>
          <p className="text-muted-foreground">Tu Escenario Digital — Sin Intermediarios</p>
        </div>

        {/* Login Card */}
        <Card className="border border-border bg-card/50 backdrop-blur-sm p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Acceso</h2>
            <p className="text-sm text-muted-foreground">
              Inicia sesión con tu cuenta para continuar
            </p>
          </div>

          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Correo Electrónico
              </label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Contraseña
              </label>
              <Input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2 rounded transition-all"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">o</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <a
                href="/registro"
                className="text-primary hover:underline font-semibold"
              >
                Regístrate aquí
              </a>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Al continuar, aceptas nuestros{" "}
            <a href="#" className="hover:underline">
              Términos de Servicio
            </a>{" "}
            y{" "}
            <a href="#" className="hover:underline">
              Política de Privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
