import { useCallback, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, RowDragEndEvent, IHeaderParams } from 'ag-grid-community';
import { Checkbox, Chips } from '@admiral-ds/react-ui';
import {
  useTemplateFiltersModalStore,
  ColumnFilterData,
} from '../stores/templateFiltersModalStore';
import { Flexbox } from '../../../shared/ui/atoms';

const CheckboxHeaderRenderer = (props: IHeaderParams) => {
  const { toggleAllColumns, columnFilters } = useTemplateFiltersModalStore();

  const isAllSelected = columnFilters.every((f) => f.isActive);
  const isIndeterminate = columnFilters.some((f) => f.isActive) && !isAllSelected;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Checkbox
        checked={isAllSelected}
        indeterminate={isIndeterminate}
        onChange={toggleAllColumns}
      />
    </div>
  );
};

const CheckboxCellRenderer = ({ data }: any) => {
  const { toggleColumnActive } = useTemplateFiltersModalStore();

  return (
    <Flexbox alignItems="center" height="100%">
      <Checkbox checked={data.isActive} onChange={() => toggleColumnActive(data.colId)} />
    </Flexbox>
  );
};

const ChipsCellRenderer = ({ data }: any) => {
  if (!data.filterValues || data.filterValues.length === 0) {
    return <span style={{ color: '#999' }}>Нет фильтров</span>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {data.filterValues.map((value: string, index: number) => (
        <Chips key={index} appearance="filled" disabled>
          {value}
        </Chips>
      ))}
    </div>
  );
};

export const TemplateFiltersGrid = () => {
  const { columnFilters, reorderColumns } = useTemplateFiltersModalStore();

  const rowData = useMemo(() => {
    return columnFilters.sort((a, b) => a.order - b.order);
  }, [columnFilters]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: '',
        field: 'drag',
        rowDrag: true,
        width: 50,
        suppressMenu: true,
        suppressSorting: true,
        suppressFilter: true,
      },
      {
        headerName: 'Активна',
        field: 'isActive',
        width: 55,
        maxWidth: 55,
        suppressMenu: true,
        suppressSorting: true,
        suppressFilter: true,
        cellRenderer: CheckboxCellRenderer,
        headerComponent: CheckboxHeaderRenderer,
      },
      {
        headerName: 'Название колонки',
        field: 'title',
        flex: 1,
        suppressMenu: true,
        suppressSorting: true,
        suppressFilter: true,
      },
      {
        headerName: 'Значения фильтров',
        field: 'filterValues',
        flex: 2,
        suppressMenu: true,
        suppressSorting: true,
        suppressFilter: true,
        cellRenderer: ChipsCellRenderer,
      },
    ],
    [],
  );

  const onRowDragEnd = useCallback(
    (event: RowDragEndEvent) => {
      const { node, overNode } = event;

      if (!node || !overNode) {
        return;
      }

      const startIndex = columnFilters.findIndex((f) => f.colId === node.data.colId);
      const endIndex = columnFilters.findIndex((f) => f.colId === overNode.data.colId);

      if (startIndex !== -1 && endIndex !== -1) {
        reorderColumns(startIndex, endIndex);
      }
    },
    [columnFilters, reorderColumns],
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div className="ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        rowDragManaged
        suppressContextMenu
        onRowDragEnd={onRowDragEnd}
        onGridReady={onGridReady}
        suppressRowClickSelection
        suppressCellFocus
        headerHeight={40}
        rowHeight={50}
        animateRows
      />
    </div>
  );
};

