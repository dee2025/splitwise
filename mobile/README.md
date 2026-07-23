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

- Android OAuth client: package `in.moneysplit.app` plus the debug/release SHA-1 certificate.
- Web OAuth client: passed to Flutter as `GOOGLE_SERVER_CLIENT_ID` so Android returns an ID token.

The current project defaults to the existing Web OAuth client ID from the website. To override it:

```powershell
flutter run `
  --dart-define=MONEYSPLIT_API_BASE=https://www.moneysplit.in `
  --dart-define=GOOGLE_SERVER_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
```

Do not pass the Android OAuth client ID as `GOOGLE_SERVER_CLIENT_ID`; use the Web application client ID. Add accepted client IDs to the backend `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_IDS` environment variables. The Flutter app sends the Google ID token to `/api/auth/google-login`.
