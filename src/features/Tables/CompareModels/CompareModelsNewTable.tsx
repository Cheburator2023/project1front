import React, { useEffect } from 'react';
import { Column as AdmiralColumn, T } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { COLUMN_TYPE, Column, Row } from '@shared/types';
import { RIGHT_PANEL_TYPE } from '@shared/constants';
import { ActionsPanel, ColumnFilter } from '@entities';

import { AgGridModelsTable } from '@src/features/NewTables/AgGridModelsTable';
import { useTableChange } from '../hooks';
import { useTableModels } from '../../../pages/Home/hooks';
import { useCompareModels } from '../../../widgets/CompareModelsWidget/hooks';

interface TableModelsProps {
  firstDate: string | null;
  secondDate: string | null;
}

export const CompareModelsNewTable = React.memo(({ firstDate, secondDate }: TableModelsProps) => {
  const { compareModelsTable } = useCompareModels();

  const rowList = compareModelsTable.rowList;
  const columnList = compareModelsTable.columnList;
  const page = compareModelsTable.page;
  const pageSize = compareModelsTable.pageSize;
  const searchString = compareModelsTable.searchString;
  const totalRows = compareModelsTable.totalRows;
  const setTotalRows = compareModelsTable.setTotalRows;
  const setPage = compareModelsTable.setPage;

  const { rows, setCols, setRows, handleChangeColumnsFilter, filterModel } = useTableChange({
    rowList,
    setCurrentPage: setPage,
    page,
    updateRowsCount: setTotalRows,
    pageSize,
    searchString,
    columnList,
  });

  useEffect(() => {
    if (rowList?.length) {
      setRows(rowList);
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
            onChangeColumnsFilter={handleChangeColumnsFilter}
          />
        ),
      }));

      setCols(newCols);
    }
  }, [rowList, columnList, filterModel, handleChangeColumnsFilter]);

  return (
    <AgGridModelsTable
      isCompared
      overrideColumnList={columnList}
      overrideRowList={rows}
      overlayNoRowsTemplate={
        totalRows > 0 && firstDate && secondDate
          ? 'Нет данных'
          : 'Для сравнения выберите две даты состояния реестра'
      }
    />
  );
});

CompareModelsNewTable.displayName = 'CompareModelsNewTable';

