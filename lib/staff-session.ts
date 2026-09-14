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
  if (value.includes('only_active_can_pause')) return 'Only an active order can be paused.';
  if (value.includes('only_paused_can_resume')) return 'Only a paused order can be resumed.';
  if (value.includes('invalid_order_action')) return 'That order action is not supported.';
  if (value.includes('breakfast_mapping_required')) return 'This package requires breakfast, so assign at least one active breakfast item.';
  if (value.includes('main_mapping_required')) return 'This package requires a main meal, so assign at least one active main item.';
  if (value.includes('snack_mapping_required')) return 'This package requires a snack, so assign at least one active snack item.';
  if (value.includes('mapping_item_category_mismatch')) return 'An assigned menu item does not match its meal category.';
  if (value.includes('invalid_calorie_range')) return 'Minimum calories cannot be greater than maximum calories.';
  if (value.includes('package_requires_meal')) return 'A package must include at least one meal or snack per delivery day.';
  if (value.includes('invalid_package')) return 'Check the package name, slug and price.';
  return 'Something went wrong. Please try again.';
}
