import { backendClient } from './customer-session';

export const STAFF_COOKIE = 'np_staff_session';
export { backendClient };

export function friendlyStaffError(message?: string) {
  const value = (message || '').toLowerCase();
  if (value.includes('invalid_credentials')) return 'Incorrect username or password.';
  if (value.includes('invalid_staff_session')) return 'Your staff session has expired. Please sign in again.';
  if (value.includes('admin_required') || value.includes('forbidden')) return 'You do not have permission for this action.';
  if (value.includes('password_too_short')) return 'Password must be at least 8 characters.';
  if (value.includes('invalid_username')) return 'Username must be at least 3 characters.';
  return 'Something went wrong. Please try again.';
}
