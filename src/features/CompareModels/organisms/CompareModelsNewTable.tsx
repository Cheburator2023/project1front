import React, { useEffect } from 'react';

import { AgGridModelsTable } from '@src/features/AgGridTables/templates/AgGridModelsTable';
import { useCompareModels } from '../hooks';

interface TableModelsProps {
  compareModelsTable: any;
  firstDate: string | null;
  secondDate: string | null;
}

export const CompareModelsNewTable = ({compareModelsTable, firstDate, secondDate }: TableModelsProps) => {
  const { rowList, columnList, totalRows, setTotalRows } = compareModelsTable;

  const overlayTextCondition = totalRows !== undefined && totalRows >= 0 && firstDate && secondDate;

  return (
    <AgGridModelsTable
      isCompared
      overrideColumnList={columnList}
      overrideRowList={rowList}
      overlayNoRowsTemplate={
        overlayTextCondition ? 'Нет данных' : 'Для сравнения выберите две даты состояния реестра'
      }
    />
  );
};

