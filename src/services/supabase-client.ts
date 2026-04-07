import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase credentials not configured. Using fallback JSON storage.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'your_supabase_project_url' &&
    supabaseAnonKey !== 'your_supabase_anon_key');
}
