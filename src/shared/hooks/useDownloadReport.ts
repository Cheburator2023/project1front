import { useCallback } from 'react';
import { ReportApi } from '@shared/api/types';
import { useDownloadReportStore } from '@shared/stores/downloadReportStore';
import { API_ROUTES, useFetch } from '../api';

export const useDownloadReport = () => {
  const { setDownloading, setError } = useDownloadReportStore();
  const { mutationProtectedFetch } = useFetch({});

  const downloadReport = useCallback(
    async (reportData: ReportApi) => {
      try {
        setDownloading(true);
        setError(null);

        const response = await mutationProtectedFetch({
          fetchApiRoute: API_ROUTES.REPORT_DOWNLOAD,
          fetchMethod: 'POST',
          body: JSON.stringify(reportData),
        });

        if (response && !response.error) {
          const data = response.data as any;
          console.log('🐸 Pepe said >> useDownloadReport >> response:', response);

          console.log('🐸 Pepe said >> useDownloadReport >> data:', data);


          const blob = await data.arrayBuffer();
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `отчет_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);

          setDownloading(false);
        } else {
          const errorMessage = response?.data?.message;
          setError(errorMessage || 'Ошибка загрузки отчета');
          return;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
        setError(errorMessage);
        setDownloading(false);
      }
    },
    [setDownloading, setError],
  );

  return { downloadReport };
};

