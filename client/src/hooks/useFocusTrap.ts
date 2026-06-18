/**
 * useFocusTrap — Hook para gestionar foco dentro de modales/diálogos
 * Asegura que el foco no escape del componente modal
 */

import { useEffect, useRef } from "react";

export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Obtener todos los elementos focusables
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Enfocar el primer elemento al montar
    firstElement.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    containerRef.current.addEventListener("keydown", handleKeyDown);
    return () => {
      containerRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * useFocusRestore — Hook para restaurar foco después de cerrar un modal
 */
export function useFocusRestore() {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previousActiveElementRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    previousActiveElementRef.current?.focus();
  };

  return { saveFocus, restoreFocus };
}

/**
 * useAriaLive — Hook para anunciar cambios a lectores de pantalla
 */
export function useAriaLive(message: string, priority: "polite" | "assertive" = "polite") {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!message || !containerRef.current) return;

    containerRef.current.textContent = message;
    containerRef.current.setAttribute("role", "status");
    containerRef.current.setAttribute("aria-live", priority);
    containerRef.current.setAttribute("aria-atomic", "true");
  }, [message, priority]);

  return containerRef;
}
