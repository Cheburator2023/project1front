import { createContext } from 'react';
import { ColumnsFilter } from 'src/modules/Home/TableModels/types';
import { initialColumnsFilters } from './constants';
import { TopFilters } from './FiltersPanel/types';
import { initialTopFilters } from './FiltersPanel/constants';

interface FiltersContext {
  columnsFilters: Partial<ColumnsFilter>;
  topFilters: TopFilters;
  onChangeTopFilters: (newTopFilters: TopFilters) => void;
  onChangeColumnsFilters: (newColumnsFilters: Partial<ColumnsFilter>) => void;
}

export const FiltersContext = createContext<FiltersContext>({
  columnsFilters: initialColumnsFilters,
  topFilters: initialTopFilters,
  onChangeTopFilters: () => null,
  onChangeColumnsFilters: () => null,
});
