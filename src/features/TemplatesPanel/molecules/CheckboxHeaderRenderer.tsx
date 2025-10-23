import { IHeaderParams } from 'ag-grid-community';
import { Checkbox } from '@admiral-ds/react-ui';
import {
  useTemplateFiltersModalStore,
  useTemplateFiltersModalStoreSelected,
} from '../stores/templateFiltersModalStore';

export const CheckboxHeaderRenderer = (props: IHeaderParams) => {
  const columnFilters = useTemplateFiltersModalStoreSelected.use.columnFilters();
  const toggleAllColumns = useTemplateFiltersModalStoreSelected.use.toggleAllColumns();
  const setResetInitialized = useTemplateFiltersModalStoreSelected.use.setResetInitialized();

  const isAllSelected = columnFilters.every((f) => f.isActive);
  const isIndeterminate = columnFilters.some((f) => f.isActive) && !isAllSelected;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Checkbox
        checked={isAllSelected}
        dimension="s"
        indeterminate={isIndeterminate}
        onChange={() => {
          setResetInitialized(false);
          return toggleAllColumns();
        }}
      />
    </div>
  );
};

