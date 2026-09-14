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
  if (value.includes('invalid_credentials')) return 'Incorrect username/email or password.';
  if (value.includes('password_too_short')) return 'Password must be at least 8 characters.';
  if (value.includes('invalid_email')) return 'Please enter a valid email address.';
  if (value.includes('unauthorized') || value.includes('invalid_customer_session')) return 'Your session has expired. Please sign in again.';
  if (value.includes('order_not_found')) return 'This order could not be found.';
  if (value.includes('only_active_can_pause')) return 'Only an active plan can be paused.';
  if (value.includes('only_paused_can_resume')) return 'Only a paused plan can be resumed.';
  if (value.includes('delivery_skip_cutoff_passed')) return 'Delivery changes close 24 hours before the scheduled delivery time.';
  if (value.includes('past_delivery_not_editable')) return 'Past delivery dates cannot be changed.';
  if (value.includes('order_not_editable')) return 'This order can no longer be edited.';
  if (value.includes('incorrect_delivery_day_count')) return 'Choose meals for every required delivery day in the week.';
  if (value.includes('incorrect_meal_quantities')) return 'The selected meal quantities do not match this package.';
  if (value.includes('selection_outside_package_dates')) return 'A selected delivery date is outside the package period.';
  if (value.includes('item_not_allowed_for_package')) return 'One of the selected meals is not available in this package.';
  if (value.includes('invalid_start_date')) return 'Choose today or a future start date.';
  return 'Something went wrong. Please try again.';
}
