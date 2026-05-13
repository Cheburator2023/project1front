import { create } from 'zustand';
import { GridApi } from 'ag-grid-community';
import { Template } from '@shared/api/types';
import { initialColumns as _initialColumns } from '@shared/constants/InitialCollumns';
import { useGlobalStore } from '@shared/stores/globalStore';
import { createSelectors } from '../../../shared/hooks/useSelectors';

const initialColumns = _initialColumns.filter((col) => col.name !== 'relations');

export type ColumnFilterData = {
  colId: string;
  name: string;
  title: string;
  type: string;
  isActive: boolean;
  filterValues: (string | null)[];
  order: number;
};

type TemplateFiltersModalState = {
  isOpen: boolean;
  selectedTemplateId: number | null;
  columnFilters: ColumnFilterData[];
  isAllSelected: boolean;
  isDirty: boolean;
  originalTemplateFilters: ColumnFilterData[] | null;
  quickFilterText: string;
  localGridApi: GridApi | null;
  isEditMode: boolean;
  resetInitialized: boolean;
};

type TemplateFiltersModalActions = {
  openModal: () => void;
  closeModal: () => void;
  setSelectedTemplate: (templateId: number | null) => void;
  setColumnFilters: (filters: ColumnFilterData[]) => void;
  updateColumnFilter: (colId: string, updates: Partial<ColumnFilterData>) => void;
  toggleColumnActive: (colId: string) => void;
  toggleAllColumns: () => void;
  reorderColumns: (startIndex: number, endIndex: number) => void;
  setIsDirty: (dirty: boolean) => void;
  resetState: () => void;
  initializeFromTemplate: (template?: Template) => void;
  hasChanges: () => boolean;
  setQuickFilterText: (text: string) => void;
  setLocalGridApi: (api: GridApi | null) => void;
  toggleEditMode: () => void;
  setResetInitialized: (resetInitialized: boolean) => void;
  hasColumnsChangedAfterReset: () => boolean;
};

type TemplateFiltersModalStore = TemplateFiltersModalState & TemplateFiltersModalActions;

const createColumnFiltersFromInitialColumns = (): ColumnFilterData[] => {
  const agGridApi = useGlobalStore.getState().agGridApi;
  const currentColumnState = agGridApi
    ?.getColumnState()
    ?.filter((col) => col.colId !== 'ag-Grid-ControlsColumn');

  if (currentColumnState && currentColumnState.length > 0) {
    return currentColumnState
      .map((currentCol, index) => {
        const column = initialColumns.find((col) => col.name === currentCol.colId);
        if (!column) return null;

        return {
          colId: column.name,
          name: column.name,
          title: column.title,
          type: column.type,
          isActive: !currentCol.hide,
          filterValues: [],
          order: index,
        };
      })
      .filter(Boolean) as ColumnFilterData[];
  }

  return initialColumns.map((column, index) => ({
    colId: column.name,
    name: column.name,
    title: column.title,
    type: column.type,
    isActive: true,
    filterValues: [],
    order: index,
  }));
};

const initialState: TemplateFiltersModalState = {
  isOpen: false,
  selectedTemplateId: null,
  columnFilters: createColumnFiltersFromInitialColumns(),
  isAllSelected: false,
  isDirty: false,
  originalTemplateFilters: null,
  quickFilterText: '',
  localGridApi: null,
  isEditMode: false,
  resetInitialized: false,
};

