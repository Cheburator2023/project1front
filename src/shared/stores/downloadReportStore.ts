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
  downloadReport: (reportData: ReportApi) => Promise<void>;
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

  downloadReport: async (reportData: ReportApi) => {
    const { setDownloading, setError } = get();
    
    try {
      setDownloading(true);
      setError(null);

      const url = new URL('/api/reports/download', process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000');
      
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ошибка загрузки отчета' }));
        setError(errorData.message || 'Ошибка загрузки отчета');
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `отчет_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setDownloading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setError(errorMessage);
      setDownloading(false);
    }
  },
}));