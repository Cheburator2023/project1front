import React from 'react';
import styled from 'styled-components';

import { ErrorStatus, Loading, Pagination } from '@shared/ui/atoms';
import { ACTIVE_SCREEN, MODEL_FORM_MODE, RIGHT_PANEL_TYPE } from '@shared/constants';
import { Template } from '@shared/api';
import { ActionsPanel } from '@entities';
import { ColumnsFilter, Row } from '@shared/types';
import { FiltersPanel, RightModalPanel, TableModels } from '@features';

import { useModelsListWidget } from './hooks';

// TODO: вынести в atoms/styled
const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

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

  if (data.error) {
    return (
      <StatusWrapper>
        <ErrorStatus text={data.error} />
      </StatusWrapper>
    );
  }

  if (data.loading) {
    return (
      <StatusWrapper>
        <Loading text="Загрузка данных ..." />
      </StatusWrapper>
    );
  }

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
      <TableModels
        rowList={data.rowList}
        columnList={data.columnList}
        page={data.page}
        pageSize={data.pageSize}
        searchString={data.searchString}
        onActionCell={actions.handleClickOnActionCell}
        updateRowsCount={actions.setTotalRows}
        setCurrentPage={actions.setPage}
      />
      <Pagination
        page={data.page}
        pageSize={data.pageSize}
        onChangePage={actions.handleChangePage}
        totalElements={data.totalRows}
      />
    </>
  );
};
