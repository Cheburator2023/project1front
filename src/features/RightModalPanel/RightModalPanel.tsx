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

  // Один запрос: сервер считает обе матрицы (is_editable_by_role_sum / is_editable_by_role_sum_rm)
  // и возвращает все артефакты с флагами для текущего пользователя. Source теперь выбирается на клиенте
  // при отрисовке поля (см. canEditArtefact по model_source строки).
  const { data: artefactsResponse } = useArtefactsControllerGetArtefacts();
  const artifacts = (artefactsResponse as ArtifactResponse | undefined)?.data || [];

  return (
    <>
      <AddModelPanel
        isOpen={addModelPanel.isOpen}
        rows={rows || []}
        artifacts={artifacts}
        onClose={closeAddModelPanel}
        onSubmit={onSubmit}
      />

      <EditModelPanel
        isOpen={editModelPanel.isOpen}
        rows={rows || []}
        artifacts={artifacts}
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
        artifacts={artifacts}
        activeRow={deleteModelPanel.activeRow}
        editCellName={deleteModelPanel.activeCellName}
        onClose={closeDeleteModelPanel}
        onSubmit={onSubmit}
      />
    </>
  );
});

