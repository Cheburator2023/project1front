/* eslint-disable no-restricted-syntax */
import { EMPTY_OPTION, NOT_NULL_OPTION } from '@shared/ui/organisms';
import { format, isValid, isWithinInterval, parse } from 'date-fns';

import { COLUMN_TYPE, Column, ColumnsFilter, Row } from '@shared/types';
import { DATE_FORMATS } from '@shared/constants';

const getISODateFormat = (dateString: string) => {
  for (const dateFormat of DATE_FORMATS) {
    const parseDate = parse(dateString, dateFormat, new Date());
    if (isValid(parseDate)) return format(parseDate, 'yyyy-mm-dd');
  }

  return dateString;
};

const getTime = (value: unknown) => {
  if (typeof value === 'string') {
    return new Date(value.split('.').reverse().join('-')).getTime();
  }

  return 0;
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
) => {
  return rows.filter((row) =>
    colNames.some((colName) =>
      String(row[colName]).toLowerCase().includes(searchString.toLowerCase()),
    ),
  );
};



const getColumnFilterOptions = (
  rowList: Array<Partial<Row>>,
  columnName: keyof Row,
) =>
  rowList?.reduce(
    (columnValues, row) => {
      const columnValue = row[columnName];

      if (columnValue) {
        const isUniqueValue = !columnValues.find((item) => item.value === columnValue);

        if (!isUniqueValue) {
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



const checkColumnsFiltersForEqual = (
  columnsFilters: Partial<ColumnsFilter>,
  newColumnsFilters: Partial<ColumnsFilter>,
) => {
  const columnsFiltersStr = Object.keys(columnsFilters).sort();
  const newColumnsFiltersStr = Object.keys(newColumnsFilters).sort();

  return columnsFiltersStr === newColumnsFiltersStr;
};
const filterColumnsByColumnsFilters = (
  columnsFilters: Partial<ColumnsFilter>,
  initialColumns: Column[],
) => {
  const columnsFiltersNames = Object.keys(columnsFilters);

  return columnsFiltersNames.reduce((acc, name) => {
    const column = initialColumns.find((col) => col.name === name);
    if (column) acc.push(column);
    return acc;
  }, [] as typeof initialColumns);
};



export {
  getTime,
  getPageRows,
  getFilteredRowsBySearch,
  getValuesColumnsFilterOptions,
  getColumnFilterOptions,
  checkColumnsFiltersForEqual,
  filterColumnsByColumnsFilters,
  getISODateFormat,
};
