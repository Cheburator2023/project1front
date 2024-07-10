import { COLUMN_TYPE, ColumnsFilter } from '../TableModels/types';
import { initialColumns } from '../constants';

export const getActiveFiltersCount = (columnsFilters: Partial<ColumnsFilter>) =>
  Object.entries(columnsFilters).flatMap(([columnName, filters]) => {
    const filterType = initialColumns.find((column) => column.name === columnName)?.type;

    if (filterType === COLUMN_TYPE.DATE && filters.length) {
      return filters.join(' - ');
    }

    return filters;
  }).length;
