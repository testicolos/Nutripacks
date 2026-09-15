# Nutripacks Android Client

Customer-only Android application for Nutripacks.

## Current behavior
- Opens the production Nutripacks customer experience at `https://nutripacks-qatar.vercel.app/login`.
- Keeps the existing secure web session/cookies so signup, login, account, menu, plans, meal selection and delivery controls use the same backend and business rules as the website.
- Blocks `/admin`, `/staff`, `/api/admin` and `/api/staff` inside the app.
- External HTTPS links open in the device browser; mail and telephone links open their native handlers.
- Cleartext HTTP is disabled and local file/content access is disabled.

## Build
Open `android-client` in Android Studio with JDK 17, let Gradle sync, then run the `app` configuration on an Android 8.0+ device/emulator.

For Play Store release, create a private signing key outside GitHub and generate a signed Android App Bundle (AAB). Never commit signing credentials.

## Next native enhancements
Push notifications, biometric re-entry, native bottom navigation, offline-friendly menu cache, branded launcher/splash assets, and Play Store release configuration can be layered on without changing the Nutripacks database rules.
