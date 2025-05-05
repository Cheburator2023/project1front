import { GridApi } from 'ag-grid-community';
import { create } from 'zustand';

export type GlobalStoreState = {
  filtersResetCount: number;
  agGridApi?: GridApi;
};

export type AppInjectStoreActions = {
  setFiltersResetCount: () => void;
  setAgGridApi: (agGridApi: GridApi) => void;
};

const initialState: GlobalStoreState = {
  filtersResetCount: 0,
};

export const useGlobalStore = create<GlobalStoreState & AppInjectStoreActions>((set) => ({
  filtersResetCount: initialState.filtersResetCount,
  agGridApi: undefined,
  setAgGridApi: (agGridApi: GridApi) => {
    return set({ agGridApi });
  },
  setFiltersResetCount: () => {
    return set((state) => ({ filtersResetCount: state.filtersResetCount + 1 }));
  },
}));

