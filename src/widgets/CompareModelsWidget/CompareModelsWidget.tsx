import React from 'react';

import { ACTIVE_SCREEN, RIGHT_PANEL_TYPE } from '@shared/constants';
import { ColumnsFilter } from '@src/shared/types';
import { FiltersPanel, TableCompareModels } from '@features';

import { useCompareModels } from './hooks';
import { Template } from 'shared/api';

interface CompareModelsWidgetProps {
  columnsFilters: Partial<ColumnsFilter>;
  firstDate: string | null;
  secondDate: string | null;
  templates: Template[];
  compareMode: boolean;
  handleChangeCompare: (checked: boolean) => void;
  updateActiveScreen: React.Dispatch<React.SetStateAction<ACTIVE_SCREEN>>;
  setRightPanelType: React.Dispatch<React.SetStateAction<RIGHT_PANEL_TYPE | null>>;
}

const CompareModelsWidget = React.memo(
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
            !disabledCompare &&
              compareModelsTable.handleSubmit(
                firstDate,
                secondDate,
                compareModelsTable.compareOnlyChanged,
              );
          }}
        />
        <TableCompareModels
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

export { CompareModelsWidget, CompareModelsWidgetProps };
