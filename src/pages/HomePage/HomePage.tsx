
import { AgGridModelsTable } from '@src/features/AgGridTables/templates/AgGridModelsTable';
import { RightModalPanel } from '../../features/RightModalPanel';
import { FiltersPanel } from '../../features/FiltersPanel/organisms/FiltersPanel';

export const HomePage = () => {
  return (
    <>
      <RightModalPanel />
      <FiltersPanel />
      <AgGridModelsTable />
    </>
  );
};

