import React, { useMemo } from 'react';

import { ArtifactResponse } from '@shared/api';
import { useArtefactsControllerGetArtefacts } from '@shared/api/generated/endpoints';

import {
  useDeleteRightModelPanelStore,
  useModelsStore,
  useTemplatesStore,
  usePanelsStore,
} from '@src/shared/stores';
import {
  AddModelPanel,
  EditModelPanel,
  HistoryChangesPanel,
  AddTemplatePanel,
  DeleteModelPanel,
} from './components';

export const RightModalPanel = React.memo(() => {
  const { templates, setTemplates } = useTemplatesStore();
  const { rows, handleSubmit: onSubmit } = useModelsStore();

  const {
    addModelPanel,
    editModelPanel,
    historyChangesPanel,
    addTemplatePanel,
    deleteModelPanel,
    closeAddModelPanel,
    closeEditModelPanel,
    closeHistoryChangesPanel,
    closeAddTemplatePanel,
    closeDeleteModelPanel,
  } = usePanelsStore();

  const editActiveRow = useMemo(() => {
    return rows?.find((row) => row.system_model_id === editModelPanel.activeRowId);
  }, [rows, editModelPanel.activeRowId]);

  const historyActiveRow = useMemo(() => {
    return rows?.find((row) => row.system_model_id === historyChangesPanel.activeRowId);
  }, [rows, historyChangesPanel.activeRowId]);

  const editSource = editActiveRow?.model_source === 'sum' ? 'sum' : 'sum-rm';
  const deleteSource = deleteModelPanel.activeRow?.[0]?.model_source === 'sum' ? 'sum' : 'sum-rm';

  const { data: sumArtifactsResponse } = useArtefactsControllerGetArtefacts({ source: 'sum' });
  const { data: mrmArtifactsResponse } = useArtefactsControllerGetArtefacts({ source: 'sum-rm' });

  const sumArtifacts = (sumArtifactsResponse as ArtifactResponse | undefined)?.data || [];
  const mrmArtifacts = (mrmArtifactsResponse as ArtifactResponse | undefined)?.data || [];
  const editArtifacts = editSource === 'sum' ? sumArtifacts : mrmArtifacts;
  const deleteArtifacts = deleteSource === 'sum' ? sumArtifacts : mrmArtifacts;
  const addArtifacts = mrmArtifacts;

  return (
    <>
      <AddModelPanel
        isOpen={addModelPanel.isOpen}
        rows={rows || []}
        artifacts={addArtifacts}
        onClose={closeAddModelPanel}
        onSubmit={onSubmit}
      />

      <EditModelPanel
        isOpen={editModelPanel.isOpen}
        rows={rows || []}
        artifacts={editArtifacts}
        activeRow={editActiveRow}
        editCellName={editModelPanel.activeCellName}
        onClose={closeEditModelPanel}
        onSubmit={onSubmit}
      />

      <HistoryChangesPanel
        isOpen={historyChangesPanel.isOpen}
        activeRow={historyActiveRow}
        activeCellName={historyChangesPanel.activeCellName}
        onClose={closeHistoryChangesPanel}
      />

      <AddTemplatePanel
        isOpen={addTemplatePanel.isOpen}
        templates={templates}
        onClose={closeAddTemplatePanel}
        updateTemplates={(updater) =>
          setTemplates(typeof updater === 'function' ? updater(templates) : updater)
        }
      />

      <DeleteModelPanel
        isOpen={deleteModelPanel.isOpen}
        artifacts={deleteArtifacts}
        activeRow={deleteModelPanel.activeRow}
        editCellName={deleteModelPanel.activeCellName}
        onClose={closeDeleteModelPanel}
        onSubmit={onSubmit}
      />
    </>
  );
});

