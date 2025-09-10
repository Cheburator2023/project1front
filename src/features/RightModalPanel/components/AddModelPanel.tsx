import React from 'react';
import { Artifact } from '@shared/api/types';
import { Row } from '@shared/types';
import { MODEL_FORM_MODE } from '@shared/constants';
import { ModelForm } from '../ModelForm';

interface AddModelPanelProps {
  isOpen: boolean;
  rows: Partial<Row>[];
  artifacts: Artifact[];
  onClose: () => void;
  onSubmit: (newRow?: Row | any, formMode?: MODEL_FORM_MODE) => void;
}

export const AddModelPanel = ({ isOpen, rows, artifacts, onClose, onSubmit }: AddModelPanelProps) => {
  if (!isOpen || !rows || !artifacts) {
    return null;
  }

  return (
    <ModelForm
      rows={rows}
      mode='add'
      artifacts={artifacts}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};