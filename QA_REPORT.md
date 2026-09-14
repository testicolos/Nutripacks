# Nutripacks release-candidate QA report

Date: 2026-09-14
Environment: Vercel + Supabase testing environment
Payment: intentionally disabled

## Result

Backend end-to-end release-candidate QA: **PASS**.

The final automated database test created temporary customer/order/catalog data, exercised the full workflow, and removed every temporary record afterward. No QA package, menu item, customer, or QA function remains in the database.

## End-to-end workflow tested

- Customer session/profile customization works.
- Selecting a package creates an order as `draft`, not active.
- An incomplete weekly meal schedule is rejected.
- Failed validation does not erase a previously valid schedule.
- A complete schedule that exactly matches package rules activates the draft order.
- Package eligibility is enforced by the database, not only by the browser.
- Pause and resume work on active customer plans.
- Skip and restore delivery controls work.
- Chef/Admin/Sales scheduling receives active order selections.
- Package create and edit work.
- Menu item create and edit work.
- Package-to-menu mapping validation works.
- A package cannot require a meal slot without at least one eligible active item.
- Unused package/menu deletion hard-deletes the record.
- Package/menu records with historical usage are archived rather than destructively deleted.
- Admin order lifecycle transitions reject invalid state changes.

Final QA sample: 24 meal units across 6 Performance delivery days; 18 staff schedule rows observed after meal grouping. All assertions passed.

## Database integrity checks

- 30 active menu items.
- 3 active packages.
- 3 requested demo customers remain.
- Demo schedules match their package rules: Balance 18 meal units, Lean 18 meal units, Performance 24 meal units.
- All test orders use `payment_status = not_required` and `payment_provider = TESTING` internally.
- No temporary QA customers, packages, menu items, admins, or QA functions remain.

## Security checks

- Direct anonymous SELECT on customer/order/package tables is denied.
- Anonymous TRUNCATE privileges were removed.
- Public catalog and login are exposed only through intended RPC entry points.
- Internal guard/token helper functions are not executable by the anonymous role.
- Obsolete empty schema objects from the earlier prototype were removed.
- Row-level security remains enabled on application tables.

## UI/UX review performed

Source and responsive-layout review covered homepage, live menu, package selection, signup/onboarding, login, meal customization, customer account/calendar, admin catalog, admin orders, staff operations, Chef view and Sales view.

Changes from the review include clearer testing-mode messaging, removal of card/payment controls, plan preservation through signup/login, valid-state-only order actions, responsive admin action rows, safer delete confirmation, archived-state visibility, better empty states, focus/disabled states, mobile table overflow, Qatar phone normalization, start-date constraints, and backend validation messages that explain what the user must fix.

A Vercel production build is also required to pass after the final source commit. Browser/device visual regression should still be repeated on the final custom domain before launch because source review and build success are not a substitute for checking real Safari/Chrome rendering on the final hosting/domain stack.
