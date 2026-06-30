/**
 * TUESDI - Tu Escenario Digital v3.0
 * Landing Page de Lanzamiento (/escaparate)
 *
 * SPA ultraligera para campaña de captación Beta.
 * Eje: soberanía profesional, sin intermediarios, sin comisiones.
 */

import PageNav from "@/components/PageNav";
import PageFooter from "@/components/PageFooter";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useLocation } from "wouter";

const PAIN_POINTS = [
  {
    icon: "money_off",
    title: "Comisiones que muerden tu caché",
    body: "Las agencias se quedan entre el 15% y el 30% de cada actuación. TUESDI no toca un euro de lo que cobras.",
    color: "text-error",
    bg: "bg-error/10 border-error/20",
  },
  {
    icon: "visibility_off",
    title: "Tu email y teléfono expuestos",
    body: "Publicar tus datos personales atrae spam, acoso y contactos que no respetan tu tiempo. En TUESDI, tus datos nunca son públicos.",
    color: "text-secondary",
    bg: "bg-secondary/10 border-secondary/20",
  },
  {
    icon: "travel_explore",
    title: "Sin escaparate profesional",
    body: "Instagram no es un portafolio. Una web propia cuesta tiempo y dinero. TUESDI es tu perfil profesional activo desde el minuto uno.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
];

const FEATURES = [
  { icon: "account_circle", label: "Perfil artístico profesional" },
  { icon: "photo_library", label: "Galería multimedia" },
  { icon: "lock", label: "Contacto privado — tus datos nunca públicos" },
  { icon: "analytics", label: "Métricas reales de visibilidad" },
  { icon: "event", label: "Publicación de eventos gratuita" },
  { icon: "block", label: "Sin comisiones. Nunca." },
];

export default function Escaparate() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "sending") return;

    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://tuesdi-artist-platform.vercel.app/dashboard",
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(
        error.message === "Email rate limit exceeded"
          ? "Demasiados intentos. Espera unos minutos."
          : "No se pudo enviar el enlace. Verifica el email."
      );
      return;
    }

    setStatus("sent");
  };

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-primary/30 overflow-x-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/8 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/6 rounded-full blur-[120px]"></div>
      </div>

      {/* Nav mínima */}
      <PageNav />

      {/* HERO */}
      <section className="relative z-10 max-w-4xl mx-auto px-margin pt-xl pb-xl text-center">
        <div className="inline-flex items-center gap-sm px-md py-xs rounded-full border border-secondary/30 bg-secondary/10 mb-lg">
          <span className="w-2 h-2 rounded-full bg-secondary pulse-live shrink-0"></span>
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest leading-none">Beta Abierta · Acceso Gratuito</span>
        </div>

        <h1 className="font-headline-xl text-[36px] md:text-[56px] text-on-surface leading-[1.1] tracking-tight mb-lg">
          Tu talento no pertenece<br className="hidden md:block" /> a intermediarios.{" "}
          <span className="text-primary italic">Adueñate<br className="hidden md:block" /> de tu escenario.</span>
        </h1>

        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-md leading-relaxed">
          Monta tu escaparate digital definitivo en minutos. Un portafolio profesional, estético y optimizado para recibir solicitudes de actuación directamente en tu email.
        </p>
        <p className="font-body-md text-body-md text-on-surface-variant/60 mb-xl">
          Sin comisiones. Sin ruido visual. Con privacidad radical.
        </p>

        {/* CTA Form */}
        {status === "sent" ? (
          <div className="glass-card max-w-[28rem] mx-auto rounded-2xl p-lg text-center">
            <span className="material-symbols-outlined text-secondary text-[48px] block mb-md" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
            <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">¡Enlace enviado!</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Revisa tu correo y haz clic en el enlace para activar tu escenario. Caduca en 10 minutos.
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant/50 mt-md">
              ¿No lo ves? Revisa spam o promociones.
            </p>
          </div>
        ) : (
          <form className="max-w-[28rem] mx-auto" onSubmit={handleSubmit}>
            <div className="glass-card rounded-2xl p-md bloom-primary space-y-md">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline">mail</span>
                <input
                  className="w-full bg-surface-container-lowest border border-white/10 rounded-xl pl-12 pr-md py-md text-on-surface font-body-md focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all placeholder:text-white/20"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "sending"}
                />
              </div>
              {status === "error" && (
                <p className="font-label-sm text-label-sm text-error">{errorMsg}</p>
              )}
              <button
                className="w-full py-md bg-primary text-on-primary font-headline-md text-[18px] rounded-xl bloom-primary hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-sm"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  <><span className="material-symbols-outlined animate-spin">sync</span> Enviando...</>
                ) : (
                  <>Asegurar Mi Escenario <span className="material-symbols-outlined">arrow_forward</span></>
                )}
              </button>
              <p className="text-center font-label-sm text-label-sm text-on-surface-variant/50">
                Exclusivo para artistas mayores de edad.<br />Registro profesional en 30 segundos sin contraseñas.
              </p>
            </div>
          </form>
        )}
      </section>

      {/* PAIN POINTS */}
      <section className="relative z-10 max-w-6xl mx-auto px-margin pb-xl">
        <h2 className="font-headline-lg text-[28px] md:text-headline-lg text-on-surface text-center mb-xl">
          El sector tiene tres problemas.<br />
          <span className="text-primary">TUESDI los elimina.</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {PAIN_POINTS.map((p) => (
            <div key={p.title} className={`glass-card rounded-2xl p-lg border ${p.bg}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-md ${p.bg}`}>
                <span className={`material-symbols-outlined text-[32px] ${p.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
              </div>
              <h3 className={`font-headline-md text-headline-md mb-sm ${p.color}`}>{p.title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="relative z-10 max-w-4xl mx-auto px-margin pb-xl">
        <div className="glass-card rounded-3xl p-lg md:p-xl bloom-primary">
          <div className="text-center mb-xl">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest block mb-sm">Plan Beta · Acceso Total</span>
            <h2 className="font-headline-lg text-[28px] md:text-headline-lg text-on-surface">
              Todo incluido. <span className="text-secondary">0€ / mes.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-xl">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-md">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{f.icon}</span>
                </div>
                <span className="font-body-md text-body-md text-on-surface">{f.label}</span>
              </div>
            ))}
          </div>
          <div className="text-center border-t border-white/5 pt-lg">
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">
              Los perfiles creados durante la Beta <strong className="text-on-surface">se mantienen siempre</strong>. Nunca se borra nada.
            </p>
            {status !== "sent" && (
              <button
                className="bg-secondary text-black font-headline-md text-[18px] px-xl py-sm rounded-xl font-bold hover:opacity-90 transition-all"
                onClick={() => document.querySelector("input[type='email']")?.scrollIntoView({ behavior: "smooth" })}
              >
                Quiero Mi Escenario Ahora
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / MANIFESTO */}
      <section className="relative z-10 max-w-3xl mx-auto px-margin pb-xl text-center">
        <div className="space-y-lg">
          {[
            { quote: "Quien valore tu arte, te escribirá en serio.", attr: "TUESDI" },
            { quote: "Sin algoritmos que decidan tu visibilidad. Sin intermediarios que se lleven tu dinero. Solo tú, tu trabajo y los organizadores que te buscan.", attr: null },
          ].map((item, i) => (
            <blockquote key={i} className="relative">
              <span className="text-[80px] text-primary/10 font-serif absolute -top-6 -left-2 leading-none select-none">"</span>
              <p className={`relative z-10 text-on-surface leading-relaxed ${i === 0 ? "font-headline-md text-[22px] md:text-headline-md text-primary italic" : "font-body-lg text-body-lg text-on-surface-variant"}`}>
                {item.quote}
              </p>
              {item.attr && <cite className="font-label-sm text-label-sm text-outline not-italic block mt-sm">— {item.attr}</cite>}
            </blockquote>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      {status !== "sent" && (
        <section className="relative z-10 py-xl px-margin text-center">
          <div className="absolute inset-0 spotlight opacity-20 pointer-events-none"></div>
          <div className="relative max-w-[36rem] mx-auto space-y-md">
            <h2 className="font-headline-xl text-[32px] md:text-headline-xl text-on-surface">Tu escenario te espera.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">Gratis. Sin contraseñas. Sin compromisos.</p>
            <button
              className="bg-primary text-on-primary font-headline-md text-[18px] px-xl py-md rounded-xl bloom-primary hover:scale-105 transition-transform"
              onClick={() => document.querySelector("input[type='email']")?.scrollIntoView({ behavior: "smooth" })}
            >
              Asegurar Mi Escenario
            </button>
          </div>
        </section>
      )}

      {/* Footer minimal */}
      <PageFooter />
    </div>
  );
}
