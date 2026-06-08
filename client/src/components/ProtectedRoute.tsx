import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

export default function ProtectedRoute(Component: React.ComponentType) {
  return function ProtectedRouteWrapper() {
    const { isAuthenticated, loading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        window.location.href = getLoginUrl();
      }
    }, [isAuthenticated, loading]);

    if (loading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component />;
  };
}
