import { backendClient } from './customer-session';

export type PackageItem = {
  id: string; name: string; slug: string; tagline?: string | null; description?: string | null;
  price_qar: number | string; duration_days: number; meals_per_day: number;
  plan_type?: 'diet' | 'gym' | string; plan_variant?: 'business_lunch' | 'standard' | 'gym' | string;
  allow_day_count_selection?: boolean;
  calories_min?: number | null; calories_max?: number | null; protein_target?: number | null;
  featured?: boolean; sort_order?: number;
};
export type PackageRule = {
  package_id: string; breakfast_qty: number; main_qty: number; snack_qty: number;
  days_per_week: number; delivery_day_count?: number; delivery_weekdays?: number[];
  cycle_weeks?: number; cycle_anchor_date?: string;
  selection_days_ahead: number; cutoff_hours: number;
};
export type PackageOption = {
  id: string; package_id: string; name: string;
  breakfast_qty: number; main_qty: number; snack_qty: number;
  days_per_week: number; delivery_day_count: number; delivery_weekdays: number[];
  price_qar: number | string; active?: boolean; sort_order?: number;
};
export type MenuItem = {
  id: string; name: string; slug: string; category: string; description?: string | null;
  calories: number; protein_g: number | string; carbs_g: number | string; fat_g: number | string;
  is_gym_menu?: boolean;
  tags: string[]; allergens: string[]; image_url?: string | null; sort_order?: number;
};
export type PackageMapping = { package_id: string; menu_item_id: string; meal_slot: string; cycle_week?: number };
export type PublicCatalog = { packages: PackageItem[]; rules: PackageRule[]; options: PackageOption[]; menu: MenuItem[]; mappings: PackageMapping[] };

export async function getPublicCatalog(): Promise<PublicCatalog> {
  const supabase = backendClient();
  const { data, error } = await supabase.rpc('np_public_catalog');
  if (error || !data) throw new Error(error?.message || 'Unable to load Nutripacks catalog.');
  const catalog = data as PublicCatalog;
  return {
    packages: catalog.packages || [],
    rules: catalog.rules || [],
    options: catalog.options || [],
    menu: catalog.menu || [],
    mappings: catalog.mappings || []
  };
}

export function getPackageRule(catalog: PublicCatalog, packageId: string) {
  return catalog.rules.find((rule) => rule.package_id === packageId);
}

export function eligibleMenu(catalog: PublicCatalog, packageId: string, slot?: string, cycleWeek?: number) {
  const ids = new Set(catalog.mappings.filter((m) => m.package_id === packageId && (!slot || m.meal_slot === slot) && (cycleWeek == null || !m.cycle_week || m.cycle_week === 0 || m.cycle_week === cycleWeek)).map((m) => m.menu_item_id));
  return catalog.menu.filter((item) => ids.has(item.id));
}
