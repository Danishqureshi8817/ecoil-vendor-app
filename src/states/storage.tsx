import {createMMKV} from 'react-native-mmkv';

export const tokenStorage = createMMKV({
  id: 'vendor-token-storage',
  encryptionKey: 'ecoil_vendor_secret',
});

export const storage = createMMKV({
  id: 'ecoil-vendor-app',
  encryptionKey: 'ecoil_vendor_secret',
});

export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  removeItem: (key: string) => {
    storage.remove(key);
  },
};

export const AUTH_KEYS = {
  token: 'token',
  user: 'user',
  expiry: 'expiry',
} as const;
