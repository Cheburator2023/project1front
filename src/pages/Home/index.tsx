import React from 'react';
import { ACTIVE_SCREEN } from '@shared/constants';

import { AgGridModelsTable } from '@src/features/AgGridTables/templates/AgGridModelsTable';
import { useTableModels } from './hooks';
import { RightModalPanel } from '../../features/RightModalPanel';
import { FiltersPanel } from '../../features/FiltersPanel/organisms/FiltersPanel';
import { CompareModelsWidget } from '../../features/CompareModels/organisms/CompareModelsWidget';

export const Home = () => {
  const { display, modelsTable, filters } = useTableModels();

  return (
    <>
      <RightModalPanel />
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

