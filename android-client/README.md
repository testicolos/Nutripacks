# Nutripacks Android Client

Customer-only Android application for Nutripacks.

## Current behavior
- Opens the production Nutripacks customer experience at `https://nutripacks-qatar.vercel.app`.
- Keeps the existing secure web session/cookies so signup, login, account, menu, plans, meal selection and delivery controls use the same backend and business rules as the website.
- Supports the complete monthly meal schedule flow, including Diet/Gym cycle weeks, admin-configured meal/day plan versions with per-version pricing, package-specific delivery-day counts, and the locked schedule state after confirmation.
- Pull down to refresh any customer page. If the production site or network is unavailable, the app presents a retry state without losing the WebView session.
- Blocks `/admin`, `/staff`, `/api/admin` and `/api/staff` inside the app.
- External HTTPS links open in the device browser; mail and telephone links open their native handlers.
- Cleartext HTTP is disabled and local file/content access is disabled.

## Build
Open `android-client` in Android Studio with JDK 17, let Gradle sync, then run the `app` configuration on an Android 8.0+ device/emulator.

For Play Store release, create a private signing key outside GitHub and generate a signed Android App Bundle (AAB). Never commit signing credentials.

## Design preview
Open `design-preview.html` in a browser to review the proposed customer flow: home dashboard, locked monthly schedule, and package selection.

## Next native enhancements
Push notifications, biometric re-entry, offline-friendly menu cache, branded launcher/splash assets, and Play Store release configuration can be layered on without changing the Nutripacks database rules.
