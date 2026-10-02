import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.warn('VITE_SUPABASE_URL is missing. Please add it to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
