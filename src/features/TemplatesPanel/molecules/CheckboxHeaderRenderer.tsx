import { IHeaderParams } from 'ag-grid-community';
import { Checkbox } from '@admiral-ds/react-ui';
import { useTemplateFiltersModalStore } from '../stores/templateFiltersModalStore';

export const CheckboxHeaderRenderer = (props: IHeaderParams) => {
  const { toggleAllColumns, columnFilters } = useTemplateFiltersModalStore();

  const isAllSelected = columnFilters.every((f) => f.isActive);
  const isIndeterminate = columnFilters.some((f) => f.isActive) && !isAllSelected;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Checkbox
        checked={isAllSelected}
        dimension="s"
        indeterminate={isIndeterminate}
        onChange={toggleAllColumns}
      />
    </div>
  );
};