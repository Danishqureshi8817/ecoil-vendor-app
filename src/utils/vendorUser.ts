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

/** Body fields for POST /api/vendor/dashboard */
export function vendorDashboardParams(
  user: ExternalVendorUser | null | undefined,
): {user_id: string; user_type: string; vendor_id: string} {
  if (!user) {
    return {user_id: '', user_type: '', vendor_id: ''};
  }
  const userId =
    user.UserId ?? user.user_id ?? user.id ?? user.vendor_id ?? user.VendorId;
  const userType =
    user.user_type ??
    user.type ??
    user.usertype ??
    user.UserType ??
    user.userType ??
    '';
  const vendorId =
    user.vendor_id ?? user.VendorId ?? user.vendorId ?? userId ?? '';
  return {
    user_id: userId != null && userId !== '' ? String(userId) : '',
    user_type: userType != null && userType !== '' ? String(userType) : '',
    vendor_id: vendorId != null && vendorId !== '' ? String(vendorId) : '',
  };
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
  const parentVendorId =
    user.VendorId ?? user.vendorId ?? user.ParentVendorId ?? user.parent_vendor_id;
  if (parentVendorId == null || parentVendorId === '') {
    return true;
  }
  return Number(parentVendorId) === 0;
}

/** Master vendor account that manages branch counters (is_parent_counter = 1). */
export function isParentCounter(
  user: ExternalVendorUser | null | undefined,
): boolean {
  if (!user) {
    return false;
  }
  const flag = user.is_parent_counter ?? user.isParentCounter;
  return flag === 1 || flag === '1' || String(flag ?? '').trim() === '1';
}

/** Login `user.type` — typically 2 (oil) or 99 (scrap). */
export function vendorUserType(
  user: ExternalVendorUser | null | undefined,
): number {
  if (!user) {
    return 0;
  }
  const raw =
    user.type ??
    user.user_type ??
    user.usertype ??
    user.UserType ??
    user.userType;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Oil / existing vendor portal (login type = 2). */
export function isOilVendor(
  user: ExternalVendorUser | null | undefined,
): boolean {
  return vendorUserType(user) === 2;
}

/** Scrap collection vendor (login type = 99). */
export function isScrapVendor(
  user: ExternalVendorUser | null | undefined,
): boolean {
  return vendorUserType(user) === 99;
}
