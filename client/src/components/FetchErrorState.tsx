/**
 * TUESDI - Tu Escenario Digital v3.0
 * FetchErrorState — Componente reutilizable para errores de carga de datos
 *
 * Muestra un mensaje de error consistente con botón de reintento.
 * Distingue entre error de red/conexión y otros errores.
 */

import { cn } from "@/lib/utils";

interface FetchErrorStateProps {
  /** Texto descriptivo del recurso que falló (ej: "el directorio", "tus métricas") */
  resourceLabel?: string;
  /** Si es true, muestra mensaje específico de error de conexión */
  isNetworkError?: boolean;
  /** Callback para reintentar la carga */
  onRetry?: () => void;
  /** Clases adicionales */
  className?: string;
}

const ICON_SIZE = 64;

export default function FetchErrorState({
  resourceLabel = "los datos",
  isNetworkError = false,
  onRetry,
  className,
}: FetchErrorStateProps) {
  const title = isNetworkError
    ? "Error de conexión"
    : "No se pudieron cargar los datos";

  const message = isNetworkError
    ? `No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.`
    : `Hubo un problema al cargar ${resourceLabel}. Inténtalo de nuevo.`;

  return (
    <div className={cn("glass-card rounded-xl p-xl text-center text-on-surface-variant", className)}>
      <span
        className="material-symbols-outlined mb-md block text-error"
        style={{ fontSize: ICON_SIZE }}
      >
        {isNetworkError ? "wifi_off" : "error_outline"}
      </span>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">{title}</h3>
      <p className="font-body-md text-body-md mb-lg">{message}</p>
      {onRetry && (
        <button
          className="bg-primary text-on-primary px-lg py-sm rounded-lg font-bold bloom-primary hover:opacity-90 transition-all"
          onClick={onRetry}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
