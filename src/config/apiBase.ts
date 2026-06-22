import {Platform} from 'react-native';

const trimTrailingSlash = (s: string) => s.replace(/\/$/, '');

/**
 * API origin — same role as dashboard `VITE_API_ORIGIN`.
 * Local backend: set to `http://localhost:3000` (Android emulator remaps to 10.0.2.2).
 */
export const CONFIG_API_ORIGIN = 'https://vendor-api.ecoil.in';

/** Optional separate host for service icon files; leave empty to use `{API_ORIGIN}/api/file-upload`. */
export const CONFIG_SERVICE_ICON_BASE_URL = '';

/**
 * Android emulator cannot reach the dev machine via `localhost`.
 * Map to the host loopback alias used by the Android emulator.
 */
export function remapHostForDevice(origin: string): string {
  if (Platform.OS !== 'android') {
    return origin;
  }
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return trimTrailingSlash(origin.replace(url.hostname, '10.0.2.2'));
    }
  } catch {
    /* keep configured origin */
  }
  return origin;
}

function resolveApiOrigin(): string {
  return remapHostForDevice(trimTrailingSlash(CONFIG_API_ORIGIN));
}

export const API_ORIGIN = resolveApiOrigin();
export const API_BASE = `${API_ORIGIN}/api`;
export const VENDOR_API_BASE = `${API_ORIGIN}/api/vendor`;
export const PUBLIC_API_BASE = `${API_ORIGIN}/api/public`;
