
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // In some sandboxed or restricted environments, session persistence can cause fetch errors.
    // Disabling it allows the client to work correctly using the anon key for each request
    // without attempting to manage a session in browser storage.
    persistSession: false,
  }
});