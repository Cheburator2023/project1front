import { useEffect, useMemo, useState } from 'react';

import { ColumnsFilter, TopFilters } from '@shared/types';
import {
  initialColumnsFilters,
  initialTopFilters,
  ACTIVE_SCREEN,
  RIGHT_PANEL_TYPE,
} from '@shared/constants';
import {
  API_ROUTES,
  useFetch,
  Template,
  mockedTemplatesResponse,
} from '@shared/api';
import { useDownloadReportStore } from '@shared/stores/downloadReportStore';

export const useHomePage = () => {
  const { updateColumnsFilters, downloadReportStatus } = useDownloadReportStore();

  const { responseData: templateData } = useFetch<Template[]>({
    apiRoute: API_ROUTES.TEMPLATES,
    mockedResponse: mockedTemplatesResponse,
  });

  const [activeScreen, setActiveScreen] = useState(ACTIVE_SCREEN.TABLE);
  const [compareMode, setCompareMode] = useState(false);
  const [rightPanelType, setRightPanelType] = useState<RIGHT_PANEL_TYPE | null>(null);

  // Filters
  const [topFilters, setTopFilters] = useState<TopFilters>(initialTopFilters);
  const [columnsFilters, setColumnsFilters] =
    useState<Partial<ColumnsFilter>>(initialColumnsFilters);

  const [firstDate, setFirstDate] = useState<string | null>(null);
  const [secondDate, setSecondDate] = useState<string | null>(null);

  const [templates, setTemplates] = useState<Template[]>([]);

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

  const handleChangeCompare = (checked: boolean) => {
    if (checked) {
      setActiveScreen(ACTIVE_SCREEN.COMPARE);
    } else {
      setActiveScreen(ACTIVE_SCREEN.TABLE);
    }
    setCompareMode(checked);
  };

  const handleChangeColumnFilters = (newColumnFilters: Partial<ColumnsFilter>) => {
    setColumnsFilters(newColumnFilters);
  };

  const contextValue = useMemo(
    () => ({
      firstDate,
      secondDate,
      topFilters,
      columnsFilters,
      onChangeColumnsFilters: handleChangeColumnFilters,
      onChangeTopFilters: (newTopFilters: TopFilters) => setTopFilters(newTopFilters),
      onChangeFirstDate: (newFirstDate: string | null) => setFirstDate(newFirstDate),
      onChangeSecondDate: (newSecondDate: string | null) => setSecondDate(newSecondDate),
    }),
    [columnsFilters, topFilters, handleChangeColumnFilters, firstDate, secondDate],
  );

  return {
    display: {
      activeScreen,
      setActiveScreen,
      compareMode,
      setCompareMode,
      rightPanelType,
      setRightPanelType,
      handleChangeCompare,
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
    },
  };
};
