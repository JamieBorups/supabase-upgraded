
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL as CONFIG_URL, SUPABASE_ANON_KEY as CONFIG_KEY } from './config.ts';

// Prioritize environment variables, but fall back to the config file.
// This supports both hosted environments (with env vars) and local/studio development.
const supabaseUrl = process.env.SUPABASE_URL || CONFIG_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || CONFIG_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key is missing. Check your environment variables or config.ts file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // In some sandboxed or restricted environments, session persistence can cause fetch errors.
    // Disabling it allows the client to work correctly using the anon key for each request
    // without attempting to manage a session in browser storage.
    persistSession: false,
  }
});
