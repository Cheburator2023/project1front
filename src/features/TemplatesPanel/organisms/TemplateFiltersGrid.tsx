import { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { GridReadyEvent, RowDragEndEvent } from 'ag-grid-community';
import styled from 'styled-components';
import { useTemplateFiltersModalStore } from '../stores/templateFiltersModalStore';
import { COLUMN_TYPE } from '../../../shared/types';
import { columnDefs } from '../columnDefs';

const getRowHeight = (params: any) => {
  if (params.data.type === COLUMN_TYPE.DATE) {
    return 130;
  }
  if (params.data.type === COLUMN_TYPE.STRING) {
    return 50;
  }
  return 50;
};

export const TemplateFiltersGrid = () => {
  const { columnFilters, reorderColumns, quickFilterText, setLocalGridApi } =
    useTemplateFiltersModalStore();

  const rowData = useMemo(() => {
    return columnFilters.sort((a, b) => a.order - b.order);
  }, [columnFilters]);

  const onRowDragEnd = useCallback(
    (event: RowDragEndEvent) => {
      const { node, overNode, overIndex } = event;

      if (!node || overIndex === undefined) {
        return;
      }

      const startIndex = columnFilters.findIndex((f) => f.colId === node.data.colId);
      const endIndex = overIndex;

      if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
        reorderColumns(startIndex, endIndex);
      }
    },
    [columnFilters, reorderColumns],
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      params.api.sizeColumnsToFit();
      params.api.resetRowHeights();
      setLocalGridApi(params.api);
    },
    [setLocalGridApi],
  );

  return (
    <TableWrapper className="ag-theme-quartz">
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        rowDragManaged
        suppressContextMenu
        onRowDragEnd={onRowDragEnd}
        onGridReady={onGridReady}
        suppressRowClickSelection
        suppressCellFocus
        getRowHeight={getRowHeight}
        animateRows={false}
        quickFilterText={quickFilterText}
      />
    </TableWrapper>
  );
};

const TableWrapper = styled('div')`
  height: 100%;
  width: 100%;
  zoom: 0.8;

  .ag-cell-wrapper {
    height: -webkit-fill-available;
  }

  .ag-cell {
    line-height: normal;
    display: flex;
    align-items: center;
  }
`;

