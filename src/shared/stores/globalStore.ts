import { create } from 'zustand';

export type GlobalStoreState = {
  filtersResetCount: number;
};

export type AppInjectStoreActions = {
  setFiltersResetCount: () => void;
};

const initialState: GlobalStoreState = {
  filtersResetCount: 0,
};

export const globalStore = create<GlobalStoreState & AppInjectStoreActions>((set) => ({
  filtersResetCount: initialState.filtersResetCount,
  setFiltersResetCount: () => {
    return set((state) => ({ filtersResetCount: state.filtersResetCount + 1 }));
  },
}));

