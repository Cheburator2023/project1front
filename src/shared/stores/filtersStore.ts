import { create } from 'zustand';
import { initialColumnsFilters, initialTopFilters } from '@shared/constants';
import { TopFilters, ColumnsFilter } from '@shared/types';

interface FiltersState {
  columnsFilters: Partial<ColumnsFilter>;
  firstDate: string | null;
  secondDate: string | null;
  modelsDownloadingDate?: string;
  topFilters: TopFilters;
}

interface FiltersActions {
  setColumnsFilters: (filters: Partial<ColumnsFilter>) => void;
  setFirstDate: (date: string | null) => void;
  setSecondDate: (date: string | null) => void;
  setModelsDownloadingDate: (date: string) => void;
  setTopFilters: (filters: TopFilters) => void;
  resetFilters: () => void;
}

export type FiltersStore = FiltersState & FiltersActions;

export const useFiltersStore = create<FiltersStore>((set) => ({
  columnsFilters: initialColumnsFilters,
  firstDate: null,
  secondDate: null,
  modelsDownloadingDate: undefined,
  topFilters: initialTopFilters,

  setColumnsFilters: (filters) => set({ columnsFilters: filters }),
  setFirstDate: (date) => set({ firstDate: date }),
  setSecondDate: (date) => set({ secondDate: date }),
  setModelsDownloadingDate: (date) => set({ modelsDownloadingDate: date }),
  setTopFilters: (filters) => set({ topFilters: filters }),
  resetFilters: () => set({
    columnsFilters: initialColumnsFilters,
    topFilters: initialTopFilters,
    firstDate: null,
    secondDate: null,
    modelsDownloadingDate: undefined,
  }),
}));