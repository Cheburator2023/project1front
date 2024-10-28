import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { T } from '@admiral-ds/react-ui';

import { Column, COLUMN_TYPE, ColumnsFilter, Row } from '@shared/types';
import {
  API_ROUTES,
  useFetch,
  CompareModelsResponseType,
  mockedModelsCompareResponse,
} from '@shared/api';
import { filterColumnsByColumnsFilters } from '@shared/helpers';
import { CellWrapper, CellContentFactory } from '@entities';

import { compareValues, prepareFetchParams, processFetchData } from '../helpers';

export const useCompareModels = (columnsFilters: Partial<ColumnsFilter>) => {
  const cellRef = useRef(null);
  const [compareOnlyChanged, setCompareOnlyChanged] = useState(true);

  // Table data
  const [resData, setResData] = useState<CompareModelsResponseType | undefined>(undefined);
  const [rowList, setRowList] = useState<Array<Partial<Row> & { comparisonKey: string }>>([]);
  const [columnList, setColumnList] = useState<Column[]>(
    filterColumnsByColumnsFilters(columnsFilters),
  );

  const [searchString, setSearchString] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState<number>(0);

  const { mutationProtectedFetch } = useFetch({});

  const handleSubmit = async (
    firstDate: string,
    secondDate: string,
    compareOnlyChanged: boolean,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await mutationProtectedFetch<
        CompareModelsResponseType,
        CompareModelsResponseType
      >({
        fetchApiRoute: API_ROUTES.COMPARE_MODELS,
        fetchMethod: 'GET',
        // mockedResponse: mockedModelsCompareResponse,
        newParams: prepareFetchParams(firstDate, secondDate),
      });

      if (res?.error) {
        setError('Ошибка загрузки');
      }

      setResData(res?.data as CompareModelsResponseType);
      const formattedRows = await processFetchData(
        res?.data as CompareModelsResponseType,
        columnList,
        compareOnlyChanged,
      );

      setRowList(formattedRows);
      setTotalRows(formattedRows.length);
      setLoading(false);
    } catch (error) {
      setError('Ошибка загрузки');
      setLoading(false);
    }
  };

  const updateColumnList = () => {
    const newColumnList = filterColumnsByColumnsFilters(columnsFilters);
    const renderedColumnList = newColumnList.map((column) => {
      return {
        ...column,
        renderCell: (data: any, row: Partial<Row> & { comparisonKey: number }) =>
          cellRender(data, row, column.name as keyof Row, column),
      };
    });

    setColumnList(renderedColumnList);
  };

  useEffect(() => {
    updateColumnList();
  }, [columnsFilters, resData]);

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

  const cellRender = (
    value: string,
    record: Partial<Row> & { comparisonKey: number },
    field: keyof Row,
    column: Column,
  ): ReactNode => {
    const { comparisonKey } = record;

    const rowsToCompare = resData?.data?.cards[comparisonKey];

    const backgroundColor = record?.id
      ? record.id[record.id?.length - 1] === '1'
        ? undefined
        : compareValues(rowsToCompare?.[0][field], rowsToCompare?.[1][field])
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
      setColumnList,
      handleSearch,
      handleChangePage,
      handleSubmit,
      loading,
      error,
      searchString,
      setTotalRows,
      pageSize,
      setPageSize,
      page,
      setPage,
      totalRows,
      compareOnlyChanged,
      setCompareOnlyChanged,
    },
  };
};
