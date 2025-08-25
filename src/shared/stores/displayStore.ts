import { create } from 'zustand';
import { ACTIVE_SCREEN, RIGHT_PANEL_TYPE } from '@shared/constants';
import { Row } from '@shared/types';

export type DisplayStoreState = {
  activeScreen: ACTIVE_SCREEN;
  compareMode: boolean;
  rightPanelType: RIGHT_PANEL_TYPE | null;
  activeCellName?: keyof Row;
  activeRowId?: string;
};

export type DisplayStoreActions = {
  setActiveScreen: (newActiveScreen: ACTIVE_SCREEN) => void;
  setCompareMode: (newCompareMode: boolean) => void;
  setRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
  setActiveCellName: (cellName?: keyof Row) => void;
  setActiveRowId: (rowId?: string) => void;
  handleChangeCompare: (checked: boolean) => void;
  handleOnClose: () => void;
};

const initialState: DisplayStoreState = {
  activeScreen: ACTIVE_SCREEN.TABLE,
  compareMode: false,
  rightPanelType: null,
  activeCellName: undefined,
  activeRowId: undefined,
};

export const useDisplayStore = create<DisplayStoreState & DisplayStoreActions>((set) => ({
  ...initialState,
  setActiveScreen: (newActiveScreen: ACTIVE_SCREEN) => set({ activeScreen: newActiveScreen }),
  setCompareMode: (newCompareMode: boolean) => set({ compareMode: newCompareMode }),
  setRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => set({ rightPanelType: newRightPanelType }),
  setActiveCellName: (cellName?: keyof Row) => set({ activeCellName: cellName }),
  setActiveRowId: (rowId?: string) => set({ activeRowId: rowId }),
  handleChangeCompare: (checked: boolean) => {
    if (checked) {
      set({ activeScreen: ACTIVE_SCREEN.COMPARE, compareMode: true });
    } else {
      set({ activeScreen: ACTIVE_SCREEN.TABLE, compareMode: false });
    }
  },
  handleOnClose: () => {
    set({
      rightPanelType: null,
      activeCellName: undefined,
      activeRowId: undefined,
    });
  },
}));