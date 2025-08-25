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

export const Home = () => {
  const { display, modelsTable, filters } = useTableModels();

  return (
    <>
      <RightModalPanel />
      {display?.activeScreen === ACTIVE_SCREEN.TEMPLATE_FILTERS && <TemplateFilters />}
      {display?.activeScreen === ACTIVE_SCREEN.TABLE && (
        <>
          <FiltersPanel />
          <AgGridModelsTable />
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
      {display?.activeScreen === ACTIVE_SCREEN.COMPARE && (
        <CompareModelsWidget

        />
      )}
    </>
  );
};

