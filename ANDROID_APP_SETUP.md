# MoneySplit Android App Setup

## 1. Architecture

MoneySplit uses a Progressive Web App plus Trusted Web Activity architecture.
The Android app in `android-twa/` is a thin wrapper around the production
Next.js site at `https://moneysplit.in`.

The website remains the source of truth for UI, API calls, authentication,
database behavior, routing, and releases. After the app is published, normal
website deployments appear inside the Android app without shipping a new APK or
AAB, unless Android wrapper metadata such as package name, icons, signing, or
launch URL changes.

The wrapper uses Google's Android Browser Helper library:

```gradle
implementation "com.google.androidbrowserhelper:androidbrowserhelper:2.7.2"
```

## 2. How The TWA Loads The Website

The Android launcher opens:

```text
https://moneysplit.in
```

Chrome or another compatible Android browser verifies ownership through Digital
Asset Links at:

```text
https://moneysplit.in/.well-known/assetlinks.json
```

After verification, the site opens full-screen without the browser address bar.
If verification fails, Android may fall back to a Custom Tab with browser UI.

## 3. Required Software

Install:

- Node.js and npm for the Next.js app.
- Android Studio with Android SDK Platform 36 installed.
- JDK 17 or newer.
- Gradle 9.6.1 or Android Studio's Gradle integration.
- Optional: Bubblewrap CLI for regenerating a TWA wrapper.

Android Studio SDK Manager:

- SDK Platform: Android 16, API level 36.
- SDK Tools: latest Android SDK Build-Tools 36.x.

## 4. Installation Commands

From the repository root:

```powershell
npm install
npm run lint
npm run build
```

For Android:

```powershell
cd android-twa
.\gradlew.bat assembleDebug
.\gradlew.bat bundleRelease
```

The Gradle wrapper is included in `android-twa/`, so a global Gradle
installation is not required.

## 5. Bubblewrap Commands

This repo already includes an Android Browser Helper project in `android-twa/`,
so Bubblewrap is optional. Use the existing Gradle project for normal builds:

```powershell
cd D:\office\Personal\splitwise\android-twa
.\gradlew.bat assembleDebug
.\gradlew.bat bundleRelease
```

Do not run `bubblewrap init` inside the existing `android-twa/` folder unless
you intentionally want to regenerate and replace that project.

Bubblewrap reads the live deployed manifest URL. If the website has not been
deployed with `src/app/manifest.js`, or if `https://moneysplit.in` redirects to
`https://www.moneysplit.in` where the manifest is missing, Bubblewrap will fail
with:

