import React from 'react';
import { ErrorStatus, Flexbox, Loading, Spacer } from '@shared/ui/atoms';
import { ACTIVE_SCREEN } from '@shared/constants';
import { FiltersContext } from '@shared/api';
import { FiltersPanel, RightModalPanel, TemplateFilters } from '@features';
import { useTableModels } from '@pages/Home/hooks';

import { AgGridModelsTable } from '@src/features/NewTables/AgGridModelsTable';
import { AgGridTable } from '../../features/NewTables/AgGridTable';
import { CompareModelsWidgetNewTable } from '../../widgets/CompareModelsWidget/CompareModelsWidgetNewTable';

export const FutureTableHomePage = () => {
  const { display, modelsTable, filters, context } = useTableModels();

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
        </>
      )}
      {display.activeScreen === ACTIVE_SCREEN.COMPARE && (
        <CompareModelsWidgetNewTable
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

