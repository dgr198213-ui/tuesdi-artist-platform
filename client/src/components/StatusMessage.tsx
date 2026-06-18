/**
 * StatusMessage — Componente para mostrar mensajes de estado/feedback
 * Reemplaza o complementa a sonner toast para casos específicos
 */

import { useEffect, useState } from "react";

export type StatusType = "success" | "error" | "warning" | "info";

interface StatusMessageProps {
  type: StatusType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  autoClose?: number; // ms, 0 = no auto close
  onClose?: () => void;
}

export default function StatusMessage({
  type,
  title,
  message,
  action,
  dismissible = true,
  autoClose = 5000,
  onClose,
}: StatusMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      icon: "check_circle",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
      textColor: "text-success",
      titleColor: "text-success",
    },
    error: {
      icon: "error",
      bgColor: "bg-error/10",
      borderColor: "border-error/30",
      textColor: "text-error",
      titleColor: "text-error",
    },
    warning: {
      icon: "warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
      textColor: "text-warning",
      titleColor: "text-warning",
    },
    info: {
      icon: "info",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
      textColor: "text-primary",
      titleColor: "text-primary",
    },
  };

  const config = typeConfig[type];

  return (
    <div
      className={`glass-card rounded-lg p-md border-l-4 ${config.bgColor} ${config.borderColor} flex items-start gap-md animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      {/* Icon */}
      <span className={`material-symbols-outlined ${config.textColor} shrink-0 mt-0.5`}>
        {config.icon}
      </span>

      {/* Content */}
      <div className="flex-1">
        <p className={`font-label-sm text-label-sm ${config.titleColor} uppercase tracking-widest mb-xs`}>
          {title}
        </p>
        {message && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {message}
          </p>
        )}

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className={`mt-sm font-label-sm text-label-sm ${config.titleColor} hover:opacity-80 transition-opacity`}
          >
            {action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      {dismissible && (
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      )}
    </div>
  );
}

/**
 * Hook para usar StatusMessage de forma imperativa
 */
import { useCallback, useRef } from "react";

interface StatusMessageRef {
  show: (props: Omit<StatusMessageProps, "onClose">) => void;
  hide: () => void;
}

export function useStatusMessage(): [React.ReactNode, StatusMessageRef] {
  const [message, setMessage] = useState<StatusMessageProps | null>(null);

  const ref = useRef<StatusMessageRef>({
    show: (props) => {
      setMessage({
        ...props,
        onClose: () => setMessage(null),
      });
    },
    hide: () => setMessage(null),
  });

  const element = message ? (
    <StatusMessage {...message} />
  ) : null;

  return [element, ref.current];
}
