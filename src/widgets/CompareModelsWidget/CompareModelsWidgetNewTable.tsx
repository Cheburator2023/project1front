import React from 'react';

import { ACTIVE_SCREEN, RIGHT_PANEL_TYPE } from '@shared/constants';
import { ColumnsFilter } from '@src/shared/types';
import { FiltersPanel } from '@features';

import { useCompareModels } from './hooks';
import { Template } from '../../shared/api';
import { CompareModelsNewTable } from '../../features/Tables/CompareModels/CompareModelsNewTable';

interface CompareModelsWidgetProps {
  columnsFilters: Partial<ColumnsFilter>;
  firstDate: string | null;
  secondDate: string | null;
  templates: Template[];
  compareMode: boolean;
  handleChangeCompare: (checked: boolean) => void;
  updateActiveScreen: (newActiveScreen: ACTIVE_SCREEN) => void;
  setRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
}

const CompareModelsWidgetNewTable = React.memo(
  ({
    columnsFilters,
    firstDate,
    secondDate,
    compareMode,
    handleChangeCompare,
    templates,
    updateActiveScreen,
    setRightPanelType,
  }: CompareModelsWidgetProps) => {
    const { compareModelsTable } = useCompareModels(columnsFilters);

    const disabledCompare = !firstDate || !secondDate;

    return (
      <>
        <FiltersPanel
          compareOnlyChanged={compareModelsTable.compareOnlyChanged}
          handleCompareOnlyChanged={compareModelsTable.setCompareOnlyChanged}
          compareMode={compareMode}
          handleChangeCompare={handleChangeCompare}
          templates={templates}
          updateActiveScreen={updateActiveScreen}
          updateRightPanelType={setRightPanelType}
          disabledCompare={disabledCompare}
          handleUpdateCompareList={() => {
            if (!disabledCompare) {
              compareModelsTable.handleSubmit(
                firstDate,
                secondDate,
                compareModelsTable.compareOnlyChanged,
              );
            }
          }}
        />

        <CompareModelsNewTable
          firstDate={firstDate}
          secondDate={secondDate}
          error={compareModelsTable.error}
          loading={compareModelsTable.loading}
          rowList={compareModelsTable.rowList}
          columnList={compareModelsTable.columnList}
          page={compareModelsTable.page}
          pageSize={compareModelsTable.pageSize}
          searchString={compareModelsTable.searchString}
          updateRowsCount={compareModelsTable.setTotalRows}
          setCurrentPage={compareModelsTable.setPage}
          totalRows={compareModelsTable.totalRows}
          onChangePage={compareModelsTable.handleChangePage}
          handleSearch={compareModelsTable.handleSearch}
          updateRightPanelType={setRightPanelType}
        />
      </>
    );
  },
);

export { CompareModelsWidgetNewTable, CompareModelsWidgetProps };
