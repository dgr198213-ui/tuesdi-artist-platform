/**
 * TUESDI - Tu Escenario Digital v3.0
 * Acceso (Magic Link)
 *
 * Diseño: Stitch "Digital Stage" (acceso_magic_link_tuesdi)
 *
 * Autenticación oficial: Magic Link (sin contraseñas).
 * - supabase.auth.signInWithOtp({ email }) envía el enlace
 * - Si el email no existe, Supabase crea la cuenta automáticamente
 *   (shouldCreateUser: true, comportamiento por defecto)
 * - Tras hacer clic en el enlace, el usuario vuelve a /dashboard
 *   con sesión activa
 */

import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Acceso() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");

  // Redirigir automáticamente si ya está autenticado
  if (!loading && isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("sending");
    setErrorMsg("");

    // Hardcoded a producción (no window.location.origin): Supabase rechaza
    // URLs de preview de Vercel que no estén en la whitelist, y esas URLs
    // cambian en cada deploy. Ver decisión registrada en state.md.
    const redirectTo = "https://tuesdi-artist-platform.vercel.app/dashboard";

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

    setLocation(`/enlace-enviado?email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="text-on-surface antialiased flex flex-col min-h-screen bg-background">
      {/* Header minimal (pantalla transaccional, sin nav completa) */}
      <PageNav />

      {/* Decoración de fondo */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Contenido principal */}
      <main className="flex-grow flex items-center justify-center relative z-10 px-margin pt-xl pb-xl">
        <div className="w-full max-w-[480px] space-y-lg">
          {/* Branding y título */}
          <div className="text-center space-y-sm">
            <img src="/logo-tuesdi-full.png" alt="TUESDI" className="h-16 w-auto object-contain mx-auto mb-xl" />
            <div className="inline-flex items-center gap-xs px-sm py-xs bg-surface-container-highest/30 rounded-full border border-white/10 mb-md">
              <span className="w-2 h-2 rounded-full bg-secondary pulse-live"></span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                Acceso Seguro
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Accede a tu Escenario
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-[340px] mx-auto opacity-80">
              Introduce tu email para recibir un enlace de acceso mágico. Sin contraseñas, simple y seguro.
            </p>
          </div>

          {/* Formulario */}
          <div className="glass-card rounded-xl p-lg space-y-md bloom-primary">
            <form className="space-y-md" onSubmit={handleSubmit}>
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase ml-1" htmlFor="email">
                  Email Profesional
                </label>
                <div className="relative flex items-center transition-all duration-300 rounded-lg border border-outline-variant bg-surface-container-lowest overflow-hidden focus-within:border-secondary">
                  <span className="material-symbols-outlined ml-md text-on-surface-variant/50">mail</span>
                  <input
                    className="w-full bg-transparent border-none py-md px-sm focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/30 font-body-md text-body-md"
                    id="email"
                    name="email"
                    placeholder="tu@email.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "sending"}
                  />
                </div>
              </div>

              {status === "error" && (
                <p className="font-label-sm text-label-sm text-error">{errorMsg}</p>
              )}

              <button
                className="w-full py-md bg-secondary-container hover:bg-secondary text-on-secondary-container font-headline-md text-body-lg rounded-lg transition-all duration-300 active:scale-[0.98] shadow-lg shadow-secondary-container/20 group flex items-center justify-center gap-sm disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
                disabled={status === "sending"}
              >
                <span>{status === "sending" ? "Enviando..." : "Enviar Enlace Mágico"}</span>
                <span className={`material-symbols-outlined group-hover:translate-x-1 transition-transform ${status === "sending" ? "animate-spin" : ""}`}>
                  {status === "sending" ? "sync" : "magic_button"}
                </span>
              </button>
            </form>

            {/* Aviso de edad */}
            <div className="pt-base border-t border-white/5 flex items-start gap-sm">
              <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                info
              </span>
              <p className="font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
                Uso exclusivo para mayores de 18 años. Al continuar, aceptas el procesamiento de tus datos para el inicio de sesión.
              </p>
            </div>
          </div>

          {/* Texto alternativo */}
          <div className="text-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant/40">
              ¿Eres nuevo? Tu cuenta se creará automáticamente tras el primer acceso.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PageFooter />
    </div>
  );
}
