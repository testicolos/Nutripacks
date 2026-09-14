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
  if (value.includes('order_not_found')) return 'Order not found.';
  if (value.includes('payment_required')) return 'Mark the payment as paid before activating this order.';
  if (value.includes('only_active_can_pause')) return 'Only an active order can be paused.';
  if (value.includes('only_paused_can_resume')) return 'Only a paused order can be resumed.';
  if (value.includes('invalid_order_action')) return 'That order action is not supported.';
  return 'Something went wrong. Please try again.';
}
