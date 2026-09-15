# Nutripacks database

The current development database is PostgreSQL on Supabase. Application tables use the `np_` prefix so Nutripacks remains isolated from unrelated projects in the same development database.

The production migration target is standard PostgreSQL/MySQL-compatible application logic on QHost. No business rule should depend on Vercel-specific storage.

Current domain areas:
- packages and package rules
- menu items and package eligibility
- customers and sessions
- orders and meal selections
- admin users and sessions
- email templates and settings

A clean export migration will be added before the QHost move.

## Plan-cycle migration

`20260915_plan_cycles.sql` extends the live schema with Diet/Gym plan metadata,
delivery-day counts and weekday masks, Gym catalogue flags, and per-cycle-week
package mappings. Diet plans use an eight-week cycle; Gym plans use a four-week
cycle and deliver Saturday through Thursday (Friday excluded). Existing package
mappings are retained as cycle `0` legacy mappings, which remain available in
every week until an administrator configures explicit weekly menus.

Customer selections are generated for the complete delivery-day entitlement and
are locked after the first successful monthly save. The application calculates
the active cycle week from each delivery date and the shared `cycle_anchor_date`,
so subscriptions beginning mid-cycle see the correct week sequence.

## Customized plan versions

`20260916_custom_plan_versions.sql` adds `np_package_options`. Admins can create
multiple versions under either a Diet or Gym package, each with its own
breakfast/main/snack quantities, days per week, delivery-day count and QAR price.
Customers choose one version before creating an order; the selected option is
stored on `np_orders` and reused by backend meal validation. Existing orders
without an option continue using their package-rule defaults.

`20260916_gym_day_selection.sql` adds `np_packages.allow_day_count_selection`.
Gym packages are enabled automatically and require a 5- or 6-day option before
an order can be created. Other plans keep day count fixed unless an admin turns
on the visibility toggle. The admin eligibility list also hides non-gym menu
items whenever a Gym package is selected.
