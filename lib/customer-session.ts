import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';

const FALLBACK_URL = 'https://fqnjdnpsoxojguudyifi.supabase.co';
const FALLBACK_KEY = 'sb_publishable_afaCCwaWxEttocVM8xFkIA_w8mZTwvS';

type RpcError = { message: string };
type RpcResponse<T = any> = { data: T | null; error: RpcError | null };
type RpcArgs = Record<string, unknown>;

export const CUSTOMER_COOKIE = 'np_customer_session';

function createNeonPostgresClient(connectionString: string) {
  const sql = neon(connectionString);

  return {
    async rpc<T = any>(name: string, args: RpcArgs = {}): Promise<RpcResponse<T>> {
      if (!/^np_[a-z0-9_]+$/i.test(name)) {
        return { data: null, error: { message: 'invalid_rpc_name' } };
      }

      const entries = Object.entries(args);
      if (entries.some(([key]) => !/^p_[a-z0-9_]+$/i.test(key))) {
        return { data: null, error: { message: 'invalid_rpc_argument' } };
      }

      try {
        const parameters = entries.map(([key], index) => `${key} => $${index + 1}`).join(', ');
        const rows = await sql.query(
          `select public.${name}(${parameters}) as result`,
          entries.map(([, value]) => value)
        ) as Array<{ result: T }>;
        return { data: rows[0]?.result ?? null, error: null };
      } catch (error) {
        return {
          data: null,
          error: { message: error instanceof Error ? error.message : 'database_request_failed' }
        };
      }
    }
  };
}

function createNeonDataApiClient(baseUrl: string, token?: string) {
  const url = baseUrl.replace(/\/$/, '');

  return {
    async rpc<T = any>(name: string, args: RpcArgs = {}): Promise<RpcResponse<T>> {
      if (!/^np_[a-z0-9_]+$/i.test(name)) {
        return { data: null, error: { message: 'invalid_rpc_name' } };
      }

      try {
        const headers: Record<string, string> = {
          'content-type': 'application/json',
          accept: 'application/json'
        };
        if (token) headers.authorization = `Bearer ${token}`;

        const response = await fetch(`${url}/rpc/${encodeURIComponent(name)}`, {
          method: 'POST',
          headers,
          body: JSON.stringify(args),
          cache: 'no-store'
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          const message =
            (payload && typeof payload === 'object' && ('message' in payload || 'error' in payload)
              ? String((payload as { message?: unknown; error?: unknown }).message || (payload as { error?: unknown }).error)
              : response.statusText) || 'database_request_failed';
          return { data: null, error: { message } };
        }

        return { data: payload as T, error: null };
      } catch (error) {
        return {
          data: null,
          error: { message: error instanceof Error ? error.message : 'database_request_failed' }
        };
      }
    }
  };
}

function createSupabaseRpcClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || FALLBACK_KEY;
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  return {
    async rpc<T = any>(name: string, args: RpcArgs = {}): Promise<RpcResponse<T>> {
      const { data, error } = await supabase.rpc(name, args);
      return {
        data: (data ?? null) as T | null,
        error: error ? { message: error.message } : null
      };
    }
  };
}

export function backendClient() {
  const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (databaseUrl) {
    return createNeonPostgresClient(databaseUrl);
  }
  const neonDataApiUrl = process.env.NEON_DATA_API_URL;
  if (neonDataApiUrl) {
    return createNeonDataApiClient(neonDataApiUrl, process.env.NEON_DATA_API_TOKEN);
  }
  return createSupabaseRpcClient();
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
  if (value.includes('delivery_skip_day_locked')) return 'Today and tomorrow are locked. Delivery skipping is available from the day after tomorrow onward.';
  if (value.includes('delivery_date_not_found')) return 'This delivery date is not part of your current meal schedule.';
  if (value.includes('meal_change_limit_reached')) return 'Your one meal-selection change for this plan cycle has already been used. You can change meals again after renewal.';
  if (value.includes('meal_change_day_locked')) return 'Meal changes cannot affect today or tomorrow. Changes are allowed from the day after tomorrow onward.';
  if (value.includes('past_delivery_not_editable')) return 'Past delivery dates cannot be changed.';
  if (value.includes('order_not_editable')) return 'This order can no longer be edited.';
  if (value.includes('package_option_not_available')) return 'That customized plan version is no longer available.';
  if (value.includes('package_option_required')) return 'Choose the number of gym delivery days before continuing.';
  if (value.includes('incorrect_delivery_day_count')) return 'Choose meals for every required delivery day in this plan version.';
  if (value.includes('meal_selection_locked')) return 'Meal selections are locked after confirmation and cannot be changed.';
  if (value.includes('incorrect_meal_quantities')) return 'The selected meal quantities do not match this package.';
  if (value.includes('selection_outside_package_dates')) return 'A selected delivery date is outside the package period.';
  if (value.includes('item_not_allowed_for_package')) return 'One of the selected meals is not available in this package.';
  if (value.includes('invalid_start_date')) return 'Choose today or a future start date.';
  return 'Something went wrong. Please try again.';
}
