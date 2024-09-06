import React, { useEffect } from 'react';
import { Column as AdmiralColumn } from '@admiral-ds/react-ui';

import { Column, COLUMN_TYPE, Row } from '@shared/types';
import { CellWrapper, ColumnFilter, CustomCell } from '@entities';
import { ModelRelationsModal } from '@features';

import { CustomTable } from './styles';
import { useTableChange } from '../hooks';
import { TableModelsProps } from '../types';

// TODO: передавать в хук (props)
export const TableModels = React.memo(
  ({
    rowList,
    columnList,
    page,
    pageSize,
    searchString,
    onActionCell,
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

        // TODO: подумать как вынести. ATTENTION нарушение правила импорта!!!
        const relationsColl: AdmiralColumn & Column = {
          name: 'relations',
          title: '',
          type: COLUMN_TYPE.STRING,
          width: '48px',
          sortable: false,
          sticky: true,
          cellAlign: 'right',
          renderCell: (value: string, row: Row) => (
            <>
              {value === '1' && row.system_model_id ? (
                <CellWrapper type={COLUMN_TYPE.STRING}>
                  <ModelRelationsModal modelId={row.system_model_id} />
                </CellWrapper>
              ) : null}
            </>
          ),
        };

        const newCols: Array<AdmiralColumn & Column> = columnList.map((column) => ({
          ...column,
          width: '200px',
          sortable: true,
          sticky: false,
          cellAlign: column.type === COLUMN_TYPE.NUMBER ? 'right' : 'left',
          renderCell: (value: string, row: Row) => (
            <CustomCell
              column={column}
              value={value}
              row={row}
              editable={row?.model_source !== 'sum'}
              onAction={(action) => {
                onActionCell(action, row.system_model_id, column.name);
              }}
            />
          ),
          extraText: (
            <ColumnFilter
              column={column}
              rowList={rowList}
              columnsFilters={columnsFilters}
              onChangeColumnsFilter={handleChangeColumnsFilter}
            />
          ),
        }));

        setCols([relationsColl, ...newCols]);
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
      <CustomTable
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

TableModels.displayName = 'TableModels';
