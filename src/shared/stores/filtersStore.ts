import { create } from 'zustand';
import { useCallback, useMemo } from 'react';
import { initialTopFilters } from '@shared/constants';
import { TopFilters, Column, ColumnsFilter } from '@shared/types';
import { Template } from '@shared/api';
import { getActiveTemplate, getModifiedFilters, isSystemSpecificFilter } from '@shared/helpers';
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
  templates: Template[];
  modifiedFilters: Set<string>;
  columnsFilters: Partial<ColumnsFilter>;
}

interface FiltersActions {
  setFilterModel: (filterModel: any) => void;
  setSortState: (
    sortState: Array<{ colId: string; sort: 'asc' | 'desc'; sortIndex: number }>,
  ) => void;
  setSelectedIds: (selectedIds: string[]) => void;
  setFirstDate: (date: string | null) => void;
  setSecondDate: (date: string | null) => void;
  setModelsDownloadingDate: (date: string) => void;
  setTopFilters: (filters: TopFilters) => void;
  setTemplates: (templates: Template[]) => void;
  setColumnsFilters: (filters: Partial<ColumnsFilter>) => void;
  resetFilters: () => void;
  updateModifiedFilters: () => void;
  getActiveTemplate: () => Template | undefined;
  getIsModifiedFilter: () => boolean;
  getIsTemplateFilter: (filterId: string) => boolean;
  getFilteredColumns: (initialColumns: Column[], showFilterTemplate: boolean) => Column[];
  getShouldResetTemplateOnInitialFilterRemove: (columnFilterName: string) => boolean;
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
  templates: [],
  modifiedFilters: new Set<string>(),
  columnsFilters: {},

  setFilterModel: (filterModel) => {
    set({ filterModel });
    get().updateModifiedFilters();
  },

  setSortState: (sortState) => {
    set({ sortState });
  },

  setSelectedIds: (selectedIds) => set({ selectedIds }),
  setFirstDate: (date) => set({ firstDate: date }),
  setSecondDate: (date) => set({ secondDate: date }),
  setModelsDownloadingDate: (date) => set({ modelsDownloadingDate: date }),
  setTopFilters: (filters) => {
    set({ topFilters: filters });
    get().updateModifiedFilters();
  },
  setTemplates: (templates) => {
    set({ templates });
    get().updateModifiedFilters();
  },
  setColumnsFilters: (filters) => {
    set({ columnsFilters: filters });
    get().updateModifiedFilters();
  },

  updateModifiedFilters: () => {
    const { columnsFilters, getActiveTemplate } = get();
    const activeTemplate = getActiveTemplate();
    const newModifiedFilters = new Set<string>();

    if (activeTemplate) {
      const modifiedFiltersArray = getModifiedFilters(columnsFilters, activeTemplate);
      modifiedFiltersArray.forEach(([filterId]) => {
        newModifiedFilters.add(filterId);
      });
    }

    set({ modifiedFilters: newModifiedFilters });
  },

  getActiveTemplate: () => {
    const { templates, topFilters } = get();
    return getActiveTemplate(templates, topFilters?.[0]);
  },

  getIsModifiedFilter: () => {
    const { columnsFilters, getActiveTemplate } = get();
    const activeTemplate = getActiveTemplate();
    return getModifiedFilters(columnsFilters, activeTemplate).length > 0;
  },

  getIsTemplateFilter: (filterId: string) => {
    const activeTemplate = get().getActiveTemplate();
    return activeTemplate?.filterModel ? filterId in activeTemplate.filterModel : false;
  },

  getFilteredColumns: (initialColumns: Column[], showFilterTemplate: boolean) => {
    const { modifiedFilters, getIsTemplateFilter } = get();
    return initialColumns.filter((column) => {
      const isTemplate = getIsTemplateFilter(column.name);
      const isModified = modifiedFilters.has(column.name);

      if (isSystemSpecificFilter(column.name)) {
        return false;
      }

      return !showFilterTemplate ? isModified || !isTemplate : true;
    });
  },

  getShouldResetTemplateOnInitialFilterRemove: (columnFilterName: string) => {
    const { modifiedFilters, getIsTemplateFilter } = get();
    return getIsTemplateFilter(columnFilterName) && !modifiedFilters.has(columnFilterName);
  },

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
      modifiedFilters: new Set<string>(),
      columnsFilters: {},
    });

    if (agGridApi) {
      agGridApi.setFilterModel(null);
      // Reset column state completely - clear all existing states and show all columns
      agGridApi.applyColumnState({
        state: [],
        defaultState: { sort: null, hide: false },
        applyOrder: false,
      });
    }
  },
}));
