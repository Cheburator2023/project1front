
import { AgGridModelsTable } from '@src/features/AgGridTables/templates/AgGridModelsTable';
import { RightModalPanel } from '../../features/RightModalPanel';
import { FiltersPanel } from '../../features/FiltersPanel/organisms/FiltersPanel';
import { useModelsControllerGetModels } from '../../shared/api/generated/endpoints';

export const HomePage = () => {

  return (
    <>
      <RightModalPanel />
      <FiltersPanel />
      <AgGridModelsTable />
    </>
  );
};

