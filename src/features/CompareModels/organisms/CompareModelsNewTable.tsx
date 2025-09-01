import React, { useEffect } from 'react';

import { AgGridModelsTable } from '@src/features/AgGridTables/templates/AgGridModelsTable';
import { useCompareModels } from '../hooks';

interface TableModelsProps {
  firstDate: string | null;
  secondDate: string | null;
}

export const CompareModelsNewTable = React.memo(({ firstDate, secondDate }: TableModelsProps) => {
  const { compareModelsTable } = useCompareModels();
  const { rowList, columnList, totalRows, setTotalRows } = compareModelsTable;

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

