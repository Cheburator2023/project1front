import React, { useState } from 'react';
import styled from 'styled-components';
import { ErrorStatus, Loading, Pagination } from '@shared/ui/atoms';
import { ACTIVE_SCREEN } from '@shared/constants';
import { FiltersContext } from '@shared/api';
import { ActionsPanel } from '@entities';
import { FiltersPanel, RightModalPanel, TemplateFilters, TableModels } from '@features';
import { useTableModels } from './hooks';
import { CompareModelsWidget } from '../../widgets';
import { Checkbox, T } from '@admiral-ds/react-ui';

// TODO: вынести в atoms/styled
const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

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

const Home = () => {
  const { display, modelsTable, filters, context } = useTableModels();
  const [checked, setChecked] = useState<boolean>(false);

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
          />
          <Pagination
            page={modelsTable.page}
            pageSize={modelsTable.pageSize}
            onChangePage={modelsTable.handleChangePage}
            totalElements={modelsTable.totalRows}
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

export { Home };
