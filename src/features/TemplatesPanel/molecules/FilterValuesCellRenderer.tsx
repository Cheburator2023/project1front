import { memo } from 'react';
import { COLUMN_TYPE } from '../../../shared/types';
import { DateFieldRenderer } from './DateFieldRenderer';
import { MSelectCellRenderer } from './MSelectCellRenderer';

interface FilterValuesCellRendererProps {
  data: any;
  value: any;
  node: any;
  api: any;
  columnApi: any;
  context: any;
  colDef: any;
  column: any;
  rowIndex: number;
  getValue: () => any;
  setValue: (value: any) => void;
  formatValue: (value: any) => any;
  refreshCell: () => void;
  eGridCell: HTMLElement;
  eParentOfValue: HTMLElement;
  addRenderedRowListener: (eventType: string, listener: () => void) => void;
}

export const FilterValuesCellRenderer = (params: FilterValuesCellRendererProps) => {
  if (params.data.type === COLUMN_TYPE.DATE) {
    return DateFieldRenderer(params);
  }
  return MSelectCellRenderer(params);
};

