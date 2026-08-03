# Ecoil Vendor App (React Native)

Mobile partner app for Ecoil vendors — mirrors the **external vendor portal** on the web dashboard.

## Stack

- React Native 0.85
- React Navigation (stack + bottom tabs)
- TanStack React Query
- Zustand + MMKV (auth persistence)
- Axios (vendor + public APIs)
- Architecture aligned with `sushaindoctor` reference app

## Setup

```bash
cd ecoil-vendor-app
npm install
npm run link:fonts
cd ios && pod install && cd ..
```

## Run

```bash
npm start
npm run ios     # or
npm run android
```

## API configuration

Edit `src/config/apiBase.ts`:

| Constant | Example | Purpose |
|----------|---------|---------|
| `CONFIG_API_ORIGIN` | `https://vendor-api.ecoil.in` | Backend base URL |
| `CONFIG_SERVICE_ICON_BASE_URL` | `''` | Optional icon CDN; empty uses `{API_ORIGIN}/api/file-upload` |

Local NestJS: set `CONFIG_API_ORIGIN` to `http://localhost:3000` (Android emulator remaps to `10.0.2.2`).

```bash
cd ecoil-vendor-backend && npm start
```

**Physical device:** use your Mac's LAN IP instead of `localhost` (e.g. `http://192.168.29.24:3000`).

## Screens

- Login (mobile + password)
- Home
- Our Services (dynamic application forms)
- My Service Requests
- New Collection / Collection List
- Drawer navigation + bottom tabs
