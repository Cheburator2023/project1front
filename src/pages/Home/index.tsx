import React, { useState } from 'react';
import styled from 'styled-components';
import { ErrorStatus, Loading, Pagination } from '@shared/ui/atoms';
import { ACTIVE_SCREEN } from '@shared/constants';
import { ActionsPanel } from '@entities';
import { FiltersPanel, RightModalPanel } from '@features';

import { AgGridModelsTable } from '@src/features/NewTables/AgGridModelsTable';
import { useTableModels } from './hooks';
import { CompareModelsWidget } from '../../widgets';
import { TemplateFilters } from '../../features/TemplateFilters/TemplateFilters';
import { TFiltersTest2 } from '../Playground/TFiltersTest2';

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

