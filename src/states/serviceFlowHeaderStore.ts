import {create} from 'zustand';

type ServiceFlowHeaderState = {
  showBack: boolean;
  title: string;
  onBack: (() => void) | null;
  setHeader: (title: string, onBack: () => void) => void;
  clearHeader: () => void;
};

export const useServiceFlowHeaderStore = create<ServiceFlowHeaderState>(set => ({
  showBack: false,
  title: '',
  onBack: null,
  setHeader: (title, onBack) => set({showBack: true, title, onBack}),
  clearHeader: () => set({showBack: false, title: '', onBack: null}),
}));
