import React, { useCallback, useEffect } from 'react';
import { ModelsResponseType } from '@src/shared/api';
import { Column, Row } from '@src/shared/types';
import { getISODateFormat } from '@shared/helpers';
import { initialColumns, RIGHT_PANEL_TYPE } from '@shared/constants';
import { useDeepEffect } from '@shared/hooks/useDeepEffect';
import {
  useFiltersStore,
  useModelsStore,
  useTemplatesStore,
  useExploitationModeStore,
} from '@src/shared/stores';
import {
  useModelsControllerGetModels,
  useTemplatesControllerGetTemplates,
} from '@shared/api/generated/endpoints';

import { AgGridTable } from '../organisms/AgGridTable';

export const AgGridModelsTable = (props: {
  isCompared?: boolean;
  overrideColumnList?: Column[];
  overrideRowList?: Partial<Row>[];
  overlayNoRowsTemplate?: string;
}) => {
  const {
    setRightPanelType,
    setActiveCellName,
    setRows,
    setActiveRowId,
    modelsParams,
    setModelsParams,
  } = useModelsStore();

    const {
    modelsDownloadingDate,
  } = useFiltersStore();


  const { templates, setTemplates } = useTemplatesStore();
  const _selectedExploitationModes = useExploitationModeStore(
    (state) => state.selectedExploitationModes,
  );

  const { data: templateData } = useTemplatesControllerGetTemplates({ query: { enabled: true } });
  const {
    data: _modelsData,
    isLoading: loadingModels,
    error: modelsError,
    refetch: refetchModels,
  } = useModelsControllerGetModels(modelsParams, {
    query: {
      enabled: false,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  });

  const modelsData = _modelsData as ModelsResponseType | undefined;

  const fetchModels = useCallback(
    (date?: string) => {
      const { selectedExploitationModes } = useExploitationModeStore.getState();
      const dateToUse = date || modelsDownloadingDate;

      if (dateToUse) {
        setModelsParams({
          date: getISODateFormat(dateToUse),
          mode: selectedExploitationModes,
        });
      } else {
        setModelsParams({
          mode: selectedExploitationModes,
        });
      }

      setTimeout(() => {
        refetchModels();
      }, 100);
    },
    [modelsDownloadingDate, refetchModels, setModelsParams],
  );

  useEffect(() => {
    fetchModels();
  }, [fetchModels, _selectedExploitationModes]);

  useDeepEffect(() => {
    if (templateData) {
      setTemplates(templateData);
    }
  }, [templateData]);

  useDeepEffect(() => {
    if (modelsData?.data?.cards) {
      setRows(modelsData.data.cards);
    }
  }, [modelsData?.data?.cards]);

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
    [setRightPanelType, setActiveCellName, setActiveRowId],
  );

  return (
    <AgGridTable
      templates={templates}
      rowList={props.overrideRowList || (modelsData as any)?.data?.cards}
      columnList={props.overrideColumnList || initialColumns}
      isCompared={props.isCompared}
      handleClickOnActionCell={handleClickOnActionCell}
      error={modelsError && 'Ошибка загрузки моделей'}
      loading={loadingModels}
      overlayNoRowsTemplate={props.overlayNoRowsTemplate}
    />
  );
};

