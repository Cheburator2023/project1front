import React from 'react';
import { Row } from '@shared/types';
import { HistoryChanges } from '../HistoryChanges';

interface HistoryChangesPanelProps {
  isOpen: boolean;
  activeRow?: Partial<Row>;
  activeCellName?: keyof Row;
  onClose: () => void;
}

export const HistoryChangesPanel = ({ 
  isOpen, 
  activeRow, 
  activeCellName, 
  onClose 
}: HistoryChangesPanelProps) => {
  if (!isOpen || !activeRow?.system_model_id || !activeCellName) {
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
};