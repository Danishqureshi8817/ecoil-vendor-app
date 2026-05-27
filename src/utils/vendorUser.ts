import type {ExternalVendorUser} from '@/types/vendor';

export function vendorUserId(
  user: ExternalVendorUser | null | undefined,
): string | number {
  if (!user) {
    return 0;
  }
  const id = user.UserId ?? user.user_id ?? user.id ?? user.vendor_id;
  if (id == null || id === '') {
    return 0;
  }
  return typeof id === 'number' ? id : String(id);
}

export function vendorUserCity(
  user: ExternalVendorUser | null | undefined,
): string {
  if (!user) {
    return '';
  }
  const raw = user.city ?? user.City ?? user.vendor_city ?? user.address_city;
  return raw != null ? String(raw).trim() : '';
}

export function supplierAvatarInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'SU';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Primary vendor only (Arises: Payment + Agreement when VendorId == 0). */
export function isPrimaryVendor(
  user: ExternalVendorUser | null | undefined,
): boolean {
  if (!user) {
    return false;
  }
  const vendorId = user.VendorId ?? user.vendor_id;
  if (vendorId == null || vendorId === '') {
    return true;
  }
  return Number(vendorId) === 0;
}
