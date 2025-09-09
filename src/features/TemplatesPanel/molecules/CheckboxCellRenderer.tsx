import { Checkbox } from '@admiral-ds/react-ui';
import { useTemplateFiltersModalStore, useTemplateFiltersModalStoreSelected } from '../stores/templateFiltersModalStore';
import { Flexbox } from '../../../shared/ui/atoms';

export const CheckboxCellRenderer = ({ data }: any) => {
  const toggleColumnActive = useTemplateFiltersModalStoreSelected.use.toggleColumnActive();


  return (
    <Flexbox alignItems="center" height="100%">
      <Checkbox
        dimension="s"
        checked={data.isActive}
        onChange={() => toggleColumnActive(data.colId)}
      />
    </Flexbox>
  );
};
