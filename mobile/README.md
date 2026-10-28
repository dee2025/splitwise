# MoneySplit Flutter App

Native Flutter app source for the authenticated MoneySplit user panel.

## Requirements

- Flutter SDK 3.24 or newer
- Android Studio / Xcode for native platform builds
- Backend deployed at `https://www.moneysplit.in`

## First Local Setup

The Flutter SDK is not installed in this workspace environment. After installing it, run:

```powershell
cd mobile
flutter create --platforms android,ios --org in.moneysplit .
flutter pub get
flutter run --dart-define=MONEYSPLIT_API_BASE=https://www.moneysplit.in
```

Use Android package ID and iOS bundle ID:

```text
in.moneysplit.app
```

## Google Sign-In

Google Sign-In needs two client IDs:

- Android OAuth client: package `in.moneysplit.app` plus every signing certificate SHA-1.
- Web OAuth client: passed to Flutter as `GOOGLE_SERVER_CLIENT_ID` so Android returns an ID token.

The current project defaults to the existing Web OAuth client ID from the website. To override it:

```powershell
flutter run `
  --dart-define=MONEYSPLIT_API_BASE=https://www.moneysplit.in `
  --dart-define=GOOGLE_SERVER_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Do not pass the Android OAuth client ID as `GOOGLE_SERVER_CLIENT_ID`; use the Web application client ID. Add accepted client IDs to the backend `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_IDS` environment variables. The Flutter app sends the Google ID token to `/api/auth/google-login`.

### Play Console testing builds

Google Play re-signs uploaded app bundles with the **Play App Signing** key. Its
SHA-1 normally differs from the local debug key and the upload key. A build can
therefore sign in locally but fail after installation from an internal, closed,
open, or early-access testing track.

1. In Play Console, open **Setup > App integrity > App signing key certificate**.
2. Copy the **SHA-1 certificate fingerprint** (Google Sign-In uses SHA-1; this is
   separate from the SHA-256 used by Digital Asset Links/TWA verification).
3. In Google Cloud Console, open **APIs & Services > Credentials** and create or
   update the Android OAuth 2.0 client for package `in.moneysplit.app` with that
   Play App Signing SHA-1.
4. Keep `GOOGLE_SERVER_CLIENT_ID` set to the Web OAuth client ID and ensure that
   same Web client ID is accepted by the deployed backend's `GOOGLE_CLIENT_ID`
   or `GOOGLE_CLIENT_IDS` setting.
5. Confirm the OAuth consent screen configuration is complete. MoneySplit only
   requests the basic `email` and `profile` identity scopes, which Google allows
   without the Testing-status user allowlist; testers do not normally need to be
   duplicated as OAuth test users for this flow.

After changing OAuth credentials, allow Google a few minutes to propagate the
configuration, then reinstall the Play-distributed build. Android error code 10
(`DEVELOPER_ERROR`) indicates a package name/signing SHA-1/client configuration
mismatch.
