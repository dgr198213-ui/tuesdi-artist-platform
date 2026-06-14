/**
 * TUESDI - Tu Escenario Digital v3.0
 * Enlace Enviado
 *
 * Diseño: Stitch "Digital Stage" (enlace_enviado_tuesdi)
 * Pantalla de confirmación tras enviar el Magic Link de acceso.
 */

import { useLocation, useSearch } from "wouter";

export default function EnlaceEnviado() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const email = new URLSearchParams(search).get("email");

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 spotlight"></div>
      </div>

      {/* Header minimal */}
      <header className="relative z-10 w-full px-margin py-base flex justify-center md:justify-start">
        <button
          className="font-headline-md text-headline-md font-bold text-primary tracking-tighter"
          onClick={() => setLocation("/")}
        >
          TUESDI
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-margin">
        <div className="w-full max-w-xl text-center space-y-lg">
          {/* Animated Icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative glass-card w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center border border-white/20 bloom-primary mx-auto overflow-hidden">
              <span
                className="material-symbols-outlined text-[64px] md:text-[80px] text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mail
              </span>
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-md">
            <h1 className="font-headline-xl text-headline-lg-mobile md:text-headline-xl text-on-surface tracking-tight">
              ¡Enlace enviado!
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Hemos enviado un enlace de acceso a{" "}
              {email ? <span className="text-secondary">{email}</span> : "tu bandeja de entrada"}.
              Revisa tu correo <span className="text-secondary">(y la carpeta de spam si es necesario)</span> para entrar a tu dashboard.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col items-center gap-md">
            <button
              className="neon-border rounded-full px-lg py-sm font-label-sm text-label-sm uppercase tracking-widest text-secondary hover:text-white transition-all"
              onClick={() => setLocation("/acceso")}
            >
              Volver a intentar
            </button>
            <div className="pt-md">
              <p className="font-label-sm text-label-sm text-primary opacity-80 flex items-center gap-base">
                <span className="material-symbols-outlined text-[16px] animate-pulse">radio_button_checked</span>
                TU ESCENARIO TE ESPERA.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-xl border-t border-white/5 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin gap-md max-w-7xl mx-auto">
          <span className="font-headline-md text-headline-md text-on-surface opacity-50"><img src="/isotipo.png" alt="" className="h-7 w-7 object-contain inline-block mr-1" style={{filter:"brightness(1.05)"}} />TUESDI</span>
          <nav className="flex gap-md">
            <button
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setLocation("/politica-privacidad")}
            >
              Privacidad
            </button>
            <button
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setLocation("/terminos-servicio")}
            >
              Términos
            </button>
            <button
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setLocation("/contacto")}
            >
              Contacto
            </button>
          </nav>
          <span className="font-label-sm text-label-sm text-on-surface-variant opacity-60">
            © {new Date().getFullYear()} TUESDI. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
