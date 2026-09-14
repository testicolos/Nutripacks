# Nutripacks production launch checklist

The application is functionally prepared as a release candidate. The following items must be completed before taking real customer orders.

## Required before launch

- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as real environment variables on the production host. The repository fallback values are tolerated only for the current test deployment and should be removed once production env configuration is confirmed.
- Replace/remove the demo customer accounts (`basic`, `medium`, `premium`) and their weak test passwords before launch.
- Decide whether payment remains disabled for the first production release. If online payment is required later, implement it from the bank's official merchant documentation and never collect raw PAN/CVV in Nutripacks.
- Configure the real Nutripacks domain and HTTPS.
- Configure SMTP/business email, sender address, SPF, DKIM and DMARC. Test account, order and operational messages end to end.
- Add real Terms of Service and Privacy Policy content before asking customers to accept them.
- Decide and implement the customer account-recovery/password-reset process.
- Decide whether customer email/mobile verification is required before activation.
- Configure database backup/restore procedures and perform one restore drill before launch.
- Configure production logging/alerting for failed API calls, authentication failures and server errors.
- Add an operational retention/deletion policy for customer data.

## Final acceptance testing on the production domain

- Customer: signup, onboarding, login/logout, package selection, meal schedule creation, schedule editing, account/profile editing, pause/resume, skip/restore and order visibility.
- Admin: login, create/edit/archive/delete package, create/edit/archive/delete menu item, package eligibility mapping and order lifecycle.
- Chef: date filtering, kitchen totals, no customer email/phone exposure.
- Sales: customer contact, selections, package, delivery address/slot and order state.
- Responsive: current iPhone Safari, desktop Safari/Chrome/Edge and a common Android Chrome viewport.
- Accessibility smoke test: keyboard navigation, visible focus, form labels, error visibility and basic contrast.
- Performance smoke test: homepage/menu response, image loading, API latency and no server errors under ordinary concurrent use.

## QHost migration readiness

The app is kept in a portable repository with database access and configuration separated from UI code. Before moving from Vercel/Supabase to QHost, confirm the exact QHost plan supports the Node.js/Next.js runtime and PostgreSQL requirements used by the deployed architecture. If the selected QHost plan is PHP-only/shared hosting, deploy the frontend as a compatible build or move the application runtime to a VPS rather than trying to force Next.js into a hosting plan that did not sign up for this adventure.

For the database migration, export schema + data, recreate environment variables, import to the target PostgreSQL-compatible database, run a row-count/integrity comparison, then execute the full acceptance test again before changing DNS.
