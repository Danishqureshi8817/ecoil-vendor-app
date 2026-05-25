import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import type {ExternalVendorUser} from '@/types/vendor';
import {mmkvStorage} from './storage';

type AuthStore = {
  user: ExternalVendorUser | null;
  setUser: (user: ExternalVendorUser | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      setUser: user => set({user}),
      logout: () => set({user: null}),
    }),
    {
      name: 'vendor-auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
