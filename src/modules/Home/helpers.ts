import { Column, ColumnsFilter } from './TableModels/types';
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

  return columnsFiltersNames.reduce((acc, name) => {
    const column = initialColumns.find((col) => col.name === name);
    if (column) acc.push(column);
    return acc;
  }, [] as typeof initialColumns);
};

const filterColumnsFiltersByColumns = (
  columns: Column[],
  columnsFilters: Partial<ColumnsFilter>,
): Partial<ColumnsFilter> =>
  columns.reduce((acc, column) => {
    if (column.name in columnsFilters) {
      acc[column.name] = columnsFilters[column.name];
    }
    return acc;
  }, {} as Partial<ColumnsFilter>);

export {
  checkColumnsFiltersForEqual,
  filterColumnsByColumnsFilters,
  filterColumnsFiltersByColumns,
};
