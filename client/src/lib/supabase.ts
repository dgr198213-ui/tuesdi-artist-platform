import { createClient } from '@supabase/supabase-js';

// Fallbacks de producción: la URL del proyecto y la clave ANON (publishable)
// son públicas por diseño — van dentro del bundle del cliente en cualquier
// caso. Tenerlas aquí garantiza que un build sin variables de entorno no
// produzca una app rota en silencio. Las variables de entorno, si existen,
// tienen prioridad (útil para apuntar a otro proyecto en desarrollo).
// ⚠️ Si algún día se regenera la clave publishable en Supabase, actualizar
// también este fallback.
const FALLBACK_URL = 'https://xseupkmaosjdrgdsdpmj.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_M_UtGZAIHQqpKFyMqwNkpg_B9qEf2GU';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  }
);