```text
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

That means Bubblewrap received an HTML page, usually a 404 or redirect target,
instead of JSON.

Before running Bubblewrap, deploy the website changes and verify:

```powershell
curl.exe -I -L https://moneysplit.in/manifest.webmanifest
curl.exe -L https://moneysplit.in/manifest.webmanifest
```

The final response must be `200`, the content type should be JSON or web
manifest JSON, and the body must start with `{`, not `<!DOCTYPE html>`.

Only if you intentionally want to regenerate a second wrapper from the deployed
PWA manifest, use a new empty folder:

```powershell
bubblewrap --version
bubblewrap doctor
mkdir ..\moneysplit-bubblewrap-generated
cd ..\moneysplit-bubblewrap-generated
bubblewrap init --manifest=https://moneysplit.in/manifest.webmanifest
bubblewrap build
```

If `bubblewrap --version` says the command is not found, install it with:

```powershell
npm install -g @bubblewrap/cli
```

If npm prints `Could not determine Node.js install directory`, skip reinstalling
when `bubblewrap --version` already works. Otherwise reinstall Node.js using the
official Windows installer, reopen PowerShell, and run the install command again.

The current repository does not require Bubblewrap to build the checked-in
Android app.

Use these values when prompted:

- Package ID: `in.moneysplit.app`
- App name: `MoneySplit`
- Short name: `Money Split`
- Start URL: `https://moneysplit.in`
- Theme color: `#000000`
- Display mode: `standalone`

## 6. Android Studio Instructions

1. Open Android Studio.
2. Choose **Open** and select `android-twa/`.
3. Let Gradle sync.
4. Confirm `compileSdk` and `targetSdk` are `36`.
5. Use **Build > Build Bundle(s) / APK(s)** for APK or AAB output.
6. Test on a real Android device with Chrome installed and updated.

## 7. Create The Upload Keystore

Create an upload key outside Git-tracked source, for example one directory
above `android-twa/`:

```powershell
keytool -genkeypair -v `
  -keystore release-upload-key.jks `
  -alias moneysplit-upload `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000
```

Then copy the example file:

```powershell
cd android-twa
Copy-Item keystore.properties.example keystore.properties
```

Edit `android-twa/keystore.properties` with your local keystore path and
passwords. Do not commit this file.

## 8. Protect And Back Up The Keystore

The upload keystore is required for future app updates. Store backups in a
password manager or encrypted storage. Keep:

- `release-upload-key.jks`
- keystore password
- key alias
- key password

Never commit keystores, passwords, Play Console credentials, or
`keystore.properties`.

## 9. Obtain SHA-256 Fingerprints

For Play Store production Digital Asset Links, use the Play App Signing
certificate fingerprint:

1. Open Google Play Console.
2. Select the MoneySplit app.
3. Go to **Setup > App integrity**.
4. Open **App signing key certificate**.
5. Copy the SHA-256 certificate fingerprint.

Important: the Play App Signing fingerprint can differ from your local upload
key fingerprint. Use the Play App Signing SHA-256 for production
`assetlinks.json`.

For local debug testing, get the debug or upload-key fingerprint with:

```powershell
keytool -list -v -keystore release-upload-key.jks -alias moneysplit-upload
```

## 10. Update assetlinks.json

Edit:

```text
public/.well-known/assetlinks.json
```

Replace:

```text
REPLACE_WITH_PLAY_APP_SIGNING_SHA256
```

with the Play App Signing SHA-256 fingerprint.

The structure must stay:

```json
[
  {
    "relation": [
      "delegate_permission/common.handle_all_urls"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "in.moneysplit.app",
      "sha256_cert_fingerprints": [
        "YOUR_PLAY_APP_SIGNING_SHA256"
      ]
    }
  }
]
```

Deploy the website and confirm this URL works:

```text
https://moneysplit.in/.well-known/assetlinks.json
```

## 11. Test Digital Asset Links

After deployment, verify the statement with:

```powershell
$url = "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://moneysplit.in&relation=delegate_permission/common.handle_all_urls"
Invoke-RestMethod $url
```

On a device:

```powershell
adb shell pm get-app-links in.moneysplit.app
adb shell am start -a android.intent.action.VIEW -d https://moneysplit.in
```

If verification is correct, the app should open full-screen after installation.

If `https://moneysplit.in` still redirects to `https://www.moneysplit.in`, fix
the host redirect before testing the TWA. This project is configured for the
apex host `https://moneysplit.in`; Digital Asset Links and TWA verification are
origin-specific.

## 12. Build An APK

Debug APK:

```powershell
cd android-twa
.\gradlew.bat assembleDebug
```

Output:

```text
android-twa/app/build/outputs/apk/debug/app-debug.apk
```

Release APK:

```powershell
cd android-twa
.\gradlew.bat assembleRelease
```

Output:

```text
android-twa/app/build/outputs/apk/release/app-release.apk
```

## 13. Build The Play Store AAB

After `keystore.properties` is configured:

```powershell
cd android-twa
.\gradlew.bat bundleRelease
```

Output:

```text
android-twa/app/build/outputs/bundle/release/app-release.aab
```

Upload the AAB to Google Play Console.

## 14. Change The Website URL

If the production URL changes, update:

- `src/app/layout.js`
- `src/app/manifest.js`
- `src/app/sitemap.js`
- `public/robots.txt`
- `next.config.mjs`
- `android-twa/app/src/main/res/values/strings.xml`
- `android-twa/app/src/main/AndroidManifest.xml`
- `public/.well-known/assetlinks.json`

Digital Asset Links are origin-specific. A redirect from one host to another can
break full-screen TWA verification if the final host is not verified.

## 15. Change Icon Or Splash Colour

Website icons live in:

```text
public/icons/
```

Android launcher icons live in:

```text
android-twa/app/src/main/res/mipmap-*/
```

Theme and splash colors live in:

```text
android-twa/app/src/main/res/values/colors.xml
src/app/layout.js
src/app/manifest.js
```

## 16. Play Store Release Checklist

Prepare:

- App name: `MoneySplit`
- Short description
- Full description
- 512x512 application icon
- 1024x500 feature graphic
- Phone screenshots
- Privacy-policy URL, for example `https://moneysplit.in/privacy-policy`
- Data Safety form
- Content rating questionnaire
- Target audience declaration
- App access instructions and reviewer account, if login is required
- Internal testing release
- Closed testing, if required for your developer account
- Production release
- Android App Bundle, not only APK
- Target API level 36
- Account-deletion flow or URL if users can create accounts

## 17. Common Troubleshooting

Address bar still appears:

- Confirm `assetlinks.json` is deployed on `https://moneysplit.in`.
- Confirm the package name is `in.moneysplit.app`.
- Confirm the SHA-256 is the Play App Signing SHA-256, not only the upload key.
- Confirm the app was installed from a build signed with the matching certificate
  for the asset link being tested.
- Confirm the website does not redirect to an unverified host.

Blank or offline screen:

- Confirm `https://moneysplit.in` is reachable from the device.
- Confirm `/manifest.webmanifest`, `/sw.js`, and `/offline` build correctly.
- Check Android Studio Logcat and Chrome remote debugging.

Login does not persist:

- Confirm the site is loaded over HTTPS.
- Confirm cookies are `Secure` in production.
- Do not cache `/api`, login, signup, dashboard, profile, account, or panel
  routes in the service worker.

File upload issues:

- Test on a real device with an updated browser.
- Confirm file inputs are normal HTML file inputs.
- Confirm the server route accepts multipart form data and HTTPS requests.

Build fails:

- Install JDK 17 or newer.
- Install Android SDK Platform 36 and Build-Tools 36.x.
- Sync Gradle in Android Studio.
- Run `.\gradlew.bat --version` and confirm Gradle 9.6.1.
- Use `OUTSIDE_VSCODE_ANDROID_STEPS.md` for the deployment, host redirect,
  signing, Play Console, and upload steps that cannot be completed from source
  code alone.
