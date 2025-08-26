import { GridApi } from 'ag-grid-community';
import { create } from 'zustand';

export type GlobalStoreState = {
  filtersResetCount: number;
  agGridApi?: GridApi;
};

export type GlobalStoreActions = {
  setFiltersResetCount: () => void;
  setAgGridApi: (agGridApi: GridApi) => void;
};

const initialState: GlobalStoreState = {
  filtersResetCount: 0,
};

export const useGlobalStore = create<GlobalStoreState & GlobalStoreActions>((set) => ({
  ...initialState,
  agGridApi: undefined,
  setAgGridApi: (agGridApi: GridApi) => {
    return set({ agGridApi });
  },
  setFiltersResetCount: () => {
    return set((state) => ({ filtersResetCount: state.filtersResetCount + 1 }));
  },
}));

