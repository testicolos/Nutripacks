import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://fqnjdnpsoxojguudyifi.supabase.co';
const FALLBACK_KEY = 'sb_publishable_afaCCwaWxEttocVM8xFkIA_w8mZTwvS';

export const CUSTOMER_COOKIE = 'np_customer_session';

export function backendClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function friendlyAuthError(message?: string) {
  const value = (message || '').toLowerCase();
  if (value.includes('email_already_registered')) return 'An account already exists with this email.';
  if (value.includes('invalid_credentials')) return 'Incorrect email or password.';
  if (value.includes('password_too_short')) return 'Password must be at least 8 characters.';
  if (value.includes('invalid_email')) return 'Please enter a valid email address.';
  if (value.includes('unauthorized') || value.includes('invalid_customer_session')) return 'Your session has expired. Please sign in again.';
  return 'Something went wrong. Please try again.';
}
