import { create } from 'zustand';
import { initialTopFilters } from '@shared/constants';
import { TopFilters, COLUMN_TYPE } from '@shared/types';
import { useGlobalStore } from './globalStore';

interface FiltersState {
  filterModel: any;
  sortState: Array<{
    colId: string;
    sort: 'asc' | 'desc';
    sortIndex: number;
  }>;
  selectedIds: string[];
  firstDate: string | null;
  secondDate: string | null;
  modelsDownloadingDate?: string;
  topFilters: TopFilters;
}

interface FiltersActions {
  setFilterModel: (filterModel: any) => void;
  setSortState: (sortState: Array<{ colId: string; sort: 'asc' | 'desc'; sortIndex: number; }>) => void;
  setSelectedIds: (selectedIds: string[]) => void;
  setFirstDate: (date: string | null) => void;
  setSecondDate: (date: string | null) => void;
  setModelsDownloadingDate: (date: string) => void;
  setTopFilters: (filters: TopFilters) => void;
  resetFilters: () => void;
}

export type FiltersStore = FiltersState & FiltersActions;

export const useFiltersStore = create<FiltersStore>((set, get) => ({
  filterModel: {},
  sortState: [],
  selectedIds: [],
  firstDate: null,
  secondDate: null,
  modelsDownloadingDate: undefined,
  topFilters: initialTopFilters,

  setFilterModel: (filterModel) => {
    set({ filterModel });
  },

  setSortState: (sortState) => {
    set({ sortState });
  },

  setSelectedIds: (selectedIds) => set({ selectedIds }),
  setFirstDate: (date) => set({ firstDate: date }),
  setSecondDate: (date) => set({ secondDate: date }),
  setModelsDownloadingDate: (date) => set({ modelsDownloadingDate: date }),
  setTopFilters: (filters) => set({ topFilters: filters }),







  resetFilters: () => {
    const { agGridApi } = useGlobalStore.getState();
    
    set({
      filterModel: {},
      sortState: [],
      selectedIds: [],
      topFilters: initialTopFilters,
      firstDate: null,
      secondDate: null,
      modelsDownloadingDate: undefined,
    });

    if (agGridApi) {
      agGridApi.setFilterModel(null);
      agGridApi.applyColumnState({
        defaultState: { sort: null },
      });
    }
  },
}));