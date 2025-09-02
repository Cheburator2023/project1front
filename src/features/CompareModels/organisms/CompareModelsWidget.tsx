import React from 'react';
import { useModelsStore } from '@src/shared/stores';

import { CompareModelsNewTable } from '@src/features/CompareModels/organisms/CompareModelsNewTable';
import { useCompareModels } from '../hooks';
import { FiltersPanel } from '../../FiltersPanel/organisms/FiltersPanel';
import { useTableModels } from '../../../pages/HomePage/hooks/useTableModels';

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

