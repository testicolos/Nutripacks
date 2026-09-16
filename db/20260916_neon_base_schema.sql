-- Base Nutripacks schema for a fresh Neon PostgreSQL database.
-- Apply this before the dated feature migrations and catalog seed.

begin;

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.np_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text,
  description text,
  price_qar numeric(12,2) not null default 0,
  duration_days integer not null default 30,
  meals_per_day integer not null default 1,
  plan_type text not null default 'diet',
  plan_variant text not null default 'standard',
  allow_day_count_selection boolean not null default false,
  calories_min integer,
  calories_max integer,
  protein_target integer,
  active boolean not null default true,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint np_packages_name_check check (length(trim(name)) >= 2),
  constraint np_packages_price_check check (price_qar >= 0),
  constraint np_packages_duration_check check (duration_days > 0),
  constraint np_packages_meals_check check (meals_per_day > 0),
  constraint np_packages_plan_type_check check (plan_type in ('diet','gym')),
  constraint np_packages_plan_variant_check check (plan_variant in ('standard','business_lunch','gym'))
);

create table if not exists public.np_package_rules (
  package_id uuid primary key references public.np_packages(id) on delete cascade,
  breakfast_qty integer not null default 1,
  main_qty integer not null default 1,
  snack_qty integer not null default 1,
  days_per_week integer not null default 6,
  delivery_day_count integer not null default 24,
  delivery_weekdays smallint[] not null default array[0,1,2,3,4,6]::smallint[],
  cycle_weeks integer not null default 8,
  cycle_anchor_date date not null default date '2026-01-04',
  selection_days_ahead integer not null default 7,
  cutoff_hours integer not null default 24,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint np_package_rules_qty_check check (breakfast_qty >= 0 and main_qty >= 0 and snack_qty >= 0 and breakfast_qty + main_qty + snack_qty > 0),
  constraint np_package_rules_days_check check (days_per_week between 1 and 7),
  constraint np_package_rules_delivery_day_count_check check (delivery_day_count > 0),
  constraint np_package_rules_delivery_weekdays_check check (cardinality(delivery_weekdays) between 1 and 7 and delivery_weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  constraint np_package_rules_cycle_weeks_check check (cycle_weeks between 1 and 8)
);

create table if not exists public.np_package_options (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.np_packages(id) on delete cascade,
  name text not null,
  breakfast_qty integer not null default 1,
  main_qty integer not null default 1,
  snack_qty integer not null default 1,
  days_per_week integer not null default 6,
  delivery_day_count integer not null default 24,
  delivery_weekdays smallint[] not null default array[0,1,2,3,4,6]::smallint[],
  price_qar numeric(12,2) not null default 0,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint np_package_options_name_check check (length(trim(name)) >= 2),
  constraint np_package_options_qty_check check (breakfast_qty >= 0 and main_qty >= 0 and snack_qty >= 0 and breakfast_qty + main_qty + snack_qty > 0),
  constraint np_package_options_days_check check (days_per_week between 1 and 7),
  constraint np_package_options_delivery_count_check check (delivery_day_count > 0),
  constraint np_package_options_weekdays_check check (cardinality(delivery_weekdays) = days_per_week and delivery_weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  constraint np_package_options_price_check check (price_qar >= 0),
  constraint np_package_options_unique_name unique (package_id, name)
);

create table if not exists public.np_menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null,
  description text,
  calories integer not null default 0,
  protein_g numeric(10,2) not null default 0,
  carbs_g numeric(10,2) not null default 0,
  fat_g numeric(10,2) not null default 0,
  tags text[] not null default '{}',
  allergens text[] not null default '{}',
  image_url text,
  is_gym_menu boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint np_menu_items_category_check check (category in ('breakfast','main','snack','side','drink')),
  constraint np_menu_items_nutrition_check check (calories >= 0 and protein_g >= 0 and carbs_g >= 0 and fat_g >= 0)
);

create table if not exists public.np_package_items (
  package_id uuid not null references public.np_packages(id) on delete cascade,
  cycle_week integer not null default 0,
  menu_item_id uuid not null references public.np_menu_items(id) on delete cascade,
  meal_slot text not null,
  created_at timestamptz not null default now(),
  primary key (package_id, cycle_week, menu_item_id, meal_slot),
  constraint np_package_items_slot_check check (meal_slot in ('breakfast','main','snack','side','drink')),
  constraint np_package_items_cycle_check check (cycle_week between 0 and 8)
);

create table if not exists public.np_customers (
  id uuid primary key default gen_random_uuid(),
  username text unique,
  email text not null unique,
  full_name text not null,
  phone text,
  password_hash text not null,
  goal text,
  calorie_preference integer,
  dietary_preferences text[] not null default '{}',
  allergies text[] not null default '{}',
  delivery_address text,
  delivery_zone text,
  delivery_slot text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.np_customer_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.np_customers(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.np_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.np_customers(id),
  package_id uuid not null references public.np_packages(id),
  package_option_id uuid references public.np_package_options(id) on delete set null,
  total_qar numeric(12,2) not null default 0,
  status text not null default 'draft',
  payment_status text not null default 'not_required',
  payment_provider text,
  payment_reference text,
  start_date date not null,
  delivery_address text not null,
  delivery_slot text not null,
  meal_change_count integer not null default 0,
  meal_change_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.np_meal_selections (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.np_orders(id) on delete cascade,
  delivery_date date not null,
  meal_slot text not null,
  menu_item_id uuid not null references public.np_menu_items(id),
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint np_meal_selections_qty_check check (quantity > 0),
  constraint np_meal_selections_slot_check check (meal_slot in ('breakfast','main','snack')),
  constraint np_meal_selections_unique unique (order_id, delivery_date, meal_slot, menu_item_id)
);

create table if not exists public.np_delivery_exceptions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.np_orders(id) on delete cascade,
  delivery_date date not null,
  exception_type text not null,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint np_delivery_exceptions_unique unique (order_id, delivery_date)
);

create table if not exists public.np_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.np_orders(id) on delete cascade,
  event_type text not null,
  from_status text,
  to_status text,
  from_payment_status text,
  to_payment_status text,
  actor_type text,
  actor_id uuid,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.np_admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_algo text not null default 'bcrypt',
  password_salt text,
  password_hash text not null,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint np_admin_users_role_check check (role in ('admin','chef','sales'))
);

create table if not exists public.np_admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.np_admin_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.np_email_templates (
  id uuid primary key default gen_random_uuid(),
  template_key text not null unique,
  name text not null,
  subject text not null,
  body_html text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists np_package_items_cycle_idx on public.np_package_items(package_id, cycle_week, meal_slot);
create index if not exists np_package_options_package_idx on public.np_package_options(package_id, active, sort_order);
create index if not exists np_orders_customer_idx on public.np_orders(customer_id, created_at desc);
create index if not exists np_orders_package_option_idx on public.np_orders(package_option_id);
create index if not exists np_meal_selections_order_date_idx on public.np_meal_selections(order_id, delivery_date);
create index if not exists np_delivery_exceptions_order_date_idx on public.np_delivery_exceptions(order_id, delivery_date);
create index if not exists np_customer_sessions_expiry_idx on public.np_customer_sessions(expires_at);
create index if not exists np_admin_sessions_expiry_idx on public.np_admin_sessions(expires_at);

commit;
