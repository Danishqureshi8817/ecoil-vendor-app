import {remapHostForDevice} from '@/config/apiBase';
import {SERVICE_ICON_BASE_URL} from '@/config/fileUploadBase';
import type {PublicHomeBanner} from '@/api/publicApi';

/**
 * Build a device-reachable banner image URL.
 * Prefer stored file name + app API origin (same as service icons).
 * Falls back to API imageUrl with localhost → emulator host remap.
 */
export function resolveBannerImageUrl(
  banner: Pick<PublicHomeBanner, 'image' | 'imageUrl'> | null | undefined,
): string | null {
  if (!banner) return null;

  const fileName = banner.image?.trim();
  if (fileName) {
    return `${SERVICE_ICON_BASE_URL}/${fileName}`;
  }

  const direct = banner.imageUrl?.trim();
  if (!direct) return null;
  return remapHostForDevice(direct);
}
