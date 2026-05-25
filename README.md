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

Edit `src/config/env.ts`. In **`__DEV__`** (same as web dashboard proxies):

| API | Dev URL | Production |
|-----|---------|------------|
| Public (services, applications) | `http://localhost:3000/api/public` | `vendor-api.ecoil.in` |
| Vendor (login, collections) | `http://dev1.knparises.com/api` | `https://vendor-api.ecoil.in` |

Run local Nest before testing services:

```bash
cd ecoil-vendor-backend && npm start
```

**Physical device:** set `DEV_MACHINE_HOST` in `src/config/env.ts` to your Mac’s LAN IP (e.g. `192.168.29.24`).

## Screens

- Login (mobile + password)
- Home
- Our Services (dynamic application forms)
- My Service Requests
- New Collection / Collection List
- Drawer navigation + bottom tabs
