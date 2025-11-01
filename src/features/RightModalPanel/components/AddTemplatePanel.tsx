import React from 'react';
import { Template } from '@shared/api';
import { Templates } from '../Templates';
import { Row } from '../../../shared/types';

interface AddTemplatePanelProps {
  isOpen: boolean;
  templates: Template[];
  onClose: () => void;
  activeRow?: Partial<Row>;
  updateTemplates: (updater: Template[] | ((prev: Template[]) => Template[])) => void;
}

export const AddTemplatePanel = ({
  isOpen,
  templates,
  onClose,
  activeRow,
  updateTemplates
}: AddTemplatePanelProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Templates
      templates={templates}
      onClose={onClose}
      updateTemplates={updateTemplates}
    />
  );
};
