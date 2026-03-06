import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || supabaseUrl === 'https://your-project-ref.supabase.co') {
  throw new Error('Missing VITE_SUPABASE_URL environment variable. Please add your Supabase project URL to web/.env');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable. Please add your Supabase anon key to web/.env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default supabase;