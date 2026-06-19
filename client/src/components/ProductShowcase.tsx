/**
 * TUESDI v3.0.6
 * ProductShowcase — Grid de "TUESDI por dentro"
 * Representa visualmente las 4 secciones críticas del producto usando mockups de código.
 */

interface ShowcaseCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const ShowcaseCard = ({ title, description, children }: ShowcaseCardProps) => (
  <div className="glass-card rounded-xl overflow-hidden flex flex-col border border-white/5 hover:border-primary/30 transition-all group">
    <div className="p-md border-b border-white/5 bg-white/[0.02]">
      <h4 className="font-bold text-on-surface text-sm">{title}</h4>
      <p className="text-on-surface-variant text-xs mt-0.5">{description}</p>
    </div>
    <div className="flex-grow p-md bg-black/40 relative overflow-hidden min-h-[160px]">
      {children}
    </div>
  </div>
);

export default function ProductShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
      {/* 1. Perfil Público */}
      <ShowcaseCard 
        title="Perfil Público" 
        description="Tu portfolio profesional impecable."
      >
        <div className="flex flex-col gap-sm animate-pulse-slow">
          <div className="h-24 w-full rounded-lg bg-surface-container relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-2 left-2 flex items-center gap-xs">
              <div className="w-8 h-8 rounded-full bg-primary/40 border border-white/20"></div>
              <div className="space-y-1">
                <div className="w-16 h-2 bg-white/40 rounded"></div>
                <div className="w-10 h-1.5 bg-white/20 rounded"></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center px-xs">
            <div className="w-20 h-6 rounded bg-primary/20 border border-primary/30"></div>
            <div className="w-12 h-6 rounded bg-white/5 border border-white/10"></div>
          </div>
        </div>
      </ShowcaseCard>

      {/* 2. Dashboard */}
      <ShowcaseCard 
        title="Panel de Control" 
        description="Métricas y gestión en tiempo real."
      >
        <div className="grid grid-cols-2 gap-xs">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-sm rounded-lg bg-white/[0.03] border border-white/5 flex flex-col gap-xs">
              <div className="w-4 h-4 rounded bg-secondary/20"></div>
              <div className="w-8 h-3 bg-white/20 rounded"></div>
              <div className="w-12 h-2 bg-white/10 rounded"></div>
            </div>
          ))}
          <div className="col-span-2 h-10 mt-xs rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <div className="w-24 h-2 bg-primary/40 rounded"></div>
          </div>
        </div>
      </ShowcaseCard>

      {/* 3. Gestión Multimedia */}
      <ShowcaseCard 
        title="Galería Inteligente" 
        description="Sube fotos y vídeos según tu plan."
      >
        <div className="flex flex-col gap-sm">
          <div className="grid grid-cols-3 gap-xs">
            <div className="aspect-square rounded bg-primary/20 border-2 border-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xs">check</span>
            </div>
            <div className="aspect-square rounded bg-white/[0.05] border border-dashed border-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/20 text-xs">add</span>
            </div>
            <div className="aspect-square rounded bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-white/10 text-xs">lock</span>
            </div>
          </div>
          <div className="p-xs rounded bg-secondary/5 border border-secondary/20">
            <div className="flex justify-between mb-1">
              <div className="w-12 h-1.5 bg-secondary/40 rounded"></div>
              <div className="w-4 h-1.5 bg-secondary/20 rounded"></div>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-secondary rounded-full"></div>
            </div>
          </div>
        </div>
      </ShowcaseCard>

      {/* 4. Contactos */}
      <ShowcaseCard 
        title="Buzón Seguro" 
        description="Propuestas directas y privadas."
      >
        <div className="space-y-xs">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-xs rounded bg-white/[0.03] border border-white/5 flex items-center gap-sm">
              <div className="w-6 h-6 rounded bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[12px] text-on-surface-variant">mail</span>
              </div>
              <div className="flex-grow space-y-1">
                <div className="w-20 h-1.5 bg-white/30 rounded"></div>
                <div className="w-12 h-1 bg-white/10 rounded"></div>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,129,255,0.8)]"></div>
            </div>
          ))}
        </div>
      </ShowcaseCard>
    </div>
  );
}
