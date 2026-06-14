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

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Acceso() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("sending");
    setErrorMsg("");

    const redirectTo =
      window.location.hostname === "localhost"
        ? `${window.location.origin}/dashboard`
        : "https://tuesdi-artist-platform.vercel.app/dashboard";

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
      <header className="fixed top-0 w-full z-50 py-base px-margin flex justify-center items-center h-20 bg-transparent">
        <button
          className="font-headline-md text-headline-md font-bold text-secondary tracking-tighter"
          onClick={() => setLocation("/")}
        >
          TUESDI
        </button>
      </header>

      {/* Decoración de fondo */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Contenido principal */}
      <main className="flex-grow flex items-center justify-center relative z-10 px-margin pt-xl pb-xl">
        <div className="w-full max-w-[480px] space-y-lg">
          {/* Branding y título */}
          <div className="text-center space-y-sm">
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
      <footer className="w-full py-xl relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin gap-md max-w-7xl mx-auto">
          <div className="font-headline-md text-headline-md text-on-surface opacity-30 select-none"><img src="/isotipo-nuevo.jpg" alt="" className="h-8 w-8 object-contain inline-block mr-1 rounded-lg" />TUESDI</div>
          <div className="flex gap-lg items-center">
            <button
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors"
              onClick={() => setLocation("/terminos-servicio")}
            >
              Términos
            </button>
            <button
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors"
              onClick={() => setLocation("/politica-privacidad")}
            >
              Privacidad
            </button>
            <button
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-secondary transition-colors"
              onClick={() => setLocation("/contacto")}
            >
              Soporte
            </button>
          </div>
          <div className="font-label-sm text-label-sm text-on-surface-variant/30">
            © {new Date().getFullYear()} TUESDI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
