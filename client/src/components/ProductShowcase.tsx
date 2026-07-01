/**
 * TUESDI v3.0.7
 * ProductShowcase — Grid de "TUESDI por dentro"
 * Muestra capturas reales del producto en las 4 secciones críticas.
 */

interface ShowcaseCardProps {
  title: string;
  description: string;
  image: string;
}

const ShowcaseCard = ({ title, description, image }: ShowcaseCardProps) => (
  <div className="glass-card rounded-xl overflow-hidden flex flex-col border border-white/5 hover:border-primary/30 transition-all group">
    <div className="p-md border-b border-white/5 bg-white/[0.02]">
      <h4 className="font-bold text-on-surface text-sm">{title}</h4>
      <p className="text-on-surface-variant text-xs mt-0.5">{description}</p>
    </div>
    <div className="flex-grow relative overflow-hidden bg-black/40 min-h-[280px] max-h-[340px]">
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
    </div>
  </div>
);

export default function ProductShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
      <ShowcaseCard
        title="Perfil Público"
        description="Tu portfolio profesional impecable."
        image="/showcase/perfil-publico.jpg"
      />
      <ShowcaseCard
        title="Panel de Control"
        description="Métricas y gestión en tiempo real."
        image="/showcase/panel-control.jpg"
      />
      <ShowcaseCard
        title="Galería Inteligente"
        description="Sube fotos y vídeos según tu plan."
        image="/showcase/galeria.jpg"
      />
      <ShowcaseCard
        title="Buzón Seguro"
        description="Propuestas directas y privadas."
        image="/showcase/buzon.jpg"
      />
    </div>
  );
}