export const useTemplateFiltersModalStore = create<TemplateFiltersModalStore>((set, get) => ({
  ...initialState,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false, isDirty: false }),
  setSelectedTemplate: (templateId) => set({ selectedTemplateId: templateId, isDirty: true }),
  setColumnFilters: (filters) => {
    const isAllSelected = filters.every((f) => f.isActive);
    set({ columnFilters: filters, isAllSelected, isDirty: true });
  },
  updateColumnFilter: (colId, updates) => {
    const { columnFilters } = get();
    const updatedFilters = columnFilters.map((filter) =>
      filter.colId === colId ? { ...filter, ...updates } : filter,
    );

    const isAllSelected = updatedFilters.every((f) => f.isActive);
    set({ columnFilters: updatedFilters, isAllSelected, isDirty: true });
  },
  toggleColumnActive: (colId) => {
    const { columnFilters, selectedTemplateId } = get();
    const updatedFilters = columnFilters.map((filter) =>
      filter.colId === colId ? { ...filter, isActive: !filter.isActive } : filter,
    );
    const isAllSelected = updatedFilters.every((f) => f.isActive);

    if (selectedTemplateId !== null) {
      set({
        columnFilters: updatedFilters,
        isAllSelected,
        selectedTemplateId: null,
        isDirty: true,
        resetInitialized: false, // Reset the flag when checkbox is clicked
      });
    } else {
      set({
        columnFilters: updatedFilters,
        isAllSelected,
        isDirty: true,
        resetInitialized: false, // Reset the flag when checkbox is clicked
      });
    }
  },
  toggleAllColumns: () => {
    const { columnFilters, isAllSelected, selectedTemplateId } = get();
    const newActiveState = !isAllSelected;
    const updatedFilters = columnFilters.map((filter) => ({
      ...filter,
      isActive: newActiveState,
    }));

    if (selectedTemplateId !== null) {
      set({
        columnFilters: updatedFilters,
        isAllSelected: newActiveState,
        selectedTemplateId: null,
        isDirty: true,
        resetInitialized: false, // Reset the flag when select all checkbox is clicked
      });
    } else {
      set({
        columnFilters: updatedFilters,
        isAllSelected: newActiveState,
        isDirty: true,
        resetInitialized: false, // Reset the flag when select all checkbox is clicked
      });
    }
  },
  reorderColumns: (startIndex, endIndex) => {
    const { columnFilters, selectedTemplateId } = get();
    const result = Array.from(columnFilters);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    const reorderedFilters = result.map((filter, index) => ({
      ...filter,
      order: index,
    }));

    if (selectedTemplateId !== null) {
      set({ columnFilters: reorderedFilters, selectedTemplateId: null, isDirty: true });
    } else {
      set({ columnFilters: reorderedFilters, isDirty: true });
    }
  },
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  resetState: () => {
    const resetColumnFilters = initialColumns.map((column, index) => ({
      colId: column.name,
      name: column.name,
      title: column.title,
      type: column.type,
      isActive: true,
      filterValues: [],
      order: index,
    }));

    const { isOpen } = get();

    set({
      ...initialState,
      isOpen, // Preserve current modal state
      columnFilters: resetColumnFilters,
      originalTemplateFilters: resetColumnFilters, // Update originalTemplateFilters to reset state
      isAllSelected: true,
      isDirty: true,
      resetInitialized: true,
    });
  },
  initializeFromTemplate: (template?: Template) => {
    const agGridApi = useGlobalStore.getState().agGridApi;
    const currentColumnState = agGridApi
      ?.getColumnState()
      ?.filter((col) => col.colId !== 'ag-Grid-ControlsColumn');

    const baseColumns = createColumnFiltersFromInitialColumns();

    if (template) {
      let mergedColumns: ColumnFilterData[];

      // Get current filter model from AgGrid to include newly added filters
      const currentFilterModel = agGridApi?.getFilterModel() || {};

      if (template.columnState && template.columnState.length > 0) {
        mergedColumns = template.columnState
          .map((templateCol, index) => {
            const baseColumn = baseColumns.find((col) => col.colId === templateCol.colId);
            if (!baseColumn) return null;

            // Check both template filter and current filter model
            const templateFilter = template.filterModel?.[templateCol.colId];
            const currentFilter = currentFilterModel[templateCol.colId];

            let filterValues: (string | null)[] = [];
            // Prioritize current filter over template filter to show newly added filters
            const activeFilter = currentFilter || templateFilter;
            if (activeFilter) {
              if ('values' in activeFilter && activeFilter.values) {
                filterValues = activeFilter.values;
              } else if ('dateFrom' in activeFilter && 'dateTo' in activeFilter) {
                const dateFilter = activeFilter as { dateFrom: string; dateTo: string };
                const dateRange: (string | null)[] = [];
                if (dateFilter.dateFrom) dateRange.push(dateFilter.dateFrom);
                if (dateFilter.dateTo) dateRange.push(dateFilter.dateTo);
                filterValues = dateRange;
              }
            }

            let isActive = !templateCol.hide;
            if (filterValues.length > 0) {
              isActive = true;
            }

            return {
              ...baseColumn,
              isActive,
              filterValues,
              order: index,
            };
          })
          .filter((col): col is ColumnFilterData => col !== null);

        const missingColumns = baseColumns.filter(
          (baseCol) =>
            !template.columnState?.some((templateCol) => templateCol.colId === baseCol.colId),
        );

        missingColumns.forEach((missingCol, index) => {
          // Check both template filter and current filter model for missing columns
          const templateFilter = template.filterModel?.[missingCol.colId];
          const currentFilter = currentFilterModel[missingCol.colId];

          let filterValues: (string | null)[] = [];
          // Prioritize current filter over template filter to show newly added filters
          const activeFilter = currentFilter || templateFilter;
          if (activeFilter) {
            if ('values' in activeFilter && activeFilter.values) {
              filterValues = activeFilter.values;
            } else if ('dateFrom' in activeFilter && 'dateTo' in activeFilter) {
              const dateFilter = activeFilter as { dateFrom: string; dateTo: string };
              const dateRange: (string | null)[] = [];
              if (dateFilter.dateFrom) dateRange.push(dateFilter.dateFrom);
              if (dateFilter.dateTo) dateRange.push(dateFilter.dateTo);
              filterValues = dateRange;
            }
          }

          mergedColumns.push({
            ...missingCol,
            isActive: filterValues.length > 0,
            filterValues,
            order: mergedColumns.length + index,
          });
        });
      } else {
        if (currentColumnState && currentColumnState.length > 0) {
          mergedColumns = currentColumnState
            .map((currentCol, index) => {
              const baseColumn = baseColumns.find((col) => col.colId === currentCol.colId);
              if (!baseColumn) return null;

              // Check both template filter and current filter model
              const templateFilter = template.filterModel?.[baseColumn.colId];
              const currentFilter = currentFilterModel[baseColumn.colId];

              let filterValues: (string | null)[] = [];
              // Prioritize current filter over template filter to show newly added filters
              const activeFilter = currentFilter || templateFilter;
              if (activeFilter) {
                if ('values' in activeFilter && activeFilter.values) {
                  filterValues = activeFilter.values;
                } else if ('dateFrom' in activeFilter && 'dateTo' in activeFilter) {
                  const dateFilter = activeFilter as { dateFrom: string; dateTo: string };
                  const dateRange: (string | null)[] = [];
                  if (dateFilter.dateFrom) dateRange.push(dateFilter.dateFrom);
                  if (dateFilter.dateTo) dateRange.push(dateFilter.dateTo);
                  filterValues = dateRange;
                }
              }

              return {
                ...baseColumn,
                isActive: !currentCol.hide,
                filterValues,
                order: index,
              };
            })
            .filter(Boolean) as ColumnFilterData[];
        } else {
          mergedColumns = baseColumns.map((baseColumn) => {
            // Check both template filter and current filter model
            const templateFilter = template.filterModel?.[baseColumn.colId];
            const currentFilter = currentFilterModel[baseColumn.colId];

            let filterValues: (string | null)[] = [];
            // Prioritize current filter over template filter to show newly added filters
            const activeFilter = currentFilter || templateFilter;
            if (activeFilter) {
              if ('values' in activeFilter && activeFilter.values) {
                filterValues = activeFilter.values;
              } else if ('dateFrom' in activeFilter && 'dateTo' in activeFilter) {
                const dateFilter = activeFilter as { dateFrom: string; dateTo: string };
                const dateRange: (string | null)[] = [];
                if (dateFilter.dateFrom) dateRange.push(dateFilter.dateFrom);
                if (dateFilter.dateTo) dateRange.push(dateFilter.dateTo);
                filterValues = dateRange;
              }
            }

            return {
              ...baseColumn,
              isActive: true,
              filterValues,
              order: baseColumn.order,
            };
          });
        }
      }

      const isAllSelected = mergedColumns.every((f) => f.isActive);
      set({
        columnFilters: mergedColumns,
        isAllSelected,
        selectedTemplateId: template.template_id,
        originalTemplateFilters: JSON.parse(JSON.stringify(mergedColumns)),
      });
    } else {
      let defaultColumns: ColumnFilterData[];

      // Get current filter model from AgGrid to include newly added filters even when no template is selected
      const currentFilterModel = agGridApi?.getFilterModel() || {};

      if (currentColumnState && currentColumnState.length > 0) {
        defaultColumns = currentColumnState
          .map((currentCol, index) => {
            const baseColumn = baseColumns.find((col) => col.colId === currentCol.colId);
            if (!baseColumn) return null;

            // Check current filter model for newly added filters
            const currentFilter = currentFilterModel[currentCol.colId];
            let filterValues: (string | null)[] = [];
            if (currentFilter) {
              if ('values' in currentFilter && currentFilter.values) {
                filterValues = currentFilter.values;
              } else if ('dateFrom' in currentFilter && 'dateTo' in currentFilter) {
                const dateFilter = currentFilter as { dateFrom: string; dateTo: string };
                const dateRange: (string | null)[] = [];
                if (dateFilter.dateFrom) dateRange.push(dateFilter.dateFrom);
                if (dateFilter.dateTo) dateRange.push(dateFilter.dateTo);
                filterValues = dateRange;
              }
            }

            return {
              ...baseColumn,
              isActive: !currentCol.hide,
              order: index,
              filterValues,
            };
          })
          .filter(Boolean) as ColumnFilterData[];
      } else {
        defaultColumns = baseColumns.map((column) => {
          // Check current filter model for newly added filters
          const currentFilter = currentFilterModel[column.colId];
          let filterValues: (string | null)[] = [];
          if (currentFilter) {
            if ('values' in currentFilter && currentFilter.values) {
              filterValues = currentFilter.values;
            } else if ('dateFrom' in currentFilter && 'dateTo' in currentFilter) {
              const dateFilter = currentFilter as { dateFrom: string; dateTo: string };
              const dateRange: (string | null)[] = [];
              if (dateFilter.dateFrom) dateRange.push(dateFilter.dateFrom);
              if (dateFilter.dateTo) dateRange.push(dateFilter.dateTo);
              filterValues = dateRange;
            }
          }

          return {
            ...column,
            isActive: true,
            filterValues,
          };
        });
      }

      const isAllSelected = defaultColumns.every((f) => f.isActive);
      set({
        columnFilters: defaultColumns,
        isAllSelected,
        selectedTemplateId: null,
        originalTemplateFilters: null,
      });
    }
  },

  hasChanges: () => {
    const { columnFilters, originalTemplateFilters, selectedTemplateId, isDirty } = get();

    // If any action was performed (isDirty flag is set), return true
    if (isDirty) {
      return true;
    }

    // If no template is selected and no original template filters exist, check if current filters differ from default state
    if (selectedTemplateId === null) {
      if (!originalTemplateFilters) {
        // Compare with initial state - check if any column has filters or is inactive
        return columnFilters.some((column) => column.filterValues.length > 0 || !column.isActive);
      }
      // If we have original template filters but no selected template, compare against them
      return columnFilters.some((current, index) => {
        const original = originalTemplateFilters[index];
        if (!original) return true;

        return (
          current.isActive !== original.isActive ||
          current.order !== original.order ||
          current.colId !== original.colId ||
          current.filterValues.length !== original.filterValues.length ||
          current.filterValues.some(
            (value, valueIndex) => value !== original.filterValues[valueIndex],
          )
        );
      });
    }

    if (!originalTemplateFilters) {
      return true;
    }

    if (columnFilters.length !== originalTemplateFilters.length) {
      return true;
    }

    return columnFilters.some((current, index) => {
      const original = originalTemplateFilters[index];

      // Check for basic property changes
      if (
        current.isActive !== original.isActive ||
        current.order !== original.order ||
        current.colId !== original.colId
      ) {
        return true;
      }

      // Check for filterValues changes
      if (current.filterValues.length !== original.filterValues.length) {
        return true;
      }

      return current.filterValues.some(
        (value, valueIndex) => value !== original.filterValues[valueIndex],
      );
    });
  },

  setQuickFilterText: (text) => set({ quickFilterText: text }),

  setLocalGridApi: (api) => set({ localGridApi: api }),

  toggleEditMode: () => {
    const { isEditMode, originalTemplateFilters, columnFilters } = get();
    const newEditMode = !isEditMode;

    if (newEditMode && !originalTemplateFilters) {
      set({
        isEditMode: newEditMode,
        originalTemplateFilters: columnFilters,
      });
    } else if (!newEditMode && originalTemplateFilters) {
      const restoredFilters = originalTemplateFilters;
      const isAllSelected = restoredFilters.every((filter) => filter.isActive);

      set({
        isEditMode: newEditMode,
        columnFilters: restoredFilters,
        isAllSelected,
        isDirty: false,
      });
    } else {
      set({ isEditMode: newEditMode });
    }
  },

  setResetInitialized: (resetInitialized) => set({ resetInitialized }),

  hasColumnsChangedAfterReset: () => {
    const { resetInitialized, columnFilters } = get();

    if (!resetInitialized) {
      return false;
    }

    // Check if any column's isActive state differs from the reset state (all true)
    return columnFilters.some((column) => !column.isActive);
  },
}));

export const useTemplateFiltersModalStoreSelected = createSelectors(useTemplateFiltersModalStore);

