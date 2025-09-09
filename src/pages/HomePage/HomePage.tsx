import { AgGridModelsTable } from '@src/features/AgGridTables/templates/AgGridModelsTable';
import { RightModalPanel } from '../../features/RightModalPanel';
import { FiltersPanel } from '../../features/FiltersPanel/organisms/FiltersPanel';
import { TemplatesPanel } from '../../features/TemplatesPanel/organisms/TemplatesPanel';
import { Flexbox } from '../../shared/ui/atoms';

export const HomePage = () => {
  return (
    <>
      <RightModalPanel />
      <Flexbox alignItems="center" gap={12} style={{ padding: '0px 12px', background: '#e5e7eb' }}>
        <TemplatesPanel />
        <FiltersPanel />
      </Flexbox>
      <AgGridModelsTable />
    </>
  );
};

