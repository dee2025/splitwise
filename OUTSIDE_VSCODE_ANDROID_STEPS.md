# Outside VS Code Android Release Steps

These are the steps that cannot be fully completed from source code alone. They
require your hosting dashboard, DNS/CDN settings, Android Studio/SDK, or Google
Play Console.

## 1. Deploy The Website First

Deploy the current repository changes to production before running Bubblewrap or
testing Digital Asset Links.

From VS Code or terminal:

```powershell
cd D:\office\Personal\splitwise
npm run lint
npm run build
```

Then deploy using your normal hosting flow.

## 2. Keep The Production Host Redirect Consistent

The app is configured for:

```text
https://www.moneysplit.in
```

Your live infrastructure currently redirects the apex domain to `www`:

```text
https://moneysplit.in -> https://www.moneysplit.in
```

The repository has been aligned to that final host:

```text
https://www.moneysplit.in
```

Keep this redirect direction in your hosting/CDN/DNS dashboard:

```text
https://moneysplit.in/* -> https://www.moneysplit.in/*
```

## 3. Verify Public PWA Files

Run these outside VS Code after deployment:

```powershell
curl.exe -I -L https://www.moneysplit.in/manifest.webmanifest
curl.exe -L https://www.moneysplit.in/manifest.webmanifest
curl.exe -I -L https://www.moneysplit.in/sw.js
curl.exe -I -L https://www.moneysplit.in/offline
curl.exe -I -L https://www.moneysplit.in/.well-known/assetlinks.json
```

Expected:

- `manifest.webmanifest` returns `200`.
- Manifest body starts with `{`, not `<!DOCTYPE html>`.
- `sw.js` returns `200`.
- `/offline` returns `200`.
- `assetlinks.json` returns `200`.

Do not continue to Bubblewrap or Play Store testing until these URLs work.

## 4. Do Not Reinstall Bubblewrap If It Already Works

Check:

```powershell
bubblewrap --version
bubblewrap doctor
```

If `bubblewrap --version` prints a version, skip:

```powershell
npm install -g @bubblewrap/cli
```

If npm says `Could not determine Node.js install directory`, reinstall Node.js
using the official Windows installer, reopen PowerShell, then try again. This
is a local Node/npm installation issue, not a MoneySplit source issue.

## 5. Use The Existing Android Project

The repository already contains the Android TWA wrapper:

```text
android-twa/
```

You do not need to run `bubblewrap init` to build this app. Use:

```powershell
cd D:\office\Personal\splitwise\android-twa
.\gradlew.bat assembleDebug
.\gradlew.bat bundleRelease
```

Generated files:

```text
android-twa/app/build/outputs/apk/debug/app-debug.apk
android-twa/app/build/outputs/apk/release/app-release-unsigned.apk
android-twa/app/build/outputs/bundle/release/app-release.aab
```

The release AAB built without a local upload keystore is not ready for final
Play Store upload unless you configure signing.

## 6. Create Upload Keystore

Create the upload keystore outside Git-tracked files:

```powershell
cd D:\office\Personal\splitwise\android-twa
keytool -genkeypair -v `
  -keystore ..\release-upload-key.jks `
  -alias moneysplit-upload `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000
```

Then:

```powershell
Copy-Item keystore.properties.example keystore.properties
```

Edit `keystore.properties` with your real passwords and path. Do not commit:

- `release-upload-key.jks`
- `android-twa/keystore.properties`
- any passwords

## 7. Build Signed Release AAB

After `keystore.properties` is configured:

```powershell
cd D:\office\Personal\splitwise\android-twa
.\gradlew.bat clean
.\gradlew.bat bundleRelease
```

Upload:

```text
android-twa/app/build/outputs/bundle/release/app-release.aab
```

## 8. Get Play App Signing SHA-256

After creating the app in Google Play Console:

1. Open Google Play Console.
2. Select the app.
3. Go to **Setup > App integrity**.
4. Open **App signing key certificate**.
5. Copy the SHA-256 certificate fingerprint.

This Play App Signing SHA-256 can be different from your local upload-key
SHA-256.

## 9. Update Digital Asset Links

Edit:

```text
public/.well-known/assetlinks.json
```

For local debug APK testing, `assetlinks.json` can include the debug certificate
SHA-256. The current debug APK uses:

```text
AD:86:6C:D4:E1:29:DB:6C:0C:6D:F0:38:06:D3:3B:46:EA:7C:B0:3B:36:AB:CC:68:B1:B8:21:46:EF:61:9F:75
```

For Play Store production, add the Play App Signing SHA-256 fingerprint to the
same `sha256_cert_fingerprints` array, then redeploy the website.

Verify:

```powershell
curl.exe -L https://www.moneysplit.in/.well-known/assetlinks.json
```

## 10. Test App Links On Device

Install the APK/AAB build on a real Android device, then run:

```powershell
adb shell pm get-app-links in.moneysplit.app
adb shell am start -a android.intent.action.VIEW -d https://www.moneysplit.in
```

The app should open full-screen without a browser address bar after Digital
Asset Links verification succeeds.

If the browser-style top bar still appears after deploying `assetlinks.json`,
force a fresh verification:

```powershell
adb shell pm verify-app-links --re-verify in.moneysplit.app
adb shell pm get-app-links in.moneysplit.app
```

## 11. Play Store Items To Prepare

Prepare these outside VS Code:

- App name: `MoneySplit`
- Short description
- Full description
- 512x512 app icon
- 1024x500 feature graphic
- Phone screenshots
- Privacy policy URL: `https://www.moneysplit.in/privacy-policy`
- Data Safety form
- Content rating
- Target audience
- Reviewer account or app access instructions
- Account deletion URL or in-app flow if users can create accounts
- Internal testing release
- Closed testing if your developer account requires it
- Production release with Android App Bundle
