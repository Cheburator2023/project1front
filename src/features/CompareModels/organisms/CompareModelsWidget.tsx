import React from 'react';

import { ACTIVE_SCREEN, RIGHT_PANEL_TYPE } from '@shared/constants';
import { useModelsStore } from '@src/shared/stores';

import { CompareModelsNewTable } from '@src/features/CompareModels/organisms/CompareModelsNewTable';
import { useCompareModels } from '../hooks';
import { Template } from '../../../shared/api';
import { useTableModels } from '../../../pages/Home/hooks';
import { FiltersPanel } from '../../FiltersPanel/organisms/FiltersPanel';

const CompareModelsWidget = () => {
  const { setRightPanelType } = useModelsStore();
  const { compareModelsTable } = useCompareModels();
  const { filters } = useTableModels();

  const firstDate = filters?.firstDate;
  const secondDate = filters?.secondDate;
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
      <CompareModelsNewTable firstDate={firstDate} secondDate={secondDate} />
    </>
  );
};

export { CompareModelsWidget };

