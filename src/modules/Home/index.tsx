import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Loading, ErrorStatus } from 'src/components';
import { Column, ColumnsFilter, Row } from 'src/modules/Home/TableModels/types';

import { FiltersPanel } from 'src/modules/Home/FiltersPanel';

import { API_ROUTES, useFetch } from 'src/api';
import { ModelsResponseType } from 'src/api/types';

import { initialColumns, initialColumnsFilters } from './constants';
import { FiltersContext } from './FiltersContext';
import { TopFilters } from './FiltersPanel/types';
import { initialTopFilters } from './FiltersPanel/constants';
import { TableModels } from './TableModels';
import { Pagination } from './Pagination';
import { ActionsPanel } from './ActionsPanel';
import { Forms } from './Forms';
import { checkColumnsFiltersForEqual, filterColumnsByColumnsFilters } from './helpers';
import { TABLE_ACTION } from './types';

const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

const Home = () => {
  // Cell activities
  const [activeStatus, setActiveStatus] = useState<TABLE_ACTION | null>(null);
  const [activeCellName, setActiveCellName] = useState<keyof Row>();
  const [activeRowId, setActiveRowId] = useState<string>();

  // Table data
  const [rowList, setRowList] = useState<Array<Partial<Row> & { id: string }>>([]);
  const [columnList, setColumnList] = useState<Column[]>(initialColumns);

  // Filters
  const [topFilters, setTopFilters] = useState<TopFilters>(initialTopFilters);
  const [columnsFilters, setColumnFilters] =
    useState<Partial<ColumnsFilter>>(initialColumnsFilters);

  const [searchString, setSearchString] = useState<string>('');

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState<number>(0);

  const {
    responseData: modelsData,
    loading,
    error,
  } = useFetch<ModelsResponseType>({
    apiRoute: API_ROUTES.MODELS,
    // mockedResponse: mockedModelsResponse,
  });

  useEffect(() => {
    if (modelsData) {
      const formattedRows = modelsData.data.cards.map((row) => ({
        ...row,
        id: row.system_model_id,
        hover: true,
      }));

      setRowList(formattedRows);
      setTotalRows(formattedRows.length);
    }
  }, [modelsData]);

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

  const updateColumnList = useCallback(
    (newColumnFilters: Partial<ColumnsFilter>) => {
      const columnsFiltersChanged = !checkColumnsFiltersForEqual(columnsFilters, newColumnFilters);

      if (columnsFiltersChanged) {
        const newColumnList = filterColumnsByColumnsFilters(newColumnFilters);

        setColumnList(newColumnList);
      }
    },
    [columnsFilters],
  );

  const handleChangeColumnFilters = useCallback(
    (newColumnFilters: Partial<ColumnsFilter>) => {
      updateColumnList(newColumnFilters);
      setColumnFilters(newColumnFilters);
    },
    [updateColumnList],
  );

  const contextValue = useMemo(
    () => ({
      topFilters,
      columnsFilters,
      onChangeColumnsFilters: handleChangeColumnFilters,
      onChangeTopFilters: (newTopFilters: TopFilters) => setTopFilters(newTopFilters),
    }),
    [columnsFilters, topFilters, handleChangeColumnFilters],
  );

  const handleClickOnActionCell = useCallback(
    (
      action: TABLE_ACTION.EDIT | TABLE_ACTION.HISTORY_CHANGES,
      rowId: string,
      cellName: keyof Row,
    ) => {
      setActiveStatus(action);
      setActiveCellName(cellName);
      setActiveRowId(rowId);
    },
    [rowList],
  );

  const handleSubmit = useCallback((newRow: Row, mode: TABLE_ACTION) => {
    const newRowWithId = { ...newRow, id: newRow.system_model_id, hover: true };

    if (mode === TABLE_ACTION.EDIT) {
      setRowList((prevRows) =>
        prevRows.map((row) =>
          row?.system_model_id === newRowWithId.system_model_id ? newRowWithId : row,
        ),
      );
    } else {
      setRowList((prevRows) => [newRowWithId, ...prevRows]);
    }
  }, []);

  const handleOnClose = useCallback(() => {
    setActiveStatus(null);
    setActiveCellName(undefined);
    setActiveRowId(undefined);
  }, []);

  if (error) {
    return (
      <StatusWrapper>
        <ErrorStatus text={error} />
      </StatusWrapper>
    );
  }

  if (loading) {
    return (
      <StatusWrapper>
        <Loading text="Загрузка данных ..." />
      </StatusWrapper>
    );
  }

  return (
    <FiltersContext.Provider value={contextValue}>
      <Forms
        rows={rowList}
        activeRowId={activeRowId}
        activeStatus={activeStatus}
        activeCellName={activeCellName}
        onSubmit={handleSubmit}
        onClose={handleOnClose}
      />
      <FiltersPanel />
      <ActionsPanel
        handleSearch={handleSearch}
        onAddNewModel={() => setActiveStatus(TABLE_ACTION.ADD)}
      />
      <TableModels
        rowList={rowList}
        columnList={columnList}
        page={page}
        pageSize={pageSize}
        searchString={searchString}
        onActionCell={handleClickOnActionCell}
        updateRowsCount={setTotalRows}
        setCurrentPage={setPage}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        onChangePage={handleChangePage}
        totalElements={totalRows}
      />
    </FiltersContext.Provider>
  );
};

export { Home };
