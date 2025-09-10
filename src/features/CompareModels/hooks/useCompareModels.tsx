/* eslint-disable no-nested-ternary */
import React, { ReactNode, useEffect, useRef, useState, useMemo } from 'react';
import { T } from '@admiral-ds/react-ui';

import { Column, COLUMN_TYPE, Row } from '@shared/types';
import { CompareModelsResponseType } from '@shared/api';
import { useModelsControllerCompareModels } from '@shared/api/generated/endpoints';
import { useExploitationModeStore } from '@src/shared/stores';

import { initialColumns } from '@src/shared/constants';
import styled, { css } from 'styled-components';
import { compareValues, prepareFetchParams, processFetchData } from '../helpers';
import { CellContentFactory } from '../../AgGridTables/molecules/CellContentFactory';

export const CellWrapper = styled('div')<{ type: COLUMN_TYPE }>`
  display: block;
  width: 100%;
  margin: 2px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
  ${({ type }) =>
    type === COLUMN_TYPE.NUMBER &&
    css`
      text-align: right;
    `}

  &:hover .actionsContainer {
    opacity: 1;
  }
`;

export const getQueryParams = (
  firstDate: string,
  secondDate: string,
  selectedExploitationModes: string[],
) => {
  let params: Record<string, any> = {};

  if (firstDate && secondDate) {
    params = prepareFetchParams(firstDate, secondDate);
  }

  selectedExploitationModes.forEach((mode, i) => {
    params[`mode[${i}]`] = mode;
  });

  return params;
};

export const useCompareModels = () => {
  const cellRef = useRef(null);
  const [compareOnlyChanged, setCompareOnlyChanged] = useState(true);

  // Table data
  const [resData, setResData] = useState<CompareModelsResponseType | undefined>(undefined);
  const [rowList, setRowList] = useState<Array<Partial<Row> & { comparisonKey: string }>>([]);
  const [columnList, setColumnList] = useState<Column[]>(initialColumns);

  const [searchString, setSearchString] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState<number | undefined>(undefined);

  const selectedExploitationModes = useExploitationModeStore(
    (state) => state.selectedExploitationModes,
  );

  const [queryParams, setQueryParams] = useState<any>(undefined);

  const compareModelsQuery = useModelsControllerCompareModels(queryParams, {
    query: {
      enabled: !!queryParams,
      retry: false,
      refetchOnWindowFocus: true,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
    },
  });

  useEffect(() => {
    const processData = async () => {
      if ((compareModelsQuery as any).data && !(compareModelsQuery as any).isFetching) {
        try {
          const responseData = (compareModelsQuery as any).data as CompareModelsResponseType;
          setResData(responseData);

          const formattedRows = await processFetchData(
            responseData,
            columnList,
            compareOnlyChanged,
          );

          setRowList(formattedRows);
          setTotalRows(formattedRows.length);
        } catch (error) {
          setError('Ошибка обработки данных');
        }
      }
    };

    processData();
  }, [
    (compareModelsQuery as any).data,
    (compareModelsQuery as any).isFetching,
    columnList,
    compareOnlyChanged,
  ]);

  useEffect(() => {
    if ((compareModelsQuery as any).error) {
      setError((compareModelsQuery as any).error.message || 'Ошибка загрузки данных');
    }
  }, [(compareModelsQuery as any).error]);

  useEffect(() => {
    setLoading((compareModelsQuery as any).isFetching || false);
  }, [(compareModelsQuery as any).isFetching]);

  const handleSubmit = async (
    firstDate: string,
    secondDate: string,
    compareOnlyChanged: boolean,
  ) => {
    setError(null);
    const newQueryParams = getQueryParams(firstDate, secondDate, selectedExploitationModes);
    setQueryParams(newQueryParams);
  };

  const cellRender = (
    value: string,
    record: Row & { comparisonKey: number },
    field: keyof Row,
    column: Column,
  ): ReactNode => {
    const { comparisonKey } = record;

    const rowsToCompare = resData?.data?.cards[comparisonKey];

    const backgroundColor = record?.system_model_id
      ? record.system_model_id[`${record.system_model_id}`.length - 1] === '1'
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

  const updateColumnList = () => {
    const renderedColumnList = initialColumns.map((column) => {
      return {
        ...column,
        renderCell: (data: any, row: Row & { comparisonKey: number }) =>
          cellRender(data, row, column.name as keyof Row, column),
      };
    });

    setColumnList(renderedColumnList as any);
  };

  useEffect(() => {
    updateColumnList();
  }, [resData]);

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

  const compareModelsTable = useMemo(
    () => ({
      rowList,
      setRowList,
      columnList,
      setColumnList,
      handleSearch,
      handleChangePage,
      handleSubmit,
      loading: (compareModelsQuery as any).isFetching,
      error: (compareModelsQuery as any).error,
      searchString,
      setTotalRows,
      pageSize,
      setPageSize,
      page,
      setPage,
      totalRows,
      compareOnlyChanged,
      setCompareOnlyChanged,
    }),
    [
      rowList,
      setRowList,
      columnList,
      setColumnList,
      handleSearch,
      handleChangePage,
      handleSubmit,
      (compareModelsQuery as any).isFetching,
      (compareModelsQuery as any).error,
      searchString,
      setTotalRows,
      pageSize,
      setPageSize,
      page,
      setPage,
      totalRows,
      compareOnlyChanged,
      setCompareOnlyChanged,
    ],
  );

  useEffect(() => {
    console.log('useCompareModels - compareModelsTable обновился:', {
      rowListLength: rowList?.length,
      totalRows,
      loading: (compareModelsQuery as any).isFetching,
      hasError: !!(compareModelsQuery as any).error,
    });
  }, [compareModelsTable]);

  return {
    compareModelsTable,
  };
};

