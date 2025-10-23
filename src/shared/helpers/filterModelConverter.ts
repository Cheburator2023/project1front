import { ColumnsFilter } from '@shared/types';

/**
 * Converts AgGrid filterModel to columnsFilters format
 * @param filterModel - AgGrid filter model object
 * @returns Partial<ColumnsFilter> - Converted columns filters
 */
export const convertFilterModelToColumnsFilters = (filterModel: any): Partial<ColumnsFilter> => {
  const columnsFilters: Partial<ColumnsFilter> = {};

  if (!filterModel || typeof filterModel !== 'object') {
    return columnsFilters;
  }

  Object.keys(filterModel).forEach((columnKey) => {
    const filter = filterModel[columnKey];

    if (!filter) return;

    // Handle set filters (most common case)
    if (filter.filterType === 'set' && filter.values && Array.isArray(filter.values)) {
      columnsFilters[columnKey as keyof ColumnsFilter] = filter.values;
    }
    // Handle date filters
    else if (filter.filterType === 'date') {
      const dateValues: string[] = [];
      if (filter.dateFrom) dateValues.push(filter.dateFrom);
      if (filter.dateTo) dateValues.push(filter.dateTo);
      if (dateValues.length > 0) {
        columnsFilters[columnKey as keyof ColumnsFilter] = dateValues;
      }
    }
    // Handle other filter types that might have values
    else if (filter.values && Array.isArray(filter.values)) {
      columnsFilters[columnKey as keyof ColumnsFilter] = filter.values;
    }
  });

  return columnsFilters;
};
