import { createContext } from 'react';
import { ColumnsFilter } from '@shared/types';

interface DownloadReportContext {
  downloadReportStatus: boolean;
  updateColumnsFilters: (newColumnsFilters: Partial<ColumnsFilter>) => void;
}

export const DownloadReportContext = createContext<DownloadReportContext>({
  downloadReportStatus: false,
  updateColumnsFilters: () => null,
});
