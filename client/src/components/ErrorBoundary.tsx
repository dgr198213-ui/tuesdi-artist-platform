import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.retry);
      }

      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8 glass-card rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6">
              <AlertTriangle size={32} className="text-error" />
            </div>

            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm text-center">Algo salió mal</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg text-center">
              {this.state.error?.message || "Se ha producido un error inesperado"}
            </p>

            <div className="flex gap-sm justify-center w-full mb-lg">
              <button
                onClick={this.retry}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "bg-primary text-primary-foreground font-bold",
                  "hover:opacity-90 transition-opacity"
                )}
              >
                <RotateCcw size={16} />
                Reintentar
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg",
                  "border border-outline-variant text-on-surface-variant font-bold",
                  "hover:bg-surface-variant transition-colors"
                )}
              >
                Ir al Inicio
              </button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="w-full text-left">
                <summary className="cursor-pointer text-on-surface-variant text-sm font-bold hover:text-on-surface">
                  Detalles del Error (dev)
                </summary>
                <pre className="mt-sm p-sm bg-surface-container rounded text-[10px] overflow-auto max-h-40 text-error whitespace-pre-wrap break-words">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
