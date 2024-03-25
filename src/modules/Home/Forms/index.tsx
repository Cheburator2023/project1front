import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Row } from 'src/modules/Home/TableModels/types';

import { API_ROUTES, useFetch } from 'src/api';
import { ArtifactResponse } from 'src/api/types';

import { ModelForm } from './ModelForm';
import { TABLE_ACTION } from '../types';
import { HistoryChanges } from './HistoryChanges';

interface FormsProps {
  activeStatus: TABLE_ACTION | null;
  rows: Partial<Row>[];
  activeRowId?: string;
  activeCellName?: keyof Row;
  onSubmit: (newRow: Row, mode: TABLE_ACTION) => void;
  onClose: () => void;
}

export const Forms = ({
  activeStatus,
  activeRowId,
  activeCellName,
  rows,
  onClose,
  onSubmit,
}: FormsProps) => {
  const { responseData: artifactsData } = useFetch<ArtifactResponse>({
    apiRoute: API_ROUTES.ARTIFACTS,
  });

  const activeRow = useMemo(
    () => activeStatus && rows.find((row) => row.system_model_id === activeRowId),
    [rows, activeRowId, activeStatus],
  );

  if (!activeStatus) {
    return null;
  }

  if (activeStatus === TABLE_ACTION.HISTORY_CHANGES) {
    if (!activeRow?.system_model_id || !activeCellName) {
      return null;
    }

    return (
      <HistoryChanges
        modelId={activeRow.system_model_id}
        modelSource={activeRow?.model_source}
        artifactName={activeCellName}
        onClose={onClose}
      />
    );
  }

  if (activeStatus === TABLE_ACTION.ADD || activeStatus === TABLE_ACTION.EDIT) {
    if (!artifactsData) {
      return null;
    }

    if (activeStatus === TABLE_ACTION.ADD) {
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

    if (activeStatus === TABLE_ACTION.EDIT) {
      if (!activeRow || !activeCellName) {
        return null;
      }

      return (
        <ModelForm
          rows={rows}
          mode={activeStatus}
          artifactsApi={artifactsData}
          initialValues={activeRow}
          editCellName={activeCellName}
          onClose={onClose}
          onSubmit={onSubmit}
        />
      );
    }
  }

  return null;
};
