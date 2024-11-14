import { create } from 'zustand';

export type RightModalPanelStoreState = {
  isDeleteModelEnabled: boolean;
  setRightPanelState: (modelSource: string) => void;
};

export const useRightPanelStore = create<RightModalPanelStoreState>((set) => ({
  isDeleteModelEnabled: false,
  setRightPanelState: (isEnabled: boolean) => {
    set({ isDeleteModelEnabled: isEnabled });
  },
}));

