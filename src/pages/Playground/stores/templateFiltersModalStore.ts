import { create } from 'zustand';
import { Template } from '@shared/api/types';
import { Column } from '@shared/types';
import { initialColumns } from '@shared/constants/InitialCollumns';

export type ColumnFilterData = {
  colId: string;
  name: string;
  title: string;
  type: string;
  isActive: boolean;
  filterValues: string[];
  order: number;
};

type TemplateFiltersModalState = {
  isOpen: boolean;
  selectedTemplateId: number | null;
  columnFilters: ColumnFilterData[];
  isAllSelected: boolean;
  isDirty: boolean;
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
};

type TemplateFiltersModalStore = TemplateFiltersModalState & TemplateFiltersModalActions;

const createColumnFiltersFromInitialColumns = (): ColumnFilterData[] => {
  return initialColumns.map((column, index) => ({
    colId: column.name,
    name: column.name,
    title: column.title,
    type: column.type,
    isActive: false,
    filterValues: [],
    order: index
  }));
};

const initialState: TemplateFiltersModalState = {
  isOpen: false,
  selectedTemplateId: null,
  columnFilters: createColumnFiltersFromInitialColumns(),
  isAllSelected: false,
  isDirty: false,
};

export const useTemplateFiltersModalStore = create<TemplateFiltersModalStore>((set, get) => ({
  ...initialState,

  openModal: () => set({ isOpen: true }),

  closeModal: () => set({ isOpen: false, isDirty: false }),

  setSelectedTemplate: (templateId) => set({ selectedTemplateId: templateId, isDirty: true }),

  setColumnFilters: (filters) => {
    const isAllSelected = filters.every(f => f.isActive);
    set({ columnFilters: filters, isAllSelected, isDirty: true });
  },

  updateColumnFilter: (colId, updates) => {
    const { columnFilters } = get();
    const updatedFilters = columnFilters.map(filter =>
      filter.colId === colId ? { ...filter, ...updates } : filter
    );
    const isAllSelected = updatedFilters.every(f => f.isActive);
    set({ columnFilters: updatedFilters, isAllSelected, isDirty: true });
  },

  toggleColumnActive: (colId) => {
    const { columnFilters } = get();
    const updatedFilters = columnFilters.map(filter =>
      filter.colId === colId ? { ...filter, isActive: !filter.isActive } : filter
    );
    const isAllSelected = updatedFilters.every(f => f.isActive);
    set({ columnFilters: updatedFilters, isAllSelected, isDirty: true });
  },

  toggleAllColumns: () => {
    const { columnFilters, isAllSelected } = get();
    const newActiveState = !isAllSelected;
    const updatedFilters = columnFilters.map(filter => ({
      ...filter,
      isActive: newActiveState
    }));
    set({ columnFilters: updatedFilters, isAllSelected: newActiveState, isDirty: true });
  },

  reorderColumns: (startIndex, endIndex) => {
    const { columnFilters } = get();
    const result = Array.from(columnFilters);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    const reorderedFilters = result.map((filter, index) => ({
      ...filter,
      order: index
    }));

    set({ columnFilters: reorderedFilters, isDirty: true });
  },

  setIsDirty: (dirty) => set({ isDirty: dirty }),

  resetState: () => set(initialState),

  initializeFromTemplate: (template?: Template) => {
    const baseColumns = createColumnFiltersFromInitialColumns();

    if (template && template.filterModel) {
      const mergedColumns = baseColumns.map(baseColumn => {
        const templateFilter = template.filterModel?.[baseColumn.colId];
         if (templateFilter) {
           let filterValues: string[] = [];

           if ('values' in templateFilter && templateFilter.values) {
              filterValues = templateFilter.values.filter((v): v is string => v !== null);
            } else if ('dateFrom' in templateFilter && 'dateTo' in templateFilter) {
              const dateFilter = templateFilter as { dateFrom: string; dateTo: string };
              const dateRange: string[] = [];
              if (dateFilter.dateFrom) dateRange.push(dateFilter.dateFrom);
              if (dateFilter.dateTo) dateRange.push(dateFilter.dateTo);
              filterValues = dateRange;
            }

          return {
            ...baseColumn,
            isActive: true,
            filterValues,
            order: baseColumn.order
          };
        }
        return {
          ...baseColumn,
          isActive: false
        };
      });

      const isAllSelected = mergedColumns.every(f => f.isActive);
      set({ columnFilters: mergedColumns, isAllSelected, selectedTemplateId: template.template_id });
    } else {
      const defaultColumns = baseColumns.map(column => ({
        ...column,
        isActive: true
      }));
      const isAllSelected = defaultColumns.every(f => f.isActive);
      set({ columnFilters: defaultColumns, isAllSelected, selectedTemplateId: null });
    }
  }
}));
