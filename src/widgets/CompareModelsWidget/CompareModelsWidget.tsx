import React from 'react';
import styled from 'styled-components';

import { ErrorStatus, Loading, Pagination } from '@shared/ui/atoms';
import { RIGHT_PANEL_TYPE } from '@shared/constants';
import { ActionsPanel } from '@entities';
import { FiltersPanel, TableCompareModels } from '@features';

import { useCompareModels } from './useCompareModels';
import { ColumnsFilter } from '@src/shared/types';

const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  padding: 50px 0;
  justify-content: center;
`;

interface CompareModelsWidgetProps {
  columnsFilters: Partial<ColumnsFilter>;
  firstDate: string;
  secondDate: string;
  compareOnlyChanged: boolean;
  setRightPanelType: React.Dispatch<React.SetStateAction<RIGHT_PANEL_TYPE | null>>;
}

const CompareModelsWidget = React.memo(
  // TODO: fix the bug where a repeated request fails when dates change
  ({
    columnsFilters,
    firstDate,
    secondDate,
    compareOnlyChanged,
    setRightPanelType,
  }: CompareModelsWidgetProps) => {
    const { compareModelsTable } = useCompareModels(
      columnsFilters,
      firstDate,
      secondDate,
      compareOnlyChanged,
    );

    if (compareModelsTable.error) {
      return (
        <StatusWrapper>
          <ErrorStatus text={compareModelsTable.error} />
        </StatusWrapper>
      );
    }

    if (compareModelsTable.loading) {
      return (
        <StatusWrapper>
          <Loading text="Загрузка данных ..." />
        </StatusWrapper>
      );
    }

    return (
      <>
        <ActionsPanel
          handleSearch={compareModelsTable.handleSearch}
          updateRightPanelType={setRightPanelType}
        />
        <TableCompareModels
          rowList={compareModelsTable.rowList}
          columnList={compareModelsTable.columnList}
          page={compareModelsTable.page}
          pageSize={compareModelsTable.pageSize}
          searchString={compareModelsTable.searchString}
          updateRowsCount={compareModelsTable.setTotalRows}
          setCurrentPage={compareModelsTable.setPage}
        />
        <Pagination
          page={compareModelsTable.page}
          pageSize={compareModelsTable.pageSize}
          onChangePage={compareModelsTable.handleChangePage}
          totalElements={compareModelsTable.totalRows}
        />
      </>
    );
  },
);

export { CompareModelsWidget, CompareModelsWidgetProps };
