/**
 * TUESDI - Tu Escenario Digital v3.0
 * Enlace Enviado
 *
 * Diseño: Stitch "Digital Stage" (enlace_enviado_tuesdi)
 * Pantalla de confirmación tras enviar el Magic Link de acceso.
 */

import { useLocation, useSearch } from "wouter";
import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";

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
      <PageNav />

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex items-center justify-center px-margin">
        <div className="w-full max-w-[36rem] text-center space-y-lg">
          {/* Animated Icon */}
          <div className="relative inline-block">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-primary text-[48px]">
                mail_outline
              </span>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface mb-md">
              Enlace enviado
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Hemos enviado un enlace de acceso a:
            </p>
            <p className="font-headline-md text-headline-md text-primary mt-sm">{email}</p>
          </div>

          {/* Instructions */}
          <div className="bg-surface-container-lowest rounded-xl p-lg space-y-sm text-left">
            <p className="font-body-md text-body-md text-on-surface-variant">
              <strong className="text-on-surface">Próximos pasos:</strong>
            </p>
            <ol className="space-y-sm font-body-md text-body-md text-on-surface-variant list-decimal list-inside">
              <li>Abre tu correo electrónico</li>
              <li>Busca el email de TUESDI</li>
              <li>Haz clic en el enlace de acceso</li>
              <li>¡Listo! Entrarás directamente a tu panel de artista</li>
            </ol>
          </div>

          {/* Expiry Note */}
          <div className="text-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
              ⏱️ El enlace caduca en 30 minutos
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => setLocation("/")}
            className="w-full py-md rounded-xl bg-primary text-on-primary font-headline-md text-headline-md hover:opacity-90 transition-all"
          >
            Volver al inicio
          </button>
        </div>
      </main>

      {/* Footer */}
      <PageFooter />
    </div>
  );
}
