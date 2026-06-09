import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function ProtectedRoute(Component: React.ComponentType) {
  return function ProtectedRouteWrapper() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [, setLocation] = useLocation();

    useEffect(() => {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (!session) {
          setLocation("/login");
        }
      };

      checkAuth();

      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setIsAuthenticated(!!session);
          if (!session) {
            setLocation("/login");
          }
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    }, [setLocation]);

    if (isAuthenticated === null) {
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
