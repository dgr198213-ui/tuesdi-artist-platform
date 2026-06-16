/**
 * TUESDI v3.0 — useAuth
 * Hook compartido de autenticación.
 */

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    email: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        isAuthenticated: !!session,
        userId: session?.user.id ?? null,
        email: session?.user.email ?? null,
        loading: false,
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState({
          isAuthenticated: !!session,
          userId: session?.user.id ?? null,
          email: session?.user.email ?? null,
          loading: false,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
