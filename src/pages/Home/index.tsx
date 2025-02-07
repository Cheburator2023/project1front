import React, { useState } from 'react';
import styled from 'styled-components';
import { ErrorStatus, Loading, Pagination } from '@shared/ui/atoms';
import { ACTIVE_SCREEN } from '@shared/constants';
import { FiltersContext } from '@shared/api';
import { ActionsPanel } from '@entities';
import { FiltersPanel, RightModalPanel, TemplateFilters } from '@features';

import { AgGridModelsTable } from '@src/features/NewTables/AgGridModelsTable';
import { useTableModels } from './hooks';
import { CompareModelsWidget } from '../../widgets';

export const Home = () => {
  const { display, modelsTable, filters, context } = useTableModels();
  const [checked, setChecked] = useState<boolean>(false);

  return (
    <FiltersContext.Provider value={context.contextValue}>
      <RightModalPanel
        rows={modelsTable.rowList}
        templates={filters.templates}
        activeRowId={modelsTable.activeRowId}
        activeStatus={display.rightPanelType}
        activeCellName={modelsTable.activeCellName}
        updateTemplates={filters.setTemplates}
        onSubmit={context.handleSubmit}
        onClose={context.handleOnClose}
      />
      {display.activeScreen === ACTIVE_SCREEN.TEMPLATE_FILTERS && (
        <TemplateFilters
          templates={filters.templates}
          updateActiveScreen={display.setActiveScreen}
          updateRightPanelType={display.setRightPanelType}
        />
      )}
      {display.activeScreen === ACTIVE_SCREEN.TABLE && (
        <>
          <FiltersPanel
            compareMode={display.compareMode}
            handleChangeCompare={display.handleChangeCompare}
            templates={filters.templates}
            updateActiveScreen={display.setActiveScreen}
            updateRightPanelType={display.setRightPanelType}
          />
          <AgGridModelsTable
            display={display}
            modelsTable={modelsTable}
            templates={filters.templates}
            error={modelsTable.error}
            loading={modelsTable.loading}
          />
          {/* <Row>
            <Checkbox
              dimension="s"
              onChange={(e) => {
                setChecked(e.target.checked);
              }}
            />
            <T font="Caption/Caption 1" as="div">
              Не включать модели со статусом ошибка заведения
            </T>
          </Row> */}
        </>
      )}
      {display.activeScreen === ACTIVE_SCREEN.COMPARE && (
        <CompareModelsWidget
          columnsFilters={filters.columnsFilters}
          firstDate={filters.firstDate}
          secondDate={filters.secondDate}
          setRightPanelType={display.setRightPanelType}
          updateActiveScreen={display.setActiveScreen}
          compareMode={display.compareMode}
          templates={filters.templates}
          handleChangeCompare={display.handleChangeCompare}
        />
      )}
    </FiltersContext.Provider>
  );
};

const Row = styled.div`
  display: flex;
  background: var(--neutral-neutral-05, #f3f4f6);
  flex-direction: row;
  align-items: center;
  > *:not(:last-child) {
    margin-right: 6px;
  }
  > * {
    flex: 0 0 auto;
  }
`;
