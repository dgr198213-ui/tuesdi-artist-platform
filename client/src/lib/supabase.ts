import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  const msg = 'Falta configuración de Supabase. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env';
  if (import.meta.env.DEV) {
    throw new Error(msg);
  }
  console.error(msg);
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);