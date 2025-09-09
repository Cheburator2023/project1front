import { ColDef } from 'ag-grid-community';
import { CheckboxCellRenderer } from './molecules/CheckboxCellRenderer';
import { CheckboxHeaderRenderer } from './molecules/CheckboxHeaderRenderer';
import { FilterValuesCellRenderer } from './molecules/FilterValuesCellRenderer';

export const columnDefs: ColDef[] = [
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
    flex: 2,
    suppressMenu: true,
    wrapText: true,
    cellRenderer: FilterValuesCellRenderer,
  },
];
