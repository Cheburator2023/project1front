import { memo, useCallback, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, IRichCellEditorParams, RowDragEndEvent } from 'ag-grid-community';
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
    return 40;
  }
  if (params.data.type === COLUMN_TYPE.STRING) {
    return 40;
  }
  return 40;
};

const columnDefs: ColDef[] = [
  {
    headerName: '',
    field: 'drag',
    rowDrag: true,
    width: 50,
    maxWidth: 55,
    suppressMenu: true,
  },
  {
    headerName: 'Колонка с чексбоксами (Активный)',
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
    minWidth: 550,
    initialWidth: 550,
    maxWidth: 755,
  },
  {
    headerName: 'Значения фильтров',
    field: 'filterValues',
    suppressMenu: true,

    cellRenderer: FilterValuesCellRenderer,
  },
];

export const TemplateFiltersGrid = () => {
  const columnFilters = useTemplateFiltersModalStoreSelected.use.columnFilters();
  const reorderColumns = useTemplateFiltersModalStoreSelected.use.reorderColumns();
  const _quickFilterText = useTemplateFiltersModalStoreSelected.use.quickFilterText();
  const setLocalGridApi = useTemplateFiltersModalStoreSelected.use.setLocalGridApi();

  const rowData = useMemo(() => columnFilters, [columnFilters]);
  const quickFilterText = useMemo(() => _quickFilterText, [_quickFilterText]);

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
        rowBuffer={2}
        // suppressCellFocus
        rowSelection={undefined}
        getRowHeight={getRowHeight}
        quickFilterText={quickFilterText}
      />
    </TableWrapper>
  );
};

const TableWrapper = styled('div')`
  height: 100%;
  width: 100%;

  .ag-cell-wrapper {
    height: -webkit-fill-available;
  }

  .ag-cell {
    line-height: normal;
    display: flex;
    align-items: center;
    font-size: 11px;
  }

  .ag-header-cell {
    font-size: 11px;
  }
`;

