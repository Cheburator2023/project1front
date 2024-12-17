import { create } from 'zustand';

export type ExcludeErrorStoreState = {
  excludeError: boolean;
  updateExcludeError: (value: boolean) => void;
};

export const useExcludeErrorStore = create<ExcludeErrorStoreState>((set) => ({
  excludeError: true,
  updateExcludeError: (value: boolean) => set({ excludeError: value }),
}));

