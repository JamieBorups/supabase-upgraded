
import { createClient } from '@supabase/supabase-js';

// Use environment variables if they are available, otherwise fall back to hardcoded values.
const supabaseUrl = process.env.SUPABASE_URL || 'https://vfbmiuyamdbquhvhuifb.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmYm1pdXlhbWRicXVodmh1aWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjc2OTksImV4cCI6MjA2NzYwMzY5OX0.Fv1YUVAhPmTNxoJ9G05sTyQeig0qnD26q1ES6ChsiY8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // In some sandboxed or restricted environments, session persistence can cause fetch errors.
    // Disabling it allows the client to work correctly using the anon key for each request
    // without attempting to manage a session in browser storage.
    persistSession: false,
  }
});
