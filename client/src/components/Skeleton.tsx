/**
 * Skeleton — Componentes de carga estilo esqueleto
 * Proporciona una experiencia de carga más fluida y profesional
 */

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  count?: number;
  circle?: boolean;
}

/**
 * Skeleton genérico
 */
export function Skeleton({
  className = "",
  width = "100%",
  height = "1rem",
  circle = false,
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  return (
    <div
      className={`bg-surface-container-highest animate-pulse ${circle ? "rounded-full" : "rounded"} ${className}`}
      style={style}
    />
  );
}

/**
 * Skeleton de texto (múltiples líneas)
 */
export function SkeletonText({ count = 3, className = "" }: SkeletonProps) {
  return (
    <div className={`space-y-sm ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.875rem"
          width={i === count - 1 ? "80%" : "100%"}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton de tarjeta
 */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`glass-card rounded-xl p-md space-y-md ${className}`}>
      <Skeleton height="2rem" width="60%" />
      <SkeletonText count={2} />
      <div className="flex gap-sm pt-md">
        <Skeleton height="2.5rem" width="100%" />
        <Skeleton height="2.5rem" width="100%" />
      </div>
    </div>
  );
}

/**
 * Skeleton de imagen
 */
export function SkeletonImage({
  width = "100%",
  height = "300px",
  className = "",
}: SkeletonProps) {
  return (
    <Skeleton
      width={width}
      height={height}
      className={`rounded-lg ${className}`}
    />
  );
}

/**
 * Skeleton de avatar
 */
export function SkeletonAvatar({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      circle
      className={className}
    />
  );
}

/**
 * Skeleton de lista
 */
export function SkeletonList({
  count = 5,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-md ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-md items-center">
          <SkeletonAvatar size={40} />
          <div className="flex-1">
            <SkeletonText count={1} />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton de galería (grid de imágenes)
 */
export function SkeletonGallery({
  count = 8,
  columns = 4,
  className = "",
}: {
  count?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-md ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonImage key={i} height="200px" />
      ))}
    </div>
  );
}

/**
 * Skeleton de tabla
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = "",
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-md ${className}`}>
      {/* Header */}
      <div className="flex gap-md">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height="1.5rem" className="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-md">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton key={colIdx} height="1rem" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton de dashboard (vista general)
 */
export function SkeletonDashboard({ className = "" }: { className?: string }) {
  return (
    <div className={`space-y-lg ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton height="2rem" width="30%" />
        <SkeletonAvatar size={40} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-md">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Content */}
      <SkeletonCard className="h-96" />
    </div>
  );
}
