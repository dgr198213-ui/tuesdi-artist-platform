/**
 * TUESDI - Tu Escenario Digital v3.0
 * Acceso (Magic Link)
 */

import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Acceso() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Redirección segura si ya está autenticado
  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("sending");
    setErrorMsg("");

    // Mejor práctica: respeta entorno (prod, preview, local)
    const redirectTo = `${window.location.origin}/dashboard`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(
        error.message === "Email rate limit exceeded"
          ? "Has solicitado demasiados enlaces. Espera unos minutos e inténtalo de nuevo."
          : "No se pudo enviar el enlace. Comprueba el email e inténtalo de nuevo."
      );
      return;
    }

    setLocation(
      `/enlace-enviado?email=${encodeURIComponent(email)}`
    );
  };

  // Mientras verifica la sesión, mostrar spinner
  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar el formulario (la redirección ya está en curso)
  if (isAuthenticated) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="text-on-surface antialiased flex flex-col min-h-screen bg-background">
      <PageNav />

      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="flex-grow flex items-center justify-center relative z-10 px-margin pt-xl pb-xl">
        <div className="w-full max-w-[480px] space-y-lg">

          <div className="text-center space-y-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Accede a tu Escenario
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[340px] mx-auto opacity-80">
              Introduce tu email para recibir un enlace de acceso.
            </p>
          </div>

          <div className="glass-card rounded-xl p-lg space-y-md bloom-primary">
            <form className="space-y-md" onSubmit={handleSubmit}>

              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                Email
              </label>

              <input
                className="w-full py-md px-sm rounded-lg border border-outline-variant bg-surface-container-lowest"
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "sending"}
                required
              />

              {status === "error" && (
                <p className="text-error text-sm">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-md bg-secondary-container hover:bg-secondary text-on-secondary-container rounded-lg"
              >
                {status === "sending"
                  ? "Enviando..."
                  : "Enviar enlace mágico"}
              </button>
            </form>
          </div>

        </div>
      </main>

      <PageFooter />
    </div>
  );
}
