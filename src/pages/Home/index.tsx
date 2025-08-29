import React from 'react';
import { ACTIVE_SCREEN } from '@shared/constants';
import { FiltersPanel, RightModalPanel } from '@features';

import { AgGridModelsTable } from '@src/features/NewTables/AgGridModelsTable';
import { useTableModels } from './hooks';
import { CompareModelsWidget } from '../../widgets';

export const Home = () => {
  const { display, modelsTable, filters } = useTableModels();

  return (
    <>
      <RightModalPanel />
      {/* {display?.activeScreen === ACTIVE_SCREEN.TEMPLATE_FILTERS && <TemplateFilters />} */}

      {display?.activeScreen === ACTIVE_SCREEN.COMPARE ? (
        <CompareModelsWidget />
      ) : (
        <>
          <FiltersPanel />
          <AgGridModelsTable />
        </>
      )}
    </>
  );
};

