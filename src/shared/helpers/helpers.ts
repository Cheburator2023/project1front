import { EMPTY_OPTION, NOT_NULL_OPTION } from '@shared/ui/organisms';
import { isWithinInterval } from 'date-fns';

import { COLUMN_TYPE, Column, ColumnsFilter, Row } from '@shared/types';
import { initialColumns } from '@shared/constants';

const getTime = (value: unknown) => {
  if (typeof value === 'string') {
    return new Date(value.split('.').reverse().join('-')).getTime();
  }

  return 0;
};

const compare = (
  a: Partial<Row>,
  b: Partial<Row>,
  colName: keyof Row,
  colType: COLUMN_TYPE,
  sort: 'asc' | 'desc',
) => {
  const aValue = a[colName] ?? 0;
  const bValue = b[colName] ?? 0;

  if (sort === 'asc') {
    switch (colType) {
      case COLUMN_TYPE.DATE: {
        return getTime(aValue) - getTime(bValue);
      }
      case COLUMN_TYPE.NUMBER:
        return Number(aValue) - Number(bValue);
      default:
        if (aValue < bValue) {
          return -1;
        }
        if (aValue > bValue) {
          return 1;
        }
        return 0;
    }
  } else {
    switch (colType) {
      case COLUMN_TYPE.DATE:
        return getTime(bValue) - getTime(aValue);
      case COLUMN_TYPE.NUMBER:
        return Number(bValue) - Number(aValue);
      default:
        if (aValue < bValue) {
          return 1;
        }
        if (aValue > bValue) {
          return -1;
        }
        return 0;
    }
  }
};

const getPageRows = ({
  rows,
  page,
  pageSize,
}: {
  rows: Array<Partial<Row>>;
  page: number;
  pageSize: number;
}) => {
  const startRowIndex = page > 1 ? pageSize * page - pageSize : 0;
  const lastRowIndex = page > 1 ? pageSize * page : pageSize;

  return rows.slice(startRowIndex, lastRowIndex);
};

const getFilteredRowsBySearch = (
  rows: Array<Partial<Row>>,
  colNames: Array<keyof Row>,
  searchString: string,
) =>
  rows.filter(
    (row) =>
      colNames
        .map((colName) => row[colName])
        .join(' ')
        .toLowerCase()
        .split(searchString.toLowerCase()).length > 1,
  );

const getColumnFilterOptionVisibilityStatus = (
  columnValue: string,
  rowId?: string,
  filteredRowsIds?: string[],
  activeColumnFilters?: string[],
) => {
  // Check for filtered row
  const isCurrentRowPassedFilters = !!(rowId && filteredRowsIds?.includes(rowId));

  // Check for active filters
  const isCurrentFilterActive = !!(
    activeColumnFilters &&
    activeColumnFilters.length &&
    activeColumnFilters.includes(columnValue)
  );

  return isCurrentFilterActive || isCurrentRowPassedFilters;
};

const getColumnFilterOptions = (
  rowList: Array<Partial<Row>>,
  columnName: keyof Row,
  columnsFilters?: Partial<ColumnsFilter>,
  filteredRowsIds?: Array<string>,
) =>
  rowList.reduce(
    (columnValues, row) => {
      const columnValue = row[columnName];
      const activeColumnFilters = columnsFilters?.[columnName];

      if (columnValue) {
        // Check for unique value
        const isUniqueValue = !columnValues.find((item) => item.value === columnValue);

        const isVisibleValue = getColumnFilterOptionVisibilityStatus(
          columnValue,
          row.id,
          filteredRowsIds,
          activeColumnFilters,
        );

        if (!isUniqueValue || !isVisibleValue) {
          return columnValues;
        }

        return [
          ...columnValues,
          {
            value: columnValue,
            text: columnValue,
          },
        ];
      }

      return columnValues;
    },
    [] as Array<{
      value: string;
      text: string;
    }>,
  );

const getValueColumnFilterOptions = (
  columnName: keyof Row,
  rowList: Row[],
  templateFilters?: Partial<ColumnsFilter>,
) => {
  if (templateFilters?.[columnName]) {
    return templateFilters[columnName];
  }

  return getColumnFilterOptions(rowList, columnName).map(({ value }) => value);
};

const getValuesColumnsFilterOptions = (
  columnList: Column[],
  rowList: Row[],
  templateFilters?: Partial<ColumnsFilter>,
) =>
  columnList.reduce(
    (prevValue, column) => ({
      ...prevValue,
      [column.name]: getValueColumnFilterOptions(column.name, rowList, templateFilters),
    }),
    {} as ColumnsFilter,
  );

const getFilteredRowsByColumnsFilter = (
  tableRows: Array<Partial<Row>>,
  columnsFilter: Partial<ColumnsFilter>,
) => {
  const rowFields = Object.keys(columnsFilter) as Array<keyof Row>;

  return tableRows.filter((row) => {
    // Check each row field for passing filters
    const rowPassedFields = rowFields.filter((fieldName) => {
      const fieldFilters = columnsFilter[fieldName];

      // Check if column doesn't have filters
      if (!fieldFilters?.length) {
        return true;
      }

      const fieldValue = row[fieldName];

      // Check for column type
      const columnType = initialColumns.find((column) => column.name === fieldName)?.type;

      if (!columnType) {
        return false;
      }

      if (columnType === COLUMN_TYPE.DATE) {
        if (!fieldValue || fieldValue === 'invalid date') {
          return false;
        }

        const fieldValueDateString = new Date(fieldValue.split(' ')[0]);

        if (!fieldValueDateString) {
          return false;
        }

        const [start, end] = [new Date(fieldFilters[0]), new Date(fieldFilters[1])];

        if (!fieldValueDateString || !start || !end) {
          return false;
        }

        return isWithinInterval(fieldValueDateString, {
          start,
          end,
        });
      }

      // Check for not-null and empty filter
      if (
        fieldFilters?.includes(NOT_NULL_OPTION.value) &&
        fieldFilters?.includes(EMPTY_OPTION.value)
      ) {
        return true;
      }

      // Check for not-null filter
      if (fieldFilters?.includes(NOT_NULL_OPTION.value)) {
        if (!fieldValue) {
          return false;
        }

        if (fieldFilters?.length === 1) {
          return true;
        }
      }

      // Check for empty filter
      if (fieldFilters?.includes(EMPTY_OPTION.value)) {
        if (!fieldValue) {
          return true;
        }

        if (fieldFilters?.length === 1) {
          return false;
        }
      }

      return fieldValue && fieldFilters.includes(fieldValue);
    });

    // Compare passed fields with initial fields to make decision
    return rowFields.length === rowPassedFields.length;
  });
};

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
  getTime,
  compare,
  getPageRows,
  getFilteredRowsBySearch,
  getFilteredRowsByColumnsFilter,
  getValuesColumnsFilterOptions,
  getColumnFilterOptions,
  checkColumnsFiltersForEqual,
  filterColumnsByColumnsFilters,
  filterColumnsFiltersByColumns,
};
