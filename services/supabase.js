// services/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Public client for front-end interactions (anon)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Secure server-side client (for token verification)
export async function verifyUserToken(token) {
  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error) {
      console.error('Token verification error:', error.message);
      return null;
    }
    return data?.user || null;
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return null;
  }
}
