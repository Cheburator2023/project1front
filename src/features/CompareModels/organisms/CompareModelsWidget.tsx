import React from 'react';
import { useFiltersStore, useTemplatesStore, useModelsStore } from '@src/shared/stores';

import { CompareModelsNewTable } from '@src/features/CompareModels/organisms/CompareModelsNewTable';
import { useCompareModels } from '../hooks';
import { FiltersPanel } from '../../FiltersPanel/organisms/FiltersPanel';
import { Flexbox } from '../../../shared/ui/atoms';

const CompareModelsWidget = () => {
  const { compareModelsTable } = useCompareModels();
  const { templates } = useTemplatesStore();
  const { firstDate, secondDate } = useFiltersStore();

  const filters = { templates, firstDate, secondDate };
  const firstDateValue = filters?.firstDate;
  const secondDateValue = filters?.secondDate;
  const disabledCompare = !firstDate || !secondDate;

  return (
    <>
      <Flexbox alignItems="center" gap={12} style={{ padding: '0px 12px', background: '#e5e7eb' }}>
        <FiltersPanel
          compareOnlyChanged={compareModelsTable.compareOnlyChanged}
          handleCompareOnlyChanged={compareModelsTable.setCompareOnlyChanged}
          compareModelsTableLoading={compareModelsTable.loading}
          disabledCompare={disabledCompare}
          handleUpdateCompareList={() => {
            if (!disabledCompare) {
              compareModelsTable.handleSubmit(
                firstDate,
                secondDate
              );
            }
          }}
        />
      </Flexbox>

      <CompareModelsNewTable
        compareModelsTable={compareModelsTable}
        firstDate={firstDate}
        secondDate={secondDate}
      />
    </>
  );
};

export { CompareModelsWidget };

