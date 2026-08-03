import {API_ORIGIN, CONFIG_SERVICE_ICON_BASE_URL, remapHostForDevice} from './apiBase';

const trimTrailingSlash = (s: string) => s.replace(/\/$/, '');

/**
 * Public base URL for uploaded service icons (no trailing slash).
 * API returns only the file name — e.g. `1782067692770-uuid.png`.
 */
export const SERVICE_ICON_BASE_URL = (() => {
  const custom = CONFIG_SERVICE_ICON_BASE_URL.trim();
  if (!custom) {
    return trimTrailingSlash(`${API_ORIGIN}/api/file-upload`);
  }
  return trimTrailingSlash(remapHostForDevice(custom));
})();
