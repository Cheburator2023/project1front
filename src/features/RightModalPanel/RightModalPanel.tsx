import React, { useMemo } from 'react';

import { Row } from '@shared/types';
import { RIGHT_PANEL_TYPE, MODEL_FORM_MODE } from '@shared/constants';
import {
  API_ROUTES,
  useFetch,
  ArtifactResponse,
  Template,
  mockedModelsArtifacts,
} from '@shared/api';

import { ModelForm } from './ModelForm';
import { HistoryChanges } from './HistoryChanges';
import { Templates } from './Templates';

export interface RightModalPanelProps {
  activeStatus: RIGHT_PANEL_TYPE | null;
  rows: Partial<Row>[];
  templates: Template[];
  activeRowId?: string;
  activeCellName?: keyof Row;
  updateTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  onSubmit: (newRow: Row, formMode: MODEL_FORM_MODE) => void;
  onClose: () => void;
}

export const RightModalPanel = React.memo(
  ({
    templates,
    activeStatus,
    activeRowId,
    activeCellName,
    rows,
    updateTemplates,
    onClose,
    onSubmit,
  }: RightModalPanelProps) => {
    const { responseData: artifactsData } = useFetch<ArtifactResponse>({
      apiRoute: API_ROUTES.ARTIFACTS,
      mockedResponse: mockedModelsArtifacts,
    });

    const activeRow = useMemo(
      () => activeStatus && rows.find((row) => row.system_model_id === activeRowId),
      [rows, activeRowId, activeStatus],
    );

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
      if (!artifactsData) {
        return null;
      }

      if (activeStatus === RIGHT_PANEL_TYPE.ADD_MODEL) {
        return (
          <ModelForm
            rows={rows}
            mode={activeStatus}
            artifactsApi={artifactsData}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        );
      }

      if (activeStatus === RIGHT_PANEL_TYPE.EDIT_MODEL) {
        if (!activeRow || !activeCellName) {
          return null;
        }

        return (
          <ModelForm
            rows={rows}
            mode={activeStatus}
            artifactsApi={artifactsData}
            activeRow={activeRow}
            editCellName={activeCellName}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        );
      }
    }

    if (activeStatus === RIGHT_PANEL_TYPE.ADD_TEMPLATE) {
      return (
        <Templates templates={templates} onClose={onClose} updateTemplates={updateTemplates} />
      );
    }

    return null;
  },
);
