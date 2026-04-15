import React, { useCallback, useEffect } from 'react';
import { ModelsResponseType } from '@src/shared/api';
import { Column, Row } from '@src/shared/types';
import { getISODateFormat } from '@shared/helpers';
import { initialColumns } from '@shared/constants';
import { useDeepEffect } from '@shared/hooks/useDeepEffect';
import { parse, isValid } from 'date-fns';
import { useToast } from '@src/shared/ui/atoms';
import {
  useFiltersStore,
  useModelsStore,
  useTemplatesStore,
  useExploitationModeStore,
  usePanelsStore,
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
  const { setRows, modelsParams, setModelsParams, setRefetchModels } = useModelsStore();

  const { showToast } = useToast();

  const { modelsDownloadingDate } = useFiltersStore();

  const { openEditModelPanel, openHistoryChangesPanel } = usePanelsStore();

  const { templates, setTemplates } = useTemplatesStore();
  const _selectedExploitationModes = useExploitationModeStore(
    (state) => state.selectedExploitationModes,
  );

  const { data: templateData } = useTemplatesControllerGetTemplates(
    { mode: _selectedExploitationModes },
    { query: { enabled: true } },
  );
  const {
    data: _modelsData,
    isLoading: loadingModels,
    isFetching: fetchingModels,
    error: modelsError,
    refetch: refetchModels,
  } = useModelsControllerGetModels(
    { ...modelsParams },
    {
      query: {
        enabled: false,
        refetchOnMount: true,
        refetchOnWindowFocus: false,
      },
    },
  );

  const modelsData = _modelsData as ModelsResponseType | undefined;
  console.log("🚀 ~ AgGridModelsTable ~ modelsData:", modelsData)

  const fetchModels = useCallback(
    (date?: string) => {
      const { selectedExploitationModes } = useExploitationModeStore.getState();
      const dateToUse = date || modelsDownloadingDate;

      const isFilledDate = (value: string) => {
        if (!value) return false;
        if (value.includes('_')) return false;
        if (value.length !== 10) return false;
        return true;
      };

      if (dateToUse) {
        if (!isFilledDate(dateToUse)) return;

        const parsed = parse(dateToUse, 'dd.MM.yyyy', new Date());
        if (!isValid(parsed)) {
          showToast({
            message: 'Некорректная дата',
            type: 'error',
            duration: 5000,
          });
          return;
        }
      }

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
    [modelsDownloadingDate, refetchModels, setModelsParams, showToast],
  );

  useEffect(() => {
    fetchModels();
  }, [fetchModels, _selectedExploitationModes]);

  useEffect(() => {
    setRefetchModels(refetchModels);
  }, [refetchModels, setRefetchModels]);

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
    (action: 'edit' | 'history', rowId: string, cellName: keyof Row) => {
      if (action === 'edit') {
        openEditModelPanel(rowId, cellName);
      } else if (action === 'history') {
        openHistoryChangesPanel(rowId, cellName);
      }
    },
    [openEditModelPanel, openHistoryChangesPanel],
  );

  return (
    <AgGridTable
      templates={templates}
      rowList={props.overrideRowList || (modelsData as any)?.data?.cards}
      columnList={props.overrideColumnList || initialColumns}
      isCompared={props.isCompared}
      handleClickOnActionCell={handleClickOnActionCell}
      error={modelsError && 'Ошибка загрузки моделей'}
      loading={loadingModels || fetchingModels}
      overlayNoRowsTemplate={props.overlayNoRowsTemplate}
    />
  );
};

