import React, { useState } from 'react';
import styled from 'styled-components';
import { ErrorStatus, Loading, Pagination } from '@shared/ui/atoms';
import { ACTIVE_SCREEN } from '@shared/constants';
import { FiltersContext } from '@shared/api';
import { ActionsPanel } from '@entities';
import { FiltersPanel, RightModalPanel } from '@features';

import { AgGridModelsTable } from '@src/features/NewTables/AgGridModelsTable';
import { TemplateFiltersNew } from '@src/features/TemplateFilters/TemplateFiltersNew';
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
        <TemplateFiltersNew
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

