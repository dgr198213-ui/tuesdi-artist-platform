import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Music2 } from "lucide-react";

export default function Registro() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    isArtist: false,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setLocation("/dashboard");
      }
    };
    checkAuth();
  }, [setLocation]);

  const handleSignup = async () => {
    if (!formData.email || !formData.password) {
      alert("Por favor completa todos los campos");
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            is_artist: formData.isArtist,
          }
        }
      });

      if (error) {
        alert(error.message);
      } else {
        // If user is an artist, we might need to create the artist profile.
        // Usually this is done via a trigger in Supabase, but let's ensure it works.
        if (formData.isArtist && data.user) {
          const { error: artistError } = await supabase
            .from("artists")
            .insert([
              {
                user_id: data.user.id,
                name: formData.email.split('@')[0],
                bio: "Nuevo artista en TUESDI",
                genres: [],
              },
            ]);
          if (artistError) console.error("Error creating artist profile:", artistError);
        }
        
        alert("Registro exitoso. Revisa tu correo para confirmar tu cuenta.");
        setLocation("/login");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error inesperado durante el registro");
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

        {/* Signup Card */}
        <Card className="border border-border bg-card/50 backdrop-blur-sm p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Registro</h2>
            <p className="text-sm text-muted-foreground">
              Crea tu cuenta para comenzar
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
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Artist Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isArtist"
                checked={formData.isArtist}
                onChange={(e) =>
                  setFormData({ ...formData, isArtist: e.target.checked })
                }
                className="w-4 h-4 rounded border-border cursor-pointer"
              />
              <label htmlFor="isArtist" className="text-sm text-foreground cursor-pointer">
                Soy un artista
              </label>
            </div>

            {/* Signup Button */}
            <Button
              onClick={handleSignup}
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2 rounded transition-all"
            >
              {isLoading ? "Registrando..." : "Registrarse"}
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

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <a
                href="/login"
                className="text-primary hover:underline font-semibold"
              >
                Inicia sesión
              </a>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>
            Al registrarte, aceptas nuestros{" "}
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
