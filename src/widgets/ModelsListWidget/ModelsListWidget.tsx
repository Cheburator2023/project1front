import React from 'react';
import styled from 'styled-components';

import { ErrorStatus, Loading, Pagination } from '@shared/ui/atoms';
import { ACTIVE_SCREEN, MODEL_FORM_MODE, RIGHT_PANEL_TYPE } from '@shared/constants';
import { Template } from '@shared/api';
import { ActionsPanel } from '@entities';
import { ColumnsFilter, Row } from '@shared/types';
import { FiltersPanel, RightModalPanel } from '@features';

import { AgGridModelsListWidget } from '@src/features/NewTables/AgGridModelsListWidget';
import { useModelsListWidget } from './hooks';

interface ModelsListWidgetProps {
  columnsFilters: Partial<ColumnsFilter>;
  templates: Template[];
  compareMode: boolean;
  handleChangeCompare: (checked: boolean) => void;
  updateActiveScreen: React.Dispatch<React.SetStateAction<ACTIVE_SCREEN>>;
  setRightPanelType: React.Dispatch<React.SetStateAction<RIGHT_PANEL_TYPE | null>>;
  updateTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
  rightPanelType: RIGHT_PANEL_TYPE | null;
}

export const ModelsListWidget = ({
  columnsFilters,
  compareMode,
  handleChangeCompare,
  rightPanelType,
  templates,
  updateActiveScreen,
  setRightPanelType,
  updateTemplates,
}: ModelsListWidgetProps) => {
  const { data, actions } = useModelsListWidget(columnsFilters, setRightPanelType);

  return (
    <>
      <RightModalPanel
        rows={data.rowList}
        templates={templates}
        activeRowId={data.activeRowId}
        activeStatus={rightPanelType}
        activeCellName={data.activeCellName}
        updateTemplates={updateTemplates}
        onSubmit={actions.handleSubmit}
        onClose={actions.handleOnClose}
      />
      <FiltersPanel
        compareMode={compareMode}
        handleChangeCompare={handleChangeCompare}
        templates={templates}
        updateActiveScreen={updateActiveScreen}
        updateRightPanelType={setRightPanelType}
      />
      <ActionsPanel handleSearch={actions.handleSearch} updateRightPanelType={setRightPanelType} />
      <AgGridModelsListWidget data={data} templates={templates} actions={actions} />
    </>
  );
};
