import {remapHostForDevice} from '@/config/apiBase';
import {SERVICE_ICON_BASE_URL} from '@/config/fileUploadBase';

/** Rewrite localhost icon URLs from API to device-reachable host (Android emulator). */
export function normalizeServiceIconUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) {
    return null;
  }
  return remapHostForDevice(trimmed);
}

type ServiceIconFields = {
  icon?: string | null;
  iconUrl?: string | null;
};

/** Build full icon URL from API file name + configured base URL. */
export function resolveServiceIconUrl(
  service: ServiceIconFields | null | undefined,
): string | null {
  if (!service) {
    return null;
  }
  const fileName = service.icon?.trim();
  if (fileName) {
    // File names are safe paths — avoid encodeURIComponent breaking some RN/Android loaders
    return `${SERVICE_ICON_BASE_URL}/${fileName}`;
  }
  const direct = service.iconUrl?.trim();
  return direct ? normalizeServiceIconUrl(direct) : null;
}
