import React from 'react';

import { ACTIVE_SCREEN } from '@shared/constants';
import { FiltersContext } from '@shared/api';

import { TemplateFilters } from '@features';
import { CompareModelsWidget, ModelsListWidget } from '@widgets';

import { useHomePage } from './hooks';

const Home = () => {
  const { display, filters, context } = useHomePage();

  return (
    <FiltersContext.Provider value={context.contextValue}>
      {display.activeScreen === ACTIVE_SCREEN.TEMPLATE_FILTERS && (
        <TemplateFilters
          templates={filters.templates}
          updateActiveScreen={display.setActiveScreen}
          updateRightPanelType={display.setRightPanelType}
        />
      )}
      {display.activeScreen === ACTIVE_SCREEN.TABLE && (
        <ModelsListWidget
          columnsFilters={filters.columnsFilters}
          templates={filters.templates}
          compareMode={display.compareMode}
          handleChangeCompare={display.handleChangeCompare}
          updateActiveScreen={display.setActiveScreen}
          setRightPanelType={display.setRightPanelType}
          rightPanelType={display.rightPanelType}
          updateTemplates={filters.setTemplates}
        />
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

export { Home };
