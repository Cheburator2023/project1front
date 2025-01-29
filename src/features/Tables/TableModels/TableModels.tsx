import React, { useEffect } from 'react';
import { Column as AdmiralColumn } from '@admiral-ds/react-ui';
import { usePermissions } from '@src/shared/hooks';

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
    templates,
  }: TableModelsProps) => {
    const {
      cols,
      pageRows,
      setCols,
      setRows,
      handleSelectionChange,
      handleResize,
      handleSort,
      handleChangeColumnsFilter,
      handleColumnDragEnd,
      columnsFilters,
      onChangeColumnsFilters,
      onChangeTopFilters,
      topFilters,
    } = useTableChange({
      rowList,
      setCurrentPage,
      page,
      updateRowsCount,
      pageSize,
      searchString,
      columnList,
      templates,
    });

    const { isEditModelEnabled } = usePermissions();

    useEffect(() => {
      if (rowList.length) {
        setRows(rowList);
        updateRowsCount(rowList.length);

        // TODO: подумать как вынести. ATTENTION нарушение правила импорта!!!
        const newCols: Array<AdmiralColumn & Column> = columnList.map((column) => ({
          ...column,
          width: column.width ?? '200px',
          sortable: column.type !== COLUMN_TYPE.ACTION,
          sticky: !!column.sticky,
          cellAlign: column.type === COLUMN_TYPE.NUMBER ? 'right' : 'left',
          renderCell: (value: string, row: Row) => {
            if (column.type === COLUMN_TYPE.ACTION) {
              return (
                <>
                  {value === '1' && row.system_model_id ? (
                    <CellWrapper type={COLUMN_TYPE.STRING}>
                      <ModelRelationsModal modelId={row.system_model_id} />
                    </CellWrapper>
                  ) : null}
                </>
              );
            }

            const editable =
              isEditModelEnabled &&
              !(column.name === 'reason_model_delete' || column.name === 'status');

            return (
              <CustomCell
                column={column}
                value={value}
                editable={editable}
                row={row}
                onAction={(action) => {
                  onActionCell(action, row.system_model_id, column.name);
                }}
              />
            );
          },
          extraText:
            column.type !== COLUMN_TYPE.ACTION ? (
              <ColumnFilter
                column={column}
                rowList={rowList}
                columnsFilters={columnsFilters}
                onChangeColumnsFilter={handleChangeColumnsFilter}
                onChangeTopFilters={onChangeTopFilters}
                topFilters={topFilters}
                templates={templates}
              />
            ) : null,
        }));

        setCols(newCols);
      }
    }, [
      rowList,
      columnList,
      columnsFilters,
      isEditModelEnabled,
      onChangeColumnsFilters,
      handleChangeColumnsFilter,
      updateRowsCount,
      onChangeTopFilters,
      topFilters,
      templates,
    ]);

    return (
      <CustomTable
        displayRowSelectionColumn
        greyHeader
        headerLineClamp={1}
        rowList={pageRows as Array<Partial<Row> & { id: string }>} // fix types
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
