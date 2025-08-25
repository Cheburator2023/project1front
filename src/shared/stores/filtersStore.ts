import { create } from 'zustand';
import { initialTopFilters } from '@shared/constants';
import { TopFilters, COLUMN_TYPE } from '@shared/types';
import { useGlobalStore } from './globalStore';

interface FiltersState {
  agGridFilterModel: any;
  agGridSortModel: any[];
  firstDate: string | null;
  secondDate: string | null;
  modelsDownloadingDate?: string;
  topFilters: TopFilters;
}

interface FiltersActions {
  setAgGridFilterModel: (filterModel: any) => void;
  setAgGridSortModel: (sortModel: any[]) => void;
  setFirstDate: (date: string | null) => void;
  setSecondDate: (date: string | null) => void;
  setModelsDownloadingDate: (date: string) => void;
  setTopFilters: (filters: TopFilters) => void;
  resetFilters: () => void;
  applyFilterToGrid: (columnName: string, filterValues: string[], columnType?: COLUMN_TYPE) => void;
  applySortToGrid: (columnName: string, sortDirection: 'asc' | 'desc' | null) => void;
  getColumnsFilters: () => Record<string, string[]>;
}

export type FiltersStore = FiltersState & FiltersActions;

export const useFiltersStore = create<FiltersStore>((set, get) => ({
  agGridFilterModel: {},
  agGridSortModel: [],
  firstDate: null,
  secondDate: null,
  modelsDownloadingDate: undefined,
  topFilters: initialTopFilters,

  setAgGridFilterModel: (filterModel) => {
    set({ agGridFilterModel: filterModel });
    const { agGridApi } = useGlobalStore.getState();
    if (agGridApi) {
      agGridApi.setFilterModel(filterModel);
    }
  },

  setAgGridSortModel: (sortModel) => {
    set({ agGridSortModel: sortModel });
    const { agGridApi } = useGlobalStore.getState();
    if (agGridApi) {
      agGridApi.applyColumnState({
        state: sortModel.map(sort => ({
          colId: sort.colId,
          sort: sort.sort,
        })),
        defaultState: { sort: null },
      });
    }
  },

  setFirstDate: (date) => set({ firstDate: date }),
  setSecondDate: (date) => set({ secondDate: date }),
  setModelsDownloadingDate: (date) => set({ modelsDownloadingDate: date }),
  setTopFilters: (filters) => set({ topFilters: filters }),

  applyFilterToGrid: (columnName, filterValues, columnType) => {
    const { agGridFilterModel } = get();
    const { agGridApi } = useGlobalStore.getState();
    
    if (!agGridApi) return;

    const newFilterModel = { ...agGridFilterModel };

    if (filterValues.length === 0) {
      delete newFilterModel[columnName];
    } else {
      if (columnType === COLUMN_TYPE.DATE) {
        if (filterValues.length === 2) {
          if (filterValues[0] === filterValues[1]) {
            newFilterModel[columnName] = {
              dateFrom: filterValues[0],
              dateTo: null,
              type: 'equals',
            };
          } else {
            newFilterModel[columnName] = {
              dateFrom: filterValues[0],
              dateTo: filterValues[1],
              type: 'inRange',
            };
          }
        }
      } else {
        newFilterModel[columnName] = {
          values: filterValues,
        };
      }
    }

    set({ agGridFilterModel: newFilterModel });
    agGridApi.setFilterModel(newFilterModel);
  },

  applySortToGrid: (columnName, sortDirection) => {
    const { agGridApi } = useGlobalStore.getState();
    
    if (!agGridApi) return;

    const newSortModel = sortDirection ? [{ colId: columnName, sort: sortDirection }] : [];
    
    set({ agGridSortModel: newSortModel });
    agGridApi.applyColumnState({
      state: newSortModel.map(sort => ({
        colId: sort.colId,
        sort: sort.sort,
      })),
      defaultState: { sort: null },
    });
  },

  getColumnsFilters: () => {
    const { agGridFilterModel } = get();
    const columnsFilters: Record<string, string[]> = {};

    Object.entries(agGridFilterModel).forEach(([columnName, filterData]: [string, any]) => {
      if (filterData?.values) {
        columnsFilters[columnName] = filterData.values;
      } else if (filterData?.dateFrom) {
        if (filterData.dateTo) {
          columnsFilters[columnName] = [filterData.dateFrom, filterData.dateTo];
        } else {
          columnsFilters[columnName] = [filterData.dateFrom, filterData.dateFrom];
        }
      }
    });

    return columnsFilters;
  },

  resetFilters: () => {
    const { agGridApi } = useGlobalStore.getState();
    
    set({
      agGridFilterModel: {},
      agGridSortModel: [],
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