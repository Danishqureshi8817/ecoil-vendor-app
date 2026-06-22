import {SERVICE_ICON_BASE_URL as ENV_SERVICE_ICON_BASE} from '@env';
import {API_ORIGIN, remapHostForDevice} from './apiBase';

const trimTrailingSlash = (s: string) => s.replace(/\/$/, '');

/**
 * Public base URL for uploaded service icons (no trailing slash).
 * API returns only the file name — e.g. `1782067692770-uuid.png`.
 *
 * Defaults to `{API_ORIGIN}/api/file-upload` (follows Android emulator host remap).
 * Override via `SERVICE_ICON_BASE_URL` in `.env` for a separate CDN/host.
 */
export const SERVICE_ICON_BASE_URL = (() => {
  const custom = ENV_SERVICE_ICON_BASE?.trim();
  if (!custom) {
    return trimTrailingSlash(`${API_ORIGIN}/api/file-upload`);
  }
  return trimTrailingSlash(remapHostForDevice(custom));
})();
