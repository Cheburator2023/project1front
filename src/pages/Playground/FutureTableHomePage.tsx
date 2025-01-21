import React from 'react';
import styled from 'styled-components';
import { ErrorStatus, Loading } from '@shared/ui/atoms';
import { ACTIVE_SCREEN } from '@shared/constants';
import { FiltersContext } from '@shared/api';
import { FiltersPanel, RightModalPanel, TemplateFilters } from '@features';
import { useTableModels } from '@pages/Home/hooks';

import { PlaygroundTable } from './PlaygroundTable';
import { CompareModelsWidgetNewTable } from '../../widgets/CompareModelsWidget/CompareModelsWidgetNewTable';

// TODO: вынести в atoms/styled
const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

export const FutureTableHomePage = () => {
  const { display, modelsTable, filters, context } = useTableModels();

  if (modelsTable.error) {
    return (
      <StatusWrapper>
        <ErrorStatus text={modelsTable.error} />
      </StatusWrapper>
    );
  }

  if (modelsTable.loading) {
    return (
      <StatusWrapper>
        <Loading text="Загрузка данных ..." />
      </StatusWrapper>
    );
  }

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
          <PlaygroundTable
            display={display}
            modelsTable={modelsTable}
            filters={filters}
            templates={filters.templates}
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

