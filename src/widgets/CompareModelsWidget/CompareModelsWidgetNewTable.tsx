import React from 'react';

import { ACTIVE_SCREEN, RIGHT_PANEL_TYPE } from '@shared/constants';
import { FiltersPanel } from '@features';

import { useCompareModels } from './hooks';
import { Template } from '../../shared/api';
import { CompareModelsNewTable } from '../../features/Tables/CompareModels/CompareModelsNewTable';

interface CompareModelsWidgetProps {
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
    firstDate,
    secondDate,
    compareMode,
    handleChangeCompare,
    templates,
    updateActiveScreen,
    setRightPanelType,
  }: CompareModelsWidgetProps) => {
    const { compareModelsTable } = useCompareModels();

    const disabledCompare = !firstDate || !secondDate;

    return (
      <>
        <FiltersPanel
          compareOnlyChanged={compareModelsTable.compareOnlyChanged}
          handleCompareOnlyChanged={compareModelsTable.setCompareOnlyChanged}
          compareModelsTableLoading={compareModelsTable.loading}
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
        />
      </>
    );
  },
);

export { CompareModelsWidgetNewTable, CompareModelsWidgetProps };
