import React, { useEffect } from 'react';

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

  useEffect(() => {
    if (rowList?.length) {
      setTotalRows(rowList.length);


    }
  }, [rowList]);

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

