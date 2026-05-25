import type {ExternalAuthSession, ExternalVendorUser} from '@/types/vendor';
import {AUTH_KEYS, tokenStorage} from '@/states/storage';

export function getStoredToken(): string | null {
  return tokenStorage.getString(AUTH_KEYS.token) ?? null;
}

export function getStoredUser(): ExternalVendorUser | null {
  try {
    const raw = tokenStorage.getString(AUTH_KEYS.user);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as ExternalVendorUser;
  } catch {
    return null;
  }
}

export function getStoredExpiry(): string | null {
  return tokenStorage.getString(AUTH_KEYS.expiry) ?? null;
}

export function isSessionValid(): boolean {
  const token = getStoredToken();
  if (!token) {
    return false;
  }
  const expiry = getStoredExpiry();
  if (!expiry) {
    return true;
  }
  const t = new Date(expiry).getTime();
  if (Number.isNaN(t)) {
    return true;
  }
  return t > Date.now();
}

export function setSession(session: ExternalAuthSession) {
  tokenStorage.set(AUTH_KEYS.token, session.token);
  tokenStorage.set(AUTH_KEYS.user, JSON.stringify(session.user));
  if (session.expiry) {
    tokenStorage.set(AUTH_KEYS.expiry, session.expiry);
  } else {
    tokenStorage.remove(AUTH_KEYS.expiry);
  }
}

export function clearSession() {
  tokenStorage.remove(AUTH_KEYS.token);
  tokenStorage.remove(AUTH_KEYS.user);
  tokenStorage.remove(AUTH_KEYS.expiry);
}
