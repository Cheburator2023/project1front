import { useState } from 'react';
import { format } from 'date-fns';
import { useReportsControllerGetReport } from '@shared/api/generated/endpoints';
import { ColumnsFilter } from '@shared/types';

/**
 * Хук для выгрузки отчёта "Расчёт модельного риска"
 * 
 * Отчёт использует mode: ['model_risk_calculation'] для активации
 * расчёта КМР с учётом устаревания и КМР сегмента на backend
 */
export const useModelRiskReport = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutate } = useReportsControllerGetReport();

  const downloadReport = (filters: Partial<ColumnsFilter>) => {
    setIsDownloading(true);
    setError(null);

    mutate(
      {
        data: {
          filters,
          mode: ['model_risk_calculation'], // Ключевой параметр!
        },
      },
      {
        onSuccess: (response) => {
          // Response is already a Blob, use it directly
          const url = URL.createObjectURL(response);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Расчет_модельного_риска_${format(new Date(), 'dd.MM.yyyy')}.xlsx`;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          
          // Cleanup
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          setIsDownloading(false);
        },
        onError: (err: any) => {
          console.error('Error downloading model risk report:', err);
          setError(err?.message || 'Ошибка при выгрузке отчёта');
          setIsDownloading(false);
        },
      }
    );
  };

  return {
    downloadReport,
    isDownloading,
    error,
  };
};
