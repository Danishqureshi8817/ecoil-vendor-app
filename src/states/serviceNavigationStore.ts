import {create} from 'zustand';

type ServiceNavigationState = {
  pendingServiceId: string | null;
  openService: (serviceId: string) => void;
  clearPendingService: () => void;
};

export const useServiceNavigationStore = create<ServiceNavigationState>(set => ({
  pendingServiceId: null,
  openService: serviceId => set({pendingServiceId: serviceId}),
  clearPendingService: () => set({pendingServiceId: null}),
}));
