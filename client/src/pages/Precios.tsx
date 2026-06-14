/**
 * TUESDI - Tu Escenario Digital v3.0
 * Planes (/planes)
 *
 * Estrategia de lanzamiento Beta Abierta:
 * - Beta: activo, gratuito, con todo incluido durante el periodo de validación
 * - Standard / Pro: "Próximamente" — sin precio activo ni botón de pago
 */

import { useLocation } from "wouter";

export default function Precios() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Nav */}
      <header className="fixed top-0 w-full z-50 bg-surface/10 backdrop-blur-xl border-b border-white/10 shadow-[0_0_20px_rgba(0,129,255,0.15)]">
        <nav className="flex justify-between items-center px-margin py-base max-w-7xl mx-auto">
          <button className="font-headline-md text-headline-md font-bold text-primary" onClick={() => setLocation("/")}>TUESDI</button>
          <div className="hidden md:flex gap-md items-center">
            <button className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation("/artistas")}>Artistas</button>
            <button className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation("/eventos")}>Eventos</button>
            <button className="font-body-md text-body-md text-primary font-bold border-b-2 border-primary pb-1">Planes</button>
          </div>
          <button
            className="bg-primary text-on-primary font-label-sm text-label-sm px-md py-xs rounded-full bloom-primary hover:opacity-90"
            onClick={() => setLocation("/acceso")}
          >
            Acceso
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative pt-[140px] pb-xl px-margin text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/8 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-xs px-md py-xs rounded-full border border-secondary/30 bg-secondary/10 mb-md">
            <span className="w-2 h-2 rounded-full bg-secondary pulse-live"></span>
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">🚀 Beta Abierta Activa</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-md">
            Empieza gratis.<br />
            <span className="text-primary">Sin límites ahora.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto">
            Durante la Beta Abierta, accedes a todo lo que ofrece TUESDI de forma completamente gratuita. Sin tarjeta. Sin fecha de caducidad.
          </p>
        </div>
      </section>

      {/* Plans Grid */}
      <section className="max-w-6xl mx-auto px-margin pb-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md items-start">

          {/* BETA — ACTIVO */}
          <div className="relative glass-card rounded-2xl overflow-hidden border-primary/40 shadow-[0_0_40px_rgba(0,129,255,0.2)] md:scale-105 md:-translate-y-2 z-10">
            {/* Badge */}
            <div className="bg-primary text-on-primary text-center py-sm font-label-sm text-label-sm font-bold uppercase tracking-widest flex items-center justify-center gap-xs">
              <span className="w-2 h-2 rounded-full bg-on-primary pulse-live"></span>
              Disponible Ahora
            </div>
            <div className="p-lg">
              <div className="mb-lg">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Beta</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Todo lo que necesitas para empezar.</p>
              </div>
              <div className="mb-lg">
                <span className="text-[56px] font-bold text-on-surface leading-none">0€</span>
                <span className="text-on-surface-variant font-body-md"> /mes</span>
                <p className="font-label-sm text-label-sm text-secondary mt-xs uppercase tracking-widest">Gratis durante la Beta</p>
              </div>

              <ul className="space-y-sm mb-xl">
                {[
                  "Perfil artístico público completo",
                  "Galería multimedia (fotos + vídeos)",
                  "Formulario de contacto privado",
                  "Dashboard con analíticas",
                  "Publicación de eventos gratuita",
                  "Visibilidad en el directorio",
                  "Sin comisiones ni intermediarios",
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-sm font-body-md text-body-md">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                className="w-full py-md rounded-xl bg-primary text-on-primary font-headline-md text-headline-md bloom-primary hover:opacity-90 transition-all"
                onClick={() => setLocation("/acceso")}
              >
                Crear Perfil Gratis
              </button>
              <p className="text-center font-label-sm text-label-sm text-on-surface-variant/60 mt-sm">
                Sin tarjeta de crédito
              </p>
            </div>
          </div>

          {/* STANDARD — PRÓXIMAMENTE */}
          <div className="glass-card rounded-2xl overflow-hidden opacity-60">
            <div className="bg-surface-container-high text-on-surface-variant text-center py-sm font-label-sm text-label-sm font-bold uppercase tracking-widest">
              Próximamente
            </div>
            <div className="p-lg">
              <div className="mb-lg">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Standard</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Para artistas que quieren destacar.</p>
              </div>
              <div className="mb-lg">
                <span className="text-[56px] font-bold text-on-surface/30 leading-none">6€</span>
                <span className="text-on-surface-variant/50 font-body-md"> /mes</span>
              </div>

              <ul className="space-y-sm mb-xl">
                {[
                  "Todo lo del plan Beta",
                  "Mejor posicionamiento en búsquedas",
                  "Analíticas avanzadas e historial",
                  "Difusión mensual en canales TUESDI",
                  "Distintivo Standard en el perfil",
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-sm font-body-md text-body-md text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-outline text-[20px] shrink-0">radio_button_unchecked</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="w-full py-md rounded-xl border border-outline-variant bg-surface-container-lowest text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                Disponible pronto
              </div>
            </div>
          </div>

          {/* PRO — PRÓXIMAMENTE */}
          <div className="glass-card rounded-2xl overflow-hidden opacity-60">
            <div className="bg-surface-container-high text-on-surface-variant text-center py-sm font-label-sm text-label-sm font-bold uppercase tracking-widest">
              Próximamente
            </div>
            <div className="p-lg">
              <div className="mb-lg">
                <h2 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Pro</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Máxima visibilidad y promoción activa.</p>
              </div>
              <div className="mb-lg">
                <span className="text-[56px] font-bold text-on-surface/30 leading-none">9,99€</span>
                <span className="text-on-surface-variant/50 font-body-md"> /mes</span>
              </div>

              <ul className="space-y-sm mb-xl">
                {[
                  "Todo lo del plan Standard",
                  "Prioridad en directorios y búsquedas",
                  "Distintivo Pro verificado",
                  "4 difusiones mensuales en redes TUESDI",
                  "Analítica avanzada con tendencias",
                  "Promoción destacada en campañas especiales",
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-sm font-body-md text-body-md text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-outline text-[20px] shrink-0">radio_button_unchecked</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <div className="w-full py-md rounded-xl border border-outline-variant bg-surface-container-lowest text-center font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
                Disponible pronto
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta explanation */}
      <section className="max-w-4xl mx-auto px-margin pb-xl">
        <div className="glass-card rounded-2xl p-lg md:p-xl border-l-4 border-secondary/50">
          <div className="flex items-start gap-md">
            <span className="material-symbols-outlined text-secondary text-[36px] shrink-0">info</span>
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">¿Por qué la Beta es gratuita?</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                TUESDI está en su fase de validación. Antes de activar los planes de pago, queremos demostrar que la plataforma genera valor real: perfiles activos, contactos generados, eventos publicados. Durante este periodo, todos los artistas tienen acceso completo sin coste.
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mt-sm">
                Cuando activemos los planes Standard y Pro, quienes se registren durante la Beta conservarán sus perfiles y datos. <strong className="text-on-surface">Nunca se borrará nada.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why join now */}
      <section className="max-w-6xl mx-auto px-margin pb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-surface text-center mb-xl">¿Por qué unirte ahora?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {[
            {
              icon: "rocket_launch",
              title: "Ventaja de primer adoptante",
              body: "Los primeros artistas en TUESDI tendrán mejor posicionamiento natural cuando el directorio crezca.",
            },
            {
              icon: "visibility",
              title: "Visibilidad inmediata",
              body: "Tu perfil es público desde el momento que lo publicas. Promotores, salas y organizadores ya pueden encontrarte.",
            },
            {
              icon: "forum",
              title: "Influyes en el producto",
              body: "Tu experiencia durante la Beta define las funcionalidades que activaremos primero. Tienes voz directa.",
            },
          ].map((item) => (
            <div key={item.title} className="glass-card rounded-xl p-lg text-center">
              <div className="w-16 h-16 mx-auto mb-md rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[32px]">{item.icon}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">{item.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-xl overflow-hidden">
        <div className="absolute inset-0 spotlight opacity-20 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto px-margin text-center">
          <h2 className="font-headline-xl text-headline-xl text-on-surface mb-md">Tu escenario te espera</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
            Crea tu perfil ahora. Gratis. Sin compromisos.
          </p>
          <button
            className="bg-primary text-on-primary font-headline-md text-headline-md px-xl py-sm rounded-xl bloom-primary hover:scale-105 transition-transform"
            onClick={() => setLocation("/acceso")}
          >
            Unirme a la Beta
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-xl bg-surface-dim border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-center px-margin gap-md max-w-7xl mx-auto">
          <div className="font-headline-md text-headline-md text-on-surface opacity-50">TUESDI</div>
          <div className="flex gap-md flex-wrap justify-center">
            {[["Privacidad", "/politica-privacidad"], ["Términos", "/terminos-servicio"], ["Contacto", "/contacto"], ["Cookies", "/politica-cookies"]].map(([l, p]) => (
              <button key={p} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" onClick={() => setLocation(p)}>{l}</button>
            ))}
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant opacity-60">© {new Date().getFullYear()} TUESDI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
