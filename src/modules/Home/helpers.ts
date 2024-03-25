import { ColumnsFilter } from './TableModels/types';
import { initialColumns } from './constants';

const checkColumnsFiltersForEqual = (
  columnsFilters: Partial<ColumnsFilter>,
  newColumnsFilters: Partial<ColumnsFilter>,
) => {
  const columnsFiltersStr = Object.keys(columnsFilters).sort();
  const newColumnsFiltersStr = Object.keys(newColumnsFilters).sort();

  return columnsFiltersStr === newColumnsFiltersStr;
};

const filterColumnsByColumnsFilters = (columnsFilters: Partial<ColumnsFilter>) => {
  const columnsFiltersNames = Object.keys(columnsFilters);

  return initialColumns.filter(({ name }) => columnsFiltersNames.includes(name));
};

export { checkColumnsFiltersForEqual, filterColumnsByColumnsFilters };
