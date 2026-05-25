import {Platform} from 'react-native';

/**
 * Host that reaches your Mac from the simulator/emulator.
 * Physical device on same Wi‑Fi: set to your Mac LAN IP (e.g. 192.168.29.24).
 */
export const DEV_MACHINE_HOST =
  Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

/** Local NestJS — same as dashboard vite `/api` → http://127.0.0.1:3000 */
export const LOCAL_NEST_BASE = `http://${DEV_MACHINE_HOST}:3000`;

/**
 * Dev vendor API — same as dashboard vite `/vendor-api` → dev1.knparises.com/api
 * (login & collections are not on local Nest; only public routes are.)
 */
const DEV_VENDOR_API = 'http://dev1.knparises.com/api';

/** Knparises vendor API — login & collections */
export const VENDOR_API_BASE = __DEV__
  ? DEV_VENDOR_API
  : 'https://vendor-api.ecoil.in';

/** NestJS public routes — services & applications */
export const PUBLIC_API_BASE = __DEV__
  ? `${LOCAL_NEST_BASE}/api/public`
  : 'https://vendor-api.ecoil.in/api/public';

/** Nest proxy → knparises vendor APIs (certificates, etc.) */
export const VENDOR_PROXY_API_BASE = __DEV__
  ? `${LOCAL_NEST_BASE}/api/vendor`
  : 'https://vendor-api.ecoil.in/api/vendor';
