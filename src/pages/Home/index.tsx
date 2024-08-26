import React from 'react';
import styled from 'styled-components';
import { T } from '@admiral-ds/react-ui';

import { ErrorStatus, Loading, Pagination } from '@shared/ui/atoms';
import { ACTIVE_SCREEN } from '@shared/constants';
import { FiltersContext } from '@shared/api';
import { ActionsPanel } from '@entities';
import {
  FiltersPanel,
  RightModalPanel,
  TemplateFilters,
  TableModels,
  TableCompareModels,
} from '@features';

import { useTableModels, useCompareModels } from './hooks';

const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

const Home = () => {
  const { display, modelsTable, filters, context } = useTableModels();
  const { compareModelsTable } = useCompareModels(
    filters.columnsFilters,
    filters.firstDate,
    filters.secondDate,
  );

  if (modelsTable.error) {
    return (
      <StatusWrapper>
        <ErrorStatus text={modelsTable.error} />
      </StatusWrapper>
    );
  }

  if (modelsTable.loading || compareModelsTable.loading) {
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
          <ActionsPanel
            handleSearch={display.handleSearch}
            updateRightPanelType={display.setRightPanelType}
          />
          <TableModels
            rowList={modelsTable.rowList}
            columnList={modelsTable.columnList}
            page={modelsTable.page}
            pageSize={modelsTable.pageSize}
            searchString={modelsTable.searchString}
            onActionCell={modelsTable.handleClickOnActionCell}
            updateRowsCount={modelsTable.setTotalRows}
            setCurrentPage={modelsTable.setPage}
          />
          <Pagination
            page={modelsTable.page}
            pageSize={modelsTable.pageSize}
            onChangePage={modelsTable.handleChangePage}
            totalElements={modelsTable.totalRows}
          />
        </>
      )}
      {display.activeScreen === ACTIVE_SCREEN.COMPARE && (
        <>
          <FiltersPanel
            compareOnlyChanged={compareModelsTable.compareOnlyChanged}
            compareMode={display.compareMode}
            handleChangeCompare={display.handleChangeCompare}
            handleCompareOnlyChanged={compareModelsTable.setCompareOnlyChanged}
            templates={filters.templates}
            updateActiveScreen={display.setActiveScreen}
            updateRightPanelType={display.setRightPanelType}
          />
          {filters.firstDate && filters.secondDate ? (
            <>
              <ActionsPanel
                handleSearch={compareModelsTable.handleSearch}
                updateRightPanelType={display.setRightPanelType}
              />
              <TableCompareModels
                rowList={compareModelsTable.rowList}
                columnList={compareModelsTable.columnList}
                page={compareModelsTable.page}
                pageSize={compareModelsTable.pageSize}
                searchString={compareModelsTable.searchString}
                updateRowsCount={compareModelsTable.setTotalRows}
                setCurrentPage={compareModelsTable.setPage}
              />
              <Pagination
                page={compareModelsTable.page}
                pageSize={compareModelsTable.pageSize}
                onChangePage={compareModelsTable.handleChangePage}
                totalElements={compareModelsTable.totalRows}
              />
            </>
          ) : (
            <div>
              <T font="Subtitle/Subtitle 1">Для сравнения выберите две даты состояния реестра</T>
            </div>
          )}
        </>
      )}
    </FiltersContext.Provider>
  );
};

export { Home };
