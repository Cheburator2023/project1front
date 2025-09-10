import React from 'react';
import { Artifact } from '@shared/api/types';
import { Row } from '@shared/types';
import { MODEL_FORM_MODE } from '@shared/constants';
import { DeleteModelForm } from '../DeleteModelForm/DeleteModelForm';

interface DeleteModelPanelProps {
  isOpen: boolean;
  artifacts: Artifact[];
  activeRow?: Partial<Row>[];
  editCellName?: keyof Row;
  onClose: () => void;
  onSubmit: (newRow?: Row | any, formMode?: MODEL_FORM_MODE) => void;
}

export const DeleteModelPanel = ({
  isOpen,
  artifacts,
  activeRow,
  editCellName,
  onClose,
  onSubmit,
}: DeleteModelPanelProps) => {
  if (!isOpen || !activeRow || activeRow.length !== 1) {
    return null;
  }

  return (
    <DeleteModelForm
      artifacts={artifacts}
      activeRow={activeRow[0]}
      editCellName={editCellName}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

