import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Valida que las variables existan para evitar que la app crashee en la inicialización
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están definidas.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
