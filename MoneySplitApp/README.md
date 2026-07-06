# MoneySplitApp

Expo Android app for the MoneySplit Next.js API.

This app is pinned to Expo SDK 54 so it can run with the Play Store version of Expo Go. SDK 57 is newer, but Expo announced that the Play Store Expo Go update for SDK 57 was still pending approval when this app was created.

## Run locally

1. Start the Next.js API from the repo root:

```bash
npm run dev
```

2. Configure the app API URL:

```bash
cp .env.example .env
```

Use `http://10.0.2.2:3000` for the Android emulator. Use your computer LAN IP for a physical Android device.

3. Start Expo:

```bash
npm run android
```

## Google sign-in

Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` or `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.
The Next.js server must allow the same client ID through `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_IDS`.

## Build Android

```bash
npx eas build --platform android
```
