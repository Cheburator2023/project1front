import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Column, ColumnsFilter, Row, TopFilters } from '@shared/types';
import {
  initialColumns,
  initialColumnsFilters,
  initialTopFilters,
  ACTIVE_SCREEN,
  RIGHT_PANEL_TYPE,
  MODEL_FORM_MODE,
} from '@shared/constants';

import {
  API_ROUTES,
  DownloadReportContext,
  useFetch,
  ModelsResponseType,
  Template,
  mockedModelsResponse,
  mockedTemplatesResponse,
} from '@shared/api';

import {
  checkColumnsFiltersForEqual,
  filterColumnsByColumnsFilters,
  getISODateFormat,
} from '@shared/helpers';
import { ArtifactApi, CustomError } from '@src/shared/api/types';
import { useExploitationModeStore } from '@src/shared/stores';

export type TDisplayTableModels = {
  activeScreen: ACTIVE_SCREEN;
  setActiveScreen: (newActiveScreen: ACTIVE_SCREEN) => void;
  compareMode: boolean;
  setCompareMode: (newCompareMode: boolean) => void;
  rightPanelType: RIGHT_PANEL_TYPE | null;
  setRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
  handleChangeCompare: (checked: boolean) => void;
  handleSearch: (newSearchString: string) => void;
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
  updateColumnList: (newColumnFilters: Partial<ColumnsFilter>) => void;
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
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  columnsFilters: Partial<ColumnsFilter>;
  topFilters: TopFilters;
  setTopFilters: React.Dispatch<React.SetStateAction<TopFilters>>;
  setColumnsFilters: React.Dispatch<React.SetStateAction<Partial<ColumnsFilter>>>;
  handleChangeColumnFilters: (newColumnFilters: Partial<ColumnsFilter>) => void;
  firstDate: string | null;
  secondDate: string | null;
  setFirstDate: React.Dispatch<React.SetStateAction<string | null>>;
  setSecondDate: React.Dispatch<React.SetStateAction<string | null>>;
};

export type TContext = {
  updateColumnsFilters: (newColumnsFilters: Partial<ColumnsFilter>) => void;
  downloadReportStatus: boolean;
  handleSubmit: (newRow?: Row | CustomError | ArtifactApi[], formMode?: MODEL_FORM_MODE) => void;
  handleOnClose: () => void;
  contextValue: {
    firstDate: string | null;
    secondDate: string | null;
    modelsDownloadingDate: string | undefined;
    topFilters: TopFilters;
    columnsFilters: Partial<ColumnsFilter>;
    onChangeModelDownloadingDate: (date: string) => void;
    onChangeColumnsFilters: (newColumnFilters: Partial<ColumnsFilter>) => void;
    onChangeTopFilters: (newTopFilters: TopFilters) => void;
    onChangeFirstDate: (newFirstDate: string | null) => void;
    onChangeSecondDate: (newSecondDate: string | null) => void;
  };
};

export interface IUseTableModels {
  display: TDisplayTableModels;
  modelsTable: TModelsTable;
  filters: TFilters;
  context: TContext;
}

export const useTableModels = () => {
  const { updateColumnsFilters, downloadReportStatus } = useContext(DownloadReportContext);
  const [activeScreen, setActiveScreen] = useState(ACTIVE_SCREEN.TABLE);
  const [compareMode, setCompareMode] = useState(false);
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

  const [firstDate, setFirstDate] = useState<string | null>(null);
  const [secondDate, setSecondDate] = useState<string | null>(null);
  const [searchString, setSearchString] = useState<string>('');

  // Pagination
  const [pageSize, setPageSize] = useState(100);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [templates, setTemplates] = useState<Template[]>([]);

  const [modelsDownloadingDate, setModelsDownloadingDate] = useState<string | undefined>();
  const [loadingModels, setLoadingModels] = useState(true);
  const [errorModels, setErrorModels] = useState<string>('');

  const { selectedExploitationModes } = useExploitationModeStore();

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

  const fetchModels = useCallback(
    async (date?: string) => {
      setLoadingModels(true);

      try {
        const params: Record<string, any> = {};

        if (date) {
          params.date = getISODateFormat(date);
        }

        if (selectedExploitationModes.length > 0) {
          selectedExploitationModes.forEach((mode, index) => {
            params[`mode[${index}]`] = mode;
          });
        }

        const res: any = await mutationProtectedFetch<ModelsResponseType, ModelsResponseType>({
          fetchApiRoute: API_ROUTES.MODELS,
          fetchMethod: 'GET',
          mockedResponse: mockedModelsResponse,
          newParams: params,
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
    },
    [selectedExploitationModes],
  );

  // Initial models loading
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

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

  const handleChangeModelDownloadingDate = useCallback((date: string) => {
    fetchModels(date);
    setModelsDownloadingDate(date);
  }, []);

  const handleChangeCompare = (checked: boolean) => {
    if (checked) {
      setActiveScreen(ACTIVE_SCREEN.COMPARE);
    } else {
      setActiveScreen(ACTIVE_SCREEN.TABLE);
    }
    setCompareMode(checked);
  };

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
        const newColumnList = filterColumnsByColumnsFilters(newColumnFilters, initialColumns);
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
      firstDate,
      secondDate,
      modelsDownloadingDate,
      topFilters,
      columnsFilters,
      onChangeColumnsFilters: handleChangeColumnFilters,
      onChangeTopFilters: (newTopFilters: TopFilters) => setTopFilters(newTopFilters),
      onChangeFirstDate: (newFirstDate: string | null) => setFirstDate(newFirstDate),
      onChangeSecondDate: (newSecondDate: string | null) => setSecondDate(newSecondDate),
      onChangeModelDownloadingDate: handleChangeModelDownloadingDate,
    }),
    [
      columnsFilters,
      topFilters,
      handleChangeColumnFilters,
      firstDate,
      secondDate,
      modelsDownloadingDate,
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
    [rowList],
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

  const handleOnClose = useCallback(() => {
    setRightPanelType(null);
    setActiveCellName(undefined);
    setActiveRowId(undefined);
  }, []);

  const result: IUseTableModels = {
    display: {
      activeScreen,
      setActiveScreen,
      compareMode,
      setCompareMode,
      rightPanelType,
      setRightPanelType,
      handleChangeCompare,
      handleSearch,
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
      setTemplates,
      columnsFilters,
      topFilters,
      setTopFilters,
      setColumnsFilters,
      handleChangeColumnFilters,
      firstDate,
      secondDate,
      setFirstDate,
      setSecondDate,
    },
    context: {
      updateColumnsFilters,
      downloadReportStatus,
      contextValue,
      handleSubmit,
      handleOnClose,
    },
  };

  return result;
};

