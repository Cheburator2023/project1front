import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { T } from '@admiral-ds/react-ui';
import _ from 'lodash';

import { Column, COLUMN_TYPE, ColumnsFilter, Row } from '@shared/types';
import {
  API_ROUTES,
  mockedModelsCompareResponse,
  useFetch,
  CompareModelsResponseType,
} from '@shared/api';
import { filterColumnsByColumnsFilters } from '@shared/helpers';
import { CellWrapper, CellContentFactory } from '@entities';

export const useCompareModels = (
  columnsFilters: Partial<ColumnsFilter>,
  firstDate: string | null,
  secondDate: string | null,
) => {
  const cellRef = useRef(null);

  // Table data
  const [rowList, setRowList] = useState<Array<Partial<Row> & { comparisonKey: string }>>([]);
  const [columnList, setColumnList] = useState<Column[]>(
    filterColumnsByColumnsFilters(columnsFilters),
  );

  const [searchString, setSearchString] = useState<string>('');
  const [compareOnlyChanged, setCompareOnlyChanged] = useState(false);

  // Pagination
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState<number>(0);

  const {
    responseData: compareModelsData,
    loading,
    error,
  } = useFetch<CompareModelsResponseType>({
    apiRoute: API_ROUTES.COMPARE_MODELS,
    mockedResponse: mockedModelsCompareResponse,
    params: { firstDate, secondDate },
  });

  useEffect(() => {
    const newColumnList = filterColumnsByColumnsFilters(columnsFilters);
    const renderedColumnList = newColumnList.map((column) => {
      return {
        ...column,
        renderCell: (data: any, row: Partial<Row> & { comparisonKey: number }) =>
          cellRender(data, row, column.name as keyof Row, column),
      };
    });

    setColumnList(renderedColumnList);
  }, [columnsFilters]);

  useEffect(() => {
    if (compareModelsData) {
      const rowNames = columnList.map((column) => column.name);

      const formattedRows = Object.entries(compareModelsData.data.cards).flatMap(
        ([key, [row1, row2]]) => {
          const preparedRow1 = row1 ? row1 : rowNames;
          const preparedRow2 = row2 ? row2 : rowNames;

          if (
            compareOnlyChanged &&
            _.isEqual(
              Object.entries(preparedRow1).filter((row) => rowNames.includes(row[0] as keyof Row)),
              Object.entries(preparedRow2).filter((row) => rowNames.includes(row[0] as keyof Row)),
            )
          )
            return [];

          return [
            {
              ...preparedRow1,
              id: `${key}-1`,
              key: `${key}-1`,
              comparisonKey: key,
              hover: true,
            },
            {
              ...preparedRow2,
              id: `${key}-2`,
              key: `${key}-2`,
              comparisonKey: key,
              hover: true,
            },
          ];
        },
      );

      setRowList(formattedRows);
      setTotalRows(formattedRows.length);
    }
  }, [compareModelsData, compareOnlyChanged]);

  const handleChangePage = (result: { page: number; pageSize: number }) => {
    if (result.page !== page) {
      setPage(result.page);
    }

    if (result.pageSize !== pageSize) {
      setPageSize(result.pageSize);
    }
  };

  const handleSearch = (newSearchString: string) => {
    if (page !== 1) {
      setPage(1);
    }

    setSearchString(newSearchString);
  };

  const compareValues = (value1: string | null | undefined, value2: string | null | undefined) => {
    return value1 !== value2 ? '#B5FFA9' : undefined;
  };

  const cellRender = (
    value: string,
    record: Partial<Row> & { comparisonKey: number },
    field: keyof Row,
    column: Column,
  ): ReactNode => {
    const { comparisonKey } = record;

    const [row1, row2] = compareModelsData?.data?.cards[comparisonKey];

    const backgroundColor = record?.id
      ? record.id[record.id?.length - 1] === '1'
        ? undefined
        : compareValues(row1[field], row2[field])
      : undefined;

    return (
      <CellWrapper type={COLUMN_TYPE.STRING}>
        <div ref={cellRef}>
          <T font="Body/Body 2 Short" style={{ backgroundColor }}>
            {CellContentFactory({ value, column, row: record, isCompare: true })}
          </T>
        </div>
      </CellWrapper>
    );
  };

  return {
    compareModelsTable: {
      rowList,
      setRowList,
      columnList,
      compareOnlyChanged,
      setCompareOnlyChanged,
      setColumnList,
      handleSearch,
      handleChangePage,
      loading,
      error,
      searchString,
      setTotalRows,
      pageSize,
      setPageSize,
      page,
      setPage,
      totalRows,
    },
  };
};
