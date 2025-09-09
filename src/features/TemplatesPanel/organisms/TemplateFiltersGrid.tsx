import { memo, useCallback, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { GridReadyEvent, RowDragEndEvent } from 'ag-grid-community';
import styled from 'styled-components';
import {
  useTemplateFiltersModalStore,
  useTemplateFiltersModalStoreSelected,
} from '../stores/templateFiltersModalStore';
import { COLUMN_TYPE } from '../../../shared/types';
import { FilterValuesCellRenderer } from '../molecules/FilterValuesCellRenderer';
import { CheckboxCellRenderer } from '../molecules/CheckboxCellRenderer';
import { CheckboxHeaderRenderer } from '../molecules/CheckboxHeaderRenderer';

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
  const [columnDefs] = useState([
    {
      headerName: '',
      field: 'drag',
      rowDrag: true,
      width: 50,
      maxWidth: 55,
      suppressMenu: true,
    },
    {
      headerName: 'Активна',
      field: 'isActive',
      width: 55,
      maxWidth: 55,
      suppressMenu: true,
      cellRenderer: CheckboxCellRenderer,
      headerComponent: CheckboxHeaderRenderer,
    },
    {
      headerName: 'Название колонки',
      field: 'title',
      flex: 1,
      suppressMenu: true,
      wrapText: true,
    },
    {
      headerName: 'Значения фильтров',
      field: 'filterValues',
      suppressMenu: true,
      cellRenderer: memo(FilterValuesCellRenderer),
    },
  ]);
  const columnFilters = useTemplateFiltersModalStoreSelected.use.columnFilters();
  const reorderColumns = useTemplateFiltersModalStoreSelected.use.reorderColumns();
  const quickFilterText = useTemplateFiltersModalStoreSelected.use.quickFilterText();
  const setLocalGridApi = useTemplateFiltersModalStoreSelected.use.setLocalGridApi();

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
        rowData={columnFilters}
        columnDefs={columnDefs}
        rowDragManaged
        suppressContextMenu
        onRowDragEnd={onRowDragEnd}
        onGridReady={onGridReady}
        rowBuffer={2}
        suppressCellFocus
        rowSelection={undefined}
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

