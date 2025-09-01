import { create } from 'zustand';
import { ReportApi } from '@shared/api/types';
import { ColumnsFilter } from '@shared/types';

interface DownloadReportState {
  isDownloading: boolean;
  error: string | null;
  downloadReportStatus: boolean;
  columnsFilters: Partial<ColumnsFilter> | null;
}

interface DownloadReportActions {
  setDownloading: (downloading: boolean) => void;
  setError: (error: string | null) => void;
  updateColumnsFilters: (newColumnsFilters: Partial<ColumnsFilter>) => void;
  setDownloadReportStatus: (status: boolean) => void;
}

export type DownloadReportStore = DownloadReportState & DownloadReportActions;

export const useDownloadReportStore = create<DownloadReportStore>((set, get) => ({
  isDownloading: false,
  error: null,
  downloadReportStatus: false,
  columnsFilters: null,

  setDownloading: (downloading) => set({ isDownloading: downloading }),
  setError: (error) => set({ error }),
  setDownloadReportStatus: (status) => set({ downloadReportStatus: status }),
  updateColumnsFilters: (newColumnsFilters) => set({ columnsFilters: newColumnsFilters }),
}));
