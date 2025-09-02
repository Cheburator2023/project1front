import React, { useMemo } from 'react';

import { RIGHT_PANEL_TYPE } from '@shared/constants';
import { API_ROUTES, useFetch, ArtifactResponse, mockedModelsArtifacts } from '@shared/api';

import { Spinner } from '@admiral-ds/react-ui';
import {
  useDeleteRightModelPanelStore,
  useModelsStore,
  useTemplatesStore,
} from '@src/shared/stores';
import { ModelForm } from './ModelForm';
import { HistoryChanges } from './HistoryChanges';
import { Templates } from './Templates';
import { DeleteModelForm } from './DeleteModelForm/DeleteModelForm';
import { useTableModels } from '../../pages/HomePage/hooks/useTableModels';

export const RightModalPanel = React.memo(() => {
  const { templates, setTemplates } = useTemplatesStore();
  const { modelsTable } = useTableModels();
  const rows = modelsTable.rowList;

  const {
    rightPanelType: activeStatus,
    activeRowId,
    activeCellName,
    handleSubmit: onSubmit,
    handleOnClose: onClose,
  } = useModelsStore();

  const { responseData: artifactsData } = useFetch<ArtifactResponse | undefined>({
    apiRoute: API_ROUTES.ARTIFACTS,
    mockedResponse: mockedModelsArtifacts,
  });

  const { activeRowId: activeRowIdDelete } = useDeleteRightModelPanelStore();

  const activeRow = useMemo(() => {
    if (activeStatus === RIGHT_PANEL_TYPE.DELETE_MODEL) {
      return rows?.find((row) => row.id === activeRowIdDelete);
    }
    return rows?.find((row) => row.id === activeRowId);
  }, [activeStatus, rows, activeRowIdDelete, activeRowId]);

  if (!activeStatus) {
    return null;
  }

  if (activeStatus === RIGHT_PANEL_TYPE.HISTORY_CHANGES) {
    if (!activeRow?.system_model_id || !activeCellName) {
      return null;
    }

    return (
      <HistoryChanges
        modelId={activeRow.system_model_id}
        modelSource={activeRow?.model_source ? activeRow.model_source : ''}
        artifactName={activeCellName}
        onClose={onClose}
      />
    );
  }

  if (activeStatus === RIGHT_PANEL_TYPE.ADD_MODEL || activeStatus === RIGHT_PANEL_TYPE.EDIT_MODEL) {
    if (activeStatus === RIGHT_PANEL_TYPE.ADD_MODEL) {
      return artifactsData?.data ? (
        <ModelForm
          rows={rows}
          mode={activeStatus}
          artifacts={artifactsData.data}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : null;
    }

    if (activeStatus === RIGHT_PANEL_TYPE.EDIT_MODEL) {
      if (!activeRow || !activeCellName) {
        return null;
      }

      return artifactsData?.data ? (
        <ModelForm
          rows={rows}
          mode={activeStatus}
          artifacts={artifactsData.data}
          activeRow={activeRow}
          editCellName={activeCellName}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      ) : (
        <Spinner />
      );
    }
  }

  if (activeStatus === RIGHT_PANEL_TYPE.ADD_TEMPLATE) {
    return (
      <Templates
        templates={templates}
        onClose={onClose}
        updateTemplates={(updater) =>
          setTemplates(typeof updater === 'function' ? updater(templates) : updater)
        }
      />
    );
  }

  if (activeStatus === RIGHT_PANEL_TYPE.DELETE_MODEL) {
    if (!activeRow) {
      return null;
    }

    return artifactsData?.data ? (
      <DeleteModelForm
        artifacts={artifactsData.data}
        activeRow={activeRow}
        editCellName={activeCellName}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    ) : (
      <Spinner />
    );
  }

  return null;
});

