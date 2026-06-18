/**
 * EmptyState — Componente para mostrar estados vacíos con ilustraciones
 * Proporciona UX clara cuando no hay datos disponibles
 */

interface EmptyStateProps {
  icon?: string; // Material Symbols icon name
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-xl px-lg text-center ${className}`}>
      {/* Icon */}
      <div className="mb-lg">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-primary text-[48px]">
            {icon}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-sm">
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-lg py-sm rounded-lg bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/**
 * Variantes predefinidas de EmptyState
 */

export function EmptyStateNoContacts({
  onAdd,
}: {
  onAdd?: () => void;
}) {
  return (
    <EmptyState
      icon="mail_outline"
      title="No tienes contactos aún"
      description="Los mensajes de otros artistas aparecerán aquí cuando te contacten."
      action={onAdd ? { label: "Compartir tu perfil", onClick: onAdd } : undefined}
    />
  );
}

export function EmptyStateNoMedia({
  onUpload,
}: {
  onUpload?: () => void;
}) {
  return (
    <EmptyState
      icon="photo_library"
      title="Tu galería está vacía"
      description="Sube tu primera foto o vídeo para construir tu escaparate digital."
      action={onUpload ? { label: "Subir Multimedia", onClick: onUpload } : undefined}
    />
  );
}

export function EmptyStateNoEvents({
  onCreate,
}: {
  onCreate?: () => void;
}) {
  return (
    <EmptyState
      icon="event"
      title="No tienes eventos publicados"
      description="Publica tu primer evento para que otros artistas puedan encontrarte."
      action={onCreate ? { label: "Publicar Evento", onClick: onCreate } : undefined}
    />
  );
}

export function EmptyStateNoSearch({
  query,
  onClear,
}: {
  query: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon="search_off"
      title="No encontramos resultados"
      description={`No hay resultados para "${query}". Intenta con otros términos.`}
      action={onClear ? { label: "Limpiar búsqueda", onClick: onClear } : undefined}
    />
  );
}

export function EmptyStateNoNotifications() {
  return (
    <EmptyState
      icon="notifications_none"
      title="No tienes notificaciones"
      description="Cuando recibas mensajes o actualizaciones importantes, aparecerán aquí."
    />
  );
}

export function EmptyStateNoAnalytics() {
  return (
    <EmptyState
      icon="analytics"
      title="Sin datos de analítica"
      description="Cuando otros artistas visiten tu perfil, verás estadísticas aquí."
    />
  );
}
