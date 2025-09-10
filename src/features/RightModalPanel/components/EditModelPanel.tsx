import React from 'react';
import { Artifact } from '@shared/api/types';
import { Row } from '@shared/types';
import { MODEL_FORM_MODE } from '@shared/constants';
import { ModelForm } from '../ModelForm';

interface EditModelPanelProps {
  isOpen: boolean;
  rows: Partial<Row>[];
  artifacts: Artifact[];
  activeRow?: Partial<Row>;
  editCellName?: keyof Row;
  onClose: () => void;
  onSubmit: (newRow?: Row | any, formMode?: MODEL_FORM_MODE) => void;
}

export const EditModelPanel = ({
  isOpen,
  rows,
  artifacts,
  activeRow,
  editCellName,
  onClose,
  onSubmit,
}: EditModelPanelProps) => {
  if (!isOpen || !activeRow || !editCellName || !rows || !artifacts) {
    console.log('🐸 Pepe said >> EditModelPanel >> isOpen:', isOpen);

    console.log('🐸 Pepe said >> EditModelPanel >> activeRow:', activeRow);

    console.log('🐸 Pepe said >> EditModelPanel >> editCellName:', editCellName);

    console.log('🐸 Pepe said >> EditModelPanel >> rows:', rows);

    console.log('🐸 Pepe said >> EditModelPanel >> artifacts:', artifacts);
    return null;
  }

  return (
    <ModelForm
      rows={rows}
      mode="edit"
      artifacts={artifacts}
      activeRow={activeRow}
      editCellName={editCellName}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
};

