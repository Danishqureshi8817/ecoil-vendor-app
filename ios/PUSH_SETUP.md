# iOS Push Notifications — setup checklist

Bundle ID: `com.arises.knp`  
Team ID (from Xcode): `PCBX8MMTY8`

## A) Firebase Console (required)

1. Open [Firebase Console](https://console.firebase.google.com/) → project **ecoil-app**
2. Add iOS app (if missing) with Bundle ID **`com.arises.knp`**
3. Download **`GoogleService-Info.plist`**
4. Put it at: `ios/Ecoil/GoogleService-Info.plist`
5. In Xcode → drag into **Ecoil** target (Copy items ✅, target Ecoil ✅)

Without this file, Firebase/Push will not start on iOS.

## B) Apple Developer account — keys / certificates (required for FCM → iPhone)

### Option 1 (recommended): APNs Auth Key (.p8)

1. [Apple Developer](https://developer.apple.com/account) → **Certificates, Identifiers & Profiles**
2. **Keys** → **+** → enable **Apple Push Notifications service (APNs)**
3. Continue → Register → **Download `.p8`** (only once — save it safely)
4. Note these 3 values:
   - **Key ID** (on the key page)
   - **Team ID** (top-right Membership / Account)
   - **Bundle ID** = `com.arises.knp`
5. Firebase Console → Project Settings → **Cloud Messaging** → **Apple app configuration**
6. Under **APNs Authentication Key** upload:
   - `.p8` file
   - Key ID
   - Team ID

### Option 2: APNs Certificates (.p12) — older way

1. Create **Apple Push Notification service SSL** cert for App ID `com.arises.knp`
2. Export `.p12` from Keychain
3. Upload Development + Production certs in Firebase → Cloud Messaging

Prefer Option 1 (.p8) — one key works for both sandbox + production.

## C) Apple App ID capability

1. Apple Developer → **Identifiers** → App ID `com.arises.knp`
2. Enable **Push Notifications**
3. Save

## D) Xcode (already partially done in code)

Confirm in Xcode → Ecoil target → **Signing & Capabilities**:

- [ ] Team selected (`PCBX8MMTY8`)
- [ ] **Push Notifications** capability present
- [ ] **Background Modes** → **Remote notifications** checked
- [ ] `GoogleService-Info.plist` in target membership

Debug uses `Ecoil.entitlements` (aps-environment = development)  
Release uses `EcoilRelease.entitlements` (aps-environment = production)

## E) Device testing notes

- Push does **not** work reliably on iOS Simulator — use a **real iPhone**
- First launch: allow notification permission
- Metro log should show: `[FCM] Device token: ...`
- That FCM token is what backend/Firebase uses to send pushes

## F) What you must give / upload (summary)

| Item | Where from | Where to put |
|------|------------|--------------|
| `GoogleService-Info.plist` | Firebase iOS app | `ios/Ecoil/` |
| APNs Auth Key `.p8` | Apple → Keys | Firebase → Cloud Messaging |
| Key ID | Apple key page | Firebase with `.p8` |
| Team ID | Apple membership | Firebase with `.p8` |
| Bundle ID | `com.arises.knp` | Firebase iOS app + Apple App ID |

Code side (JS + entitlements + AppDelegate) is already wired for Android + iOS.
