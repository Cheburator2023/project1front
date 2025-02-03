/* eslint-disable no-nested-ternary */
import React, { useEffect } from 'react';
import { Column as AdmiralColumn } from '@admiral-ds/react-ui';

import { Column, COLUMN_TYPE, Row } from '@shared/types';
import { CellWrapper, ColumnFilter, CustomCell } from '@entities';
import { ModelRelationsModal } from '@features';

import styled from 'styled-components';
import { CustomTable } from './styles';
import { useTableChange } from '../hooks';
import { TableModelsProps } from '../types';
import { ErrorStatus, Loading } from '../../../shared/ui/atoms';

// TODO: передавать в хук (props)
export const TableModels = React.memo(
  ({
    rowList,
    columnList,
    page = 0,
    pageSize,
    searchString,
    onActionCell,
    updateRowsCount,
    setCurrentPage,
    templates,
    error,
    loading,
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

    useEffect(() => {
      if (rowList?.length) {
        setRows(rowList);
        updateRowsCount(rowList.length);

        // TODO: подумать как вынести. ATTENTION нарушение правила импорта!!!
        const newCols: Array<AdmiralColumn & Column> = columnList.map((column) => ({
          ...column,
          width: column.width ?? '200px',
          sortable: column.type !== COLUMN_TYPE.ACTION,
          sticky: !!column.sticky,
          cellAlign: column.type === COLUMN_TYPE.NUMBER ? 'right' : 'left',
          renderCell: (value: string, row: Row) =>
            column.type === COLUMN_TYPE.ACTION ? ( // TODO: move this logic to custom cell component
              <>
                {value === '1' && row.system_model_id ? (
                  <CellWrapper type={COLUMN_TYPE.STRING}>
                    <ModelRelationsModal modelId={row.system_model_id} />
                  </CellWrapper>
                ) : null}
              </>
            ) : (
              <CustomCell
                column={column}
                value={value}
                editable={!(column.name === 'reason_model_delete' || column.name === 'status')}
                row={row}
                onAction={(action) => {
                  onActionCell(action, row.system_model_id, column.name);
                }}
              />
            ),
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
      onChangeColumnsFilters,
      handleChangeColumnsFilter,
      updateRowsCount,
      onChangeTopFilters,
      topFilters,
      templates,
    ]);

    return (
      <div>
        {loading || error ? (
          <StatusWrapper>
            {error ? (
              <ErrorStatus text={error} />
            ) : loading ? (
              <Loading text="Загрузка данных ..." />
            ) : null}
          </StatusWrapper>
        ) : null}
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
      </div>
    );
  },
);

TableModels.displayName = 'TableModels';

const StatusWrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  padding: 50px 0;
  justify-content: center;
  position: absolute;
  align-items: center;
  z-index: 10;
  background-color: #fffffff0;
  pointer-events: none;
`;
