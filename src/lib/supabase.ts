import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase environment variables are missing. The app will not function correctly.');
} else {
  try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('CRITICAL: Failed to create Supabase client.', error);
  }
}

// Export the instance, which might be null.
// Code that uses this will now fail with "cannot read properties of null"
// but the app itself might render something instead of a blank white screen.
export const supabase = supabaseInstance;
