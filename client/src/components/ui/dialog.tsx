// Stub: useDialogComposition — evita errores de importación en input.tsx
// cuando el input no está dentro de un Dialog.
export function useDialogComposition() {
  return {
    justEndedComposing: () => false,
    setComposing: (_v: boolean) => {},
    markCompositionEnd: () => {},
  };
}
