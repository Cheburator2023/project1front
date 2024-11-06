import { createContext } from 'react';

import { initialColumnsFilters, initialTopFilters } from '@shared/constants';
import { TopFilters, ColumnsFilter } from '@shared/types';

interface FiltersContext {
  columnsFilters: Partial<ColumnsFilter>;
  firstDate: string | null;
  secondDate: string | null;
  modelsDownloadingDate?: string;
  topFilters: TopFilters;
  onChangeTopFilters: (newTopFilters: TopFilters) => void;
  onChangeColumnsFilters: (newColumnsFilters: Partial<ColumnsFilter>) => void;
  onChangeFirstDate: (newFirstDate: string) => void;
  onChangeSecondDate: (newSecondDate: string) => void;
  onChangeModelDownloadingDate: (newDate: string) => void;
}

export const FiltersContext = createContext<FiltersContext>({
  firstDate: null,
  secondDate: null,
  columnsFilters: initialColumnsFilters,
  topFilters: initialTopFilters,
  onChangeTopFilters: () => null,
  onChangeColumnsFilters: () => null,
  onChangeFirstDate: () => null,
  onChangeSecondDate: () => null,
  onChangeModelDownloadingDate: () => null,
});

