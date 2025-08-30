import React, { useEffect } from 'react';
import { Column as AdmiralColumn } from '@admiral-ds/react-ui';

import { COLUMN_TYPE, Column } from '@shared/types';
import { ColumnFilter } from '@entities';
import { useFiltersStore } from '@shared/stores/filtersStore';

import { AgGridModelsTable } from '@src/features/NewTables/AgGridModelsTable';
import { useCompareModels } from '../../../widgets/CompareModelsWidget/hooks';

interface TableModelsProps {
  firstDate: string | null;
  secondDate: string | null;
}

export const CompareModelsNewTable = React.memo(({ firstDate, secondDate }: TableModelsProps) => {
  const { compareModelsTable } = useCompareModels();

  const rowList = compareModelsTable.rowList;
  const columnList = compareModelsTable.columnList;
  const totalRows = compareModelsTable.totalRows;
  const setTotalRows = compareModelsTable.setTotalRows;

  const { filterModel } = useFiltersStore();

  useEffect(() => {
    if (rowList?.length) {
      setTotalRows(rowList.length);

      const newCols: Array<AdmiralColumn & Column> = columnList.map((column) => ({
        ...column,
        width: '200px',
        sortable: true,
        sticky: column.name === 'system_model_id',
        cellAlign: column.type === COLUMN_TYPE.NUMBER ? 'right' : 'left',
        extraText: (
          <ColumnFilter
            column={column}
            rowList={rowList}
            columnsFilters={filterModel}
          />
        ),
      }));

    }
  }, [rowList, columnList, filterModel]);

  return (
    <AgGridModelsTable
      isCompared
      overrideColumnList={columnList}
      overrideRowList={rowList}
      overlayNoRowsTemplate={
        totalRows > 0 && firstDate && secondDate
          ? 'Нет данных'
          : 'Для сравнения выберите две даты состояния реестра'
      }
    />
  );
});

CompareModelsNewTable.displayName = 'CompareModelsNewTable';

