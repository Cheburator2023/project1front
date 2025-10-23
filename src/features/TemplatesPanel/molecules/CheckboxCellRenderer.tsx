import { Checkbox } from '@admiral-ds/react-ui';
import { useTemplateFiltersModalStore, useTemplateFiltersModalStoreSelected } from '../stores/templateFiltersModalStore';
import { Flexbox } from '../../../shared/ui/atoms';

export const CheckboxCellRenderer = ({ data }: any) => {
  const toggleColumnActive = useTemplateFiltersModalStoreSelected.use.toggleColumnActive();
  const setResetInitialized = useTemplateFiltersModalStoreSelected.use.setResetInitialized();

  return (
    <Flexbox alignItems="center" height="100%">
      <Checkbox
        dimension="s"
        checked={data.isActive}
        onChange={() => {
      setResetInitialized(false);

          return toggleColumnActive(data.colId);
        }}
      />
    </Flexbox>
  );
};
