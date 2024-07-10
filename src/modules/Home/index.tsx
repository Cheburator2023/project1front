import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import { Loading, ErrorStatus } from 'src/components';
import { Column, ColumnsFilter, Row } from 'src/modules/Home/TableModels/types';
import { DownloadReportContext } from 'src/Layout/DownloadReportContext';

import { FiltersPanel } from 'src/modules/Home/FiltersPanel';
import { API_ROUTES, useFetch } from 'src/api';

import { ModelsResponseType, Template } from 'src/api/types';
import { initialColumns, initialColumnsFilters } from './constants';
import { FiltersContext } from './FiltersContext';
import { TopFilters } from './FiltersPanel/types';
import { initialTopFilters } from './FiltersPanel/constants';
import { TableModels } from './TableModels';
import { Pagination } from './Pagination';
import { ActionsPanel } from './ActionsPanel';
import { RightModalPanel } from './RightModalPanel';
import { checkColumnsFiltersForEqual, filterColumnsByColumnsFilters } from './helpers';
import { ACTIVE_SCREEN, RIGHT_PANEL_TYPE } from './types';
import { TemplateFilters } from './TemplateFilters';
import { FORM_MODE } from './RightModalPanel/ModelForm/types';

const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

const Home = () => {
  const { updateColumnsFilters, downloadReportStatus } = useContext(DownloadReportContext);

  const [activeScreen, setActiveScreen] = useState(ACTIVE_SCREEN.TABLE);
  const [rightPanelType, setRightPanelType] = useState<RIGHT_PANEL_TYPE | null>(null);

  // Cell activities
  const [activeCellName, setActiveCellName] = useState<keyof Row>();
  const [activeRowId, setActiveRowId] = useState<string>();

  // Table data
  const [rowList, setRowList] = useState<Array<Partial<Row>>>([]);
  const [columnList, setColumnList] = useState<Column[]>(initialColumns);

  // Filters
  const [topFilters, setTopFilters] = useState<TopFilters>(initialTopFilters);
  const [columnsFilters, setColumnsFilters] =
    useState<Partial<ColumnsFilter>>(initialColumnsFilters);

  const [searchString, setSearchString] = useState<string>('');

  // Pagination
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState<number>(0);

  const [templates, setTemplates] = useState<Template[]>([]);

  const {
    responseData: modelsData,
    loading,
    error,
  } = useFetch<ModelsResponseType>({
    apiRoute: API_ROUTES.MODELS,
    // mockedResponse: mockedModelsResponse,
  });

  const { responseData: templateData } = useFetch<Template[]>({
    apiRoute: API_ROUTES.TEMPLATES,
    // mockedResponse: mockedTemplatesResponse,
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

  useEffect(() => {
    if (templateData) {
      setTemplates(templateData);
    }
  }, [templateData]);

  useEffect(() => {
    if (downloadReportStatus) {
      updateColumnsFilters(columnsFilters);
    }
  }, [columnsFilters, downloadReportStatus]);

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
      setColumnsFilters(newColumnFilters);
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
      action: RIGHT_PANEL_TYPE.EDIT_MODEL | RIGHT_PANEL_TYPE.HISTORY_CHANGES,
      rowId: string,
      cellName: keyof Row,
    ) => {
      setRightPanelType(action);
      setActiveCellName(cellName);
      setActiveRowId(rowId);
    },
    [rowList],
  );

  const handleSubmit = useCallback((newRow: Row, formMode: FORM_MODE) => {
    const newRowWithId = { ...newRow, id: newRow.system_model_id, hover: true };

    if (formMode === FORM_MODE.EDIT) {
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
    setRightPanelType(null);
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
      <RightModalPanel
        rows={rowList}
        templates={templates}
        activeRowId={activeRowId}
        activeStatus={rightPanelType}
        activeCellName={activeCellName}
        updateTemplates={setTemplates}
        onSubmit={handleSubmit}
        onClose={handleOnClose}
      />
      {activeScreen === ACTIVE_SCREEN.TEMPLATE_FILTERS && (
        <TemplateFilters
          templates={templates}
          updateActiveScreen={setActiveScreen}
          updateRightPanelType={setRightPanelType}
        />
      )}
      {activeScreen === ACTIVE_SCREEN.TABLE && (
        <>
          <FiltersPanel
            templates={templates}
            updateActiveScreen={setActiveScreen}
            updateRightPanelType={setRightPanelType}
          />
          <ActionsPanel handleSearch={handleSearch} updateRightPanelType={setRightPanelType} />
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
        </>
      )}
    </FiltersContext.Provider>
  );
};

export { Home };
