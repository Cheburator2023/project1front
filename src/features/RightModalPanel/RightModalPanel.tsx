import React, { useMemo } from 'react';

import { Column, Row } from '@shared/types';
import { RIGHT_PANEL_TYPE, MODEL_FORM_MODE } from '@shared/constants';
import {
  API_ROUTES,
  useFetch,
  ArtifactResponse,
  Template,
  mockedModelsArtifacts,
  ArtifactApi,
} from '@shared/api';

import { Spinner } from '@admiral-ds/react-ui';
import { 
  useDeleteRightModelPanelStore,
  useDisplayStore,
  useModelsTableStore,
  useTemplatesStore,
  useModelsOperationsStore
} from '@src/shared/stores';
import { CustomError } from '@src/shared/api/types';
import { ModelForm } from './ModelForm';
import { HistoryChanges } from './HistoryChanges';
import { Templates } from './Templates';
import { DeleteModelForm } from './DeleteModelForm/DeleteModelForm';

export const RightModalPanel = React.memo(
  () => {
    const { templates, setTemplates } = useTemplatesStore();
    const { rightPanelType: activeStatus, activeRowId, activeCellName } = useDisplayStore();
    const { rows } = useModelsTableStore();
    const { handleSubmit: onSubmit, handleOnClose: onClose } = useModelsOperationsStore();
    
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
    }, [rows, activeRowId, activeStatus]);

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

    if (
      activeStatus === RIGHT_PANEL_TYPE.ADD_MODEL ||
      activeStatus === RIGHT_PANEL_TYPE.EDIT_MODEL
    ) {
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
        <Templates templates={templates} onClose={onClose} updateTemplates={setTemplates} />
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
  },
);
