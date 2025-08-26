import { useCallback, useEffect, useMemo, useState } from 'react';
import { Column, Row, TopFilters } from '@shared/types';
import {
  initialColumns,
  initialTopFilters,
  ACTIVE_SCREEN,
  RIGHT_PANEL_TYPE,
  MODEL_FORM_MODE,
} from '@shared/constants';

import {
  API_ROUTES,
  useFetch,
  ModelsResponseType,
  Template,
  mockedModelsResponse,
  mockedTemplatesResponse,
} from '@shared/api';
import { useDownloadReportStore } from '@shared/stores/downloadReportStore';

import {
  getISODateFormat,
} from '@shared/helpers';
import { ArtifactApi, CustomError } from '@src/shared/api/types';
import { useExploitationModeStore, useFiltersStore, useDisplayStore, useTemplatesStore } from '@src/shared/stores';
import { useDeepEffect } from '../../../shared/hooks/useDeepEffect';

export const getQueryParams = (
  selectedExploitationModes: string[],
  date?: string,
): Record<string, any> => {
  const params: Record<string, any> = {};

  if (date) {
    params.date = getISODateFormat(date);
  }

  selectedExploitationModes.forEach((mode, i) => {
    params[`mode[${i}]`] = mode;
  });

  return params;
};

export type TDisplayTableModels = {
  activeScreen: ACTIVE_SCREEN;
};

export type TModelsTable = {
  rowList: Partial<Row>[];
  setRowList: (newRowList: Row[]) => void;
  columnList: Column[];
  setColumnList: (newColumnList: Column[]) => void;
  handleClickOnActionCell: (
    action: RIGHT_PANEL_TYPE.EDIT_MODEL | RIGHT_PANEL_TYPE.HISTORY_CHANGES,
    rowId: string,
    cellName: keyof Row,
  ) => void;
  updateColumnList: () => void;
  handleSearch: (newSearchString: string) => void;
  handleChangePage: (result: { page: number; pageSize: number }) => void;
  loading: boolean;
  error: string;
  activeRowId: string | undefined;
  activeCellName?: keyof Row;
  searchString: string;
  setTotalRows: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalRows: number;
};

export type TFilters = {
  templates: Template[];
  firstDate: string | null;
  secondDate: string | null;
};



export interface IUseTableModels {
  display: TDisplayTableModels;
  modelsTable: TModelsTable;
  filters: TFilters;
}

export const useTableModels = () => {
  const { downloadReportStatus } = useDownloadReportStore();
  const { topFilters, setTopFilters, firstDate, setFirstDate, secondDate, setSecondDate, modelsDownloadingDate, setModelsDownloadingDate } = useFiltersStore();
  const { activeScreen, setActiveScreen, compareMode, setCompareMode, rightPanelType, setRightPanelType, activeCellName, setActiveCellName, activeRowId, setActiveRowId, handleChangeCompare, handleOnClose } = useDisplayStore();

  // Table data
  const [rowList, setRowList] = useState<Array<Partial<Row>>>([]);
  const [columnList, setColumnList] = useState<Column[]>(initialColumns);

  const [searchString, setSearchString] = useState<string>('');

  // Pagination
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const { templates, setTemplates } = useTemplatesStore();

  const [loadingModels, setLoadingModels] = useState(true);
  const [errorModels, setErrorModels] = useState<string>('');

  const selectedExploitationModes = useExploitationModeStore(
    (state) => state.selectedExploitationModes,
  );

  const { responseData: templateData, mutationProtectedFetch } = useFetch<Template[]>({
    apiRoute: API_ROUTES.TEMPLATES,
    mockedResponse: mockedTemplatesResponse,
  });

  const updateRows = (modelsData: ModelsResponseType) => {
    const formattedRows = modelsData.data.cards.map((row) => ({
      ...row,
      model_version: row.model_version?.toString(), // TODO: remove after fix on backend
      id: row.system_model_id,
      hover: true,
    }));
    setRowList(formattedRows);
    setTotalRows(formattedRows.length);
  };

  const fetchModels = useCallback(async (date?: string) => {
    const { selectedExploitationModes } = useExploitationModeStore.getState();

    setLoadingModels(true);

    try {
      const res = await mutationProtectedFetch<ModelsResponseType, ModelsResponseType>({
        fetchApiRoute: API_ROUTES.MODELS,
        fetchMethod: 'GET',
        mockedResponse: mockedModelsResponse,
        newParams: getQueryParams(selectedExploitationModes, date),
      });

      if (res && !res?.error) {
        updateRows(res.data);
        setErrorModels('');
      } else if (res) {
        setErrorModels(res.data.message);
      }

      setLoadingModels(false);
    } catch {
      setErrorModels('Ошибка загрузки моделей');
      setLoadingModels(false);
    }
  }, []);

  // Initial models loading and on selectedExploitationModes change
  useDeepEffect(() => {
    fetchModels();
  }, [selectedExploitationModes]);

  useDeepEffect(() => {
    if (templateData) {
      setTemplates(templateData);
    }
  }, [templateData]);

  const handleChangeModelDownloadingDate = useCallback((date: string) => {
    fetchModels(date);
    setModelsDownloadingDate(date);
  }, []);

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

  const updateColumnList = useCallback(() => {
    setColumnList(initialColumns);
  }, []);

  const contextValue = useMemo(
    () => ({
      firstDate,
      secondDate,
      modelsDownloadingDate,
      topFilters,
      onChangeTopFilters: (newTopFilters: TopFilters) => setTopFilters(newTopFilters),
      onChangeFirstDate: (newFirstDate: string | null) => setFirstDate(newFirstDate),
      onChangeSecondDate: (newSecondDate: string | null) => setSecondDate(newSecondDate),
      onChangeModelDownloadingDate: handleChangeModelDownloadingDate,
    }),
    [
      topFilters,
      firstDate,
      secondDate,
      modelsDownloadingDate,
      handleChangeModelDownloadingDate,
    ],
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
    [rowList, setRightPanelType, setActiveCellName, setActiveRowId],
  );

  const handleSubmit = useCallback((newRow?: any, formMode?: MODEL_FORM_MODE) => {
    if (newRow) {
      const newRowWithId = { ...newRow, id: newRow.system_model_id, hover: true };
      if (
        formMode === MODEL_FORM_MODE.EDIT ||
        MODEL_FORM_MODE.DELETE ||
        MODEL_FORM_MODE.DELETE_CONFIRM
      ) {
        setRowList((prevRows) =>
          prevRows.map((row) =>
            row?.system_model_id === newRowWithId.system_model_id ? newRowWithId : row,
          ),
        );
      } else {
        setRowList((prevRows) => [newRowWithId, ...prevRows]);
      }
    }
    fetchModels();
  }, []);



  const result: IUseTableModels = {
    display: {
      activeScreen,
    },
    modelsTable: {
      rowList,
      setRowList,
      columnList,
      setColumnList,
      handleClickOnActionCell,
      updateColumnList,
      handleSearch,
      handleChangePage,
      loading: loadingModels,
      error: errorModels,
      activeRowId,
      activeCellName,
      searchString,
      setTotalRows,
      pageSize,
      setPageSize,
      page,
      setPage,
      totalRows,
    },
    filters: {
      templates,
      firstDate,
      secondDate,
    },
  };

  return result;
};

