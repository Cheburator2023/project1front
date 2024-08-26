import React, { useEffect } from 'react';
import { Column as AdmiralColumn } from '@admiral-ds/react-ui';

import { COLUMN_TYPE, Column, Row } from '@shared/types';
import { ColumnFilter } from '@entities';

import { CompareTable } from './styles';
import { useTableChange } from '../hooks';

interface TableModelsProps {
  rowList: Array<Partial<Row>>;
  columnList: Column[];
  page: number;
  pageSize: number;
  searchString: string;
  updateRowsCount: (newRowsCount: number) => void;
  setCurrentPage: (newPage: number) => void;
}

export const TableCompareModels = React.memo(
  ({
    rowList,
    columnList,
    page,
    pageSize,
    searchString,
    updateRowsCount,
    setCurrentPage,
  }: TableModelsProps) => {
    const {
      cols,
      rows,
      setCols,
      setRows,
      handleSelectionChange,
      handleResize,
      handleSort,
      handleChangeColumnsFilter,
      handleColumnDragEnd,
      columnsFilters,
      onChangeColumnsFilters,
    } = useTableChange({
      rowList,
      setCurrentPage,
      page,
      updateRowsCount,
      pageSize,
      searchString,
      columnList,
    });

    useEffect(() => {
      if (rowList.length) {
        setRows(rowList);
        updateRowsCount(rowList.length);

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
              columnsFilters={columnsFilters}
              onChangeColumnsFilter={handleChangeColumnsFilter}
            />
          ),
        }));

        setCols(newCols);
      }
    }, [
      rowList,
      columnList,
      columnsFilters,
      onChangeColumnsFilters,
      handleChangeColumnsFilter,
      updateRowsCount,
    ]);

    return (
      <CompareTable
        displayRowSelectionColumn
        greyHeader
        headerLineClamp={1}
        rowList={rows as Array<Partial<Row> & { id: string }>} // fix types
        columnList={cols}
        virtualScroll={{ fixedRowHeight: 40 }}
        style={{ height: 'calc(100vh - 245px)' }}
        onSortChange={handleSort}
        onColumnResize={handleResize}
        onRowSelectionChange={handleSelectionChange}
        onColumnDragEnd={handleColumnDragEnd}
      />
    );
  },
);

TableCompareModels.displayName = 'TableCompareModels';
