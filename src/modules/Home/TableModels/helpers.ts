import { NOT_NULL_OPTION } from 'src/components/SearchSelect/constants';
import { COLUMN_TYPE, Column, ColumnsFilter, Row } from './types';

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
  rows: Array<Partial<Row> & { id: string }>;
  page: number;
  pageSize: number;
}) => {
  const startRowIndex = page > 1 ? pageSize * page - pageSize : 0;
  const lastRowIndex = (page > 1 ? pageSize * page : pageSize) - 1;

  return rows.slice(startRowIndex, lastRowIndex);
};

const getFilteredRowsBySearch = (
  rows: Array<Partial<Row> & { id: string }>,
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

const getColumnFilterOptions = (
  rowList: Array<Partial<Row> & { id: string }>,
  columnName: keyof Row,
) => {
  const uniqueColumnValues = rowList.reduce((columnValues, row) => {
    const columnValue = row[columnName];

    if (columnValue && !columnValues.includes(columnValue)) {
      return [...columnValues, columnValue];
    }

    return columnValues;
  }, [] as string[]);

  return uniqueColumnValues.map((columnValue) => ({
    value: `${columnValue}`,
    text: `${columnValue}`,
  }));
};

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
  tableRows: Array<Partial<Row> & { id: string }>,
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

      // Check for not-null filter
      if (fieldFilters?.includes(NOT_NULL_OPTION.value)) {
        if (!fieldValue) {
          return false;
        }

        if (fieldFilters?.length === 1) {
          return true;
        }
      }

      return fieldValue && fieldFilters.includes(fieldValue);
    });

    // Compare passed fields with initial fields to make decision
    return rowFields.length === rowPassedFields.length;
  });
};

export {
  getTime as StrToTime,
  compare,
  getPageRows,
  getFilteredRowsBySearch,
  getFilteredRowsByColumnsFilter,
  getValuesColumnsFilterOptions,
  getColumnFilterOptions,
};
