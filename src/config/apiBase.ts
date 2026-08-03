import {Platform} from 'react-native';
import {API_ORIGIN as ENV_API_ORIGIN} from '@env';

const trimTrailingSlash = (s: string) => s.replace(/\/$/, '');

/** Production default — same as ecoil-vendor-dashboard `apiBase.ts`. */
const PRODUCTION_ORIGIN = 'https://vendor-api.ecoil.in';

/**
 * Android emulator cannot reach the dev machine via `localhost`.
 * Map to the host loopback alias used by the Android emulator.
 */
function remapHostForDevice(origin: string): string {
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
  const configured = (ENV_API_ORIGIN ?? '').trim();

  if (__DEV__) {
    const devOrigin = configured || 'https://vendor-api.ecoil.in';
    return remapHostForDevice(trimTrailingSlash(devOrigin));
  }

  const origin = configured || PRODUCTION_ORIGIN;
  return remapHostForDevice(trimTrailingSlash(origin));
}

export const API_ORIGIN = resolveApiOrigin();
export const API_BASE = `${API_ORIGIN}/api`;
export const VENDOR_API_BASE = `${API_ORIGIN}/api/vendor`;
export const PUBLIC_API_BASE = `${API_ORIGIN}/api/public`;
