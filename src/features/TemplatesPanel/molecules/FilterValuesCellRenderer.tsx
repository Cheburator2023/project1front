import { COLUMN_TYPE } from '../../../shared/types';
import { DateFieldRenderer } from './DateFieldRenderer';
import { MSelectCellRenderer } from './MSelectCellRenderer';
import { ChipsCellRenderer } from './ChipsCellRenderer';
import { useTemplateFiltersModalStoreSelected } from '../stores/templateFiltersModalStore';

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
  const isEditMode = useTemplateFiltersModalStoreSelected.use.isEditMode();
  
  // If not in edit mode, render chips for read-only display
  if (!isEditMode) {
    return ChipsCellRenderer(params);
  }
  
  // In edit mode, render the appropriate interactive component
  if (params.data.type === COLUMN_TYPE.DATE) {
    return DateFieldRenderer(params);
  }
  return MSelectCellRenderer(params);
};

