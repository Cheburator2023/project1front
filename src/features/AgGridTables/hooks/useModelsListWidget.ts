import React, { useCallback, useEffect, useState } from 'react';
import { useDownloadReportStore } from '@shared/stores/downloadReportStore';

import { Column, Row } from '@shared/types';
import { initialColumns, MODEL_FORM_MODE } from '@shared/constants';
import { usePanelsStore } from '@shared/stores';
import {
  ModelsResponseType,
  mockedModelsResponse,
} from '@shared/api';
import { useModelsControllerGetModels } from '@shared/api/generated/endpoints';

export interface ModelsListWidgetData {
  rowList: Array<Partial<Row>>;
  columnList: Column[];
  loading: boolean;
  error: string | null;
  activeRowId: string | undefined;
  activeCellName: keyof Row | undefined;
  searchString: string;
  pageSize: number;
  page: number;
  totalRows: number;
}

export interface ModelsListWidgetActions {
  setRowList: React.Dispatch<React.SetStateAction<Partial<Row>[]>>;
  setColumnList: React.Dispatch<React.SetStateAction<Column[]>>;
  handleSearch: (newSearchString: string) => void;
  handleChangePage: (result: { page: number; pageSize: number }) => void;
  setTotalRows: React.Dispatch<React.SetStateAction<number>>;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  handleClickOnActionCell: (
    action: 'edit' | 'history',
    rowId: string,
    cellName: keyof Row,
  ) => void;
  handleSubmit: (newRow?: any, formMode?: MODEL_FORM_MODE) => void;
  handleOnClose: () => void;
}

export const useModelsListWidget = () => {
  const {
    openEditModelPanel,
    openHistoryChangesPanel,
    closeAllPanels,
  } = usePanelsStore();
  const { downloadReportStatus } = useDownloadReportStore();

  // Cell activities
  const [activeCellName, setActiveCellName] = useState<keyof Row>();
  const [activeRowId, setActiveRowId] = useState<string>();

  // Table data
  const [rowList, setRowList] = useState<Array<Partial<Row>>>([]);
  const [columnList, setColumnList] = useState<Column[]>(initialColumns);

  const [searchString, setSearchString] = useState<string>('');

  // Pagination
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState<number>(0);

  const {
    data: modelsData,
    isLoading: loading,
    error: modelsError,
  } = useModelsControllerGetModels({ model_id: '' });

  const error = modelsError ? String(modelsError) : null;

  useEffect(() => {
    if (modelsData && (modelsData as any)?.data) {
      const formattedRows = (modelsData as any).data.cards.map((row) => ({
        ...row,
        model_version: row.model_version?.toString(), // TODO: remove after fix on backend
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



  const handleClickOnActionCell = useCallback(
    (
      action: 'edit' | 'history',
      rowId: string,
      cellName: keyof Row,
    ) => {
      if (action === 'edit') {
        openEditModelPanel(rowId, cellName);
      } else if (action === 'history') {
        openHistoryChangesPanel(rowId, cellName);
      }
    },
    [openEditModelPanel, openHistoryChangesPanel],
  );

  const handleSubmit = useCallback((newRow?: any, formMode?: MODEL_FORM_MODE) => {
    const newRowWithId = { ...newRow, id: newRow.system_model_id, hover: true };

    if (formMode === MODEL_FORM_MODE.EDIT) {
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
    closeAllPanels();
  }, [closeAllPanels]);

  const data: ModelsListWidgetData = {
    rowList,
    columnList,
    loading,
    error,
    activeRowId,
    activeCellName,
    searchString,
    pageSize,
    page,
    totalRows,
  };

  const actions: ModelsListWidgetActions = {
    setRowList,
    setColumnList,
    handleSearch,
    handleChangePage,
    setTotalRows,
    setPageSize,
    setPage,
    handleClickOnActionCell,
    handleSubmit,
    handleOnClose,
  };

  return {
    data,
    actions,
  };
};
