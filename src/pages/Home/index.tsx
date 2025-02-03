/* eslint-disable no-nested-ternary */
import React from 'react';
import styled from 'styled-components';
import { ErrorStatus, Loading, Pagination } from '@shared/ui/atoms';
import { ACTIVE_SCREEN } from '@shared/constants';
import { FiltersContext } from '@shared/api';
import { ActionsPanel } from '@entities';
import { FiltersPanel, RightModalPanel, TemplateFilters, TableModels } from '@features';
import { useTableModels } from './hooks';
import { CompareModelsWidget } from '../../widgets';

export const Home = () => {
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
            templates={filters.templates}
            loading={modelsTable.loading}
            error={modelsTable.error}
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
