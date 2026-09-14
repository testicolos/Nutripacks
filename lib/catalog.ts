import { backendClient } from './customer-session';

export type PackageItem = {
  id: string; name: string; slug: string; tagline?: string | null; description?: string | null;
  price_qar: number | string; duration_days: number; meals_per_day: number;
  calories_min?: number | null; calories_max?: number | null; protein_target?: number | null;
  featured?: boolean; sort_order?: number;
};
export type PackageRule = {
  package_id: string; breakfast_qty: number; main_qty: number; snack_qty: number;
  days_per_week: number; selection_days_ahead: number; cutoff_hours: number;
};
export type MenuItem = {
  id: string; name: string; slug: string; category: string; description?: string | null;
  calories: number; protein_g: number | string; carbs_g: number | string; fat_g: number | string;
  tags: string[]; allergens: string[]; image_url?: string | null; sort_order?: number;
};
export type PackageMapping = { package_id: string; menu_item_id: string; meal_slot: string };
export type PublicCatalog = { packages: PackageItem[]; rules: PackageRule[]; menu: MenuItem[]; mappings: PackageMapping[] };

export async function getPublicCatalog(): Promise<PublicCatalog> {
  const supabase = backendClient();
  const { data, error } = await supabase.rpc('np_public_catalog');
  if (error || !data) throw new Error(error?.message || 'Unable to load Nutripacks catalog.');
  const catalog = data as PublicCatalog;
  return {
    packages: catalog.packages || [],
    rules: catalog.rules || [],
    menu: catalog.menu || [],
    mappings: catalog.mappings || []
  };
}

export function getPackageRule(catalog: PublicCatalog, packageId: string) {
  return catalog.rules.find((rule) => rule.package_id === packageId);
}

export function eligibleMenu(catalog: PublicCatalog, packageId: string, slot?: string) {
  const ids = new Set(catalog.mappings.filter((m) => m.package_id === packageId && (!slot || m.meal_slot === slot)).map((m) => m.menu_item_id));
  return catalog.menu.filter((item) => ids.has(item.id));
}
