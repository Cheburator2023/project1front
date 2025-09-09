/* eslint-disable react/button-has-type */
import React, { useState } from 'react';
import { Button } from '@admiral-ds/react-ui';
import {
  useBiDatamartControllerSyncModelsDatamart,
  useBiDatamartControllerSyncTasksDatamart,
} from '@src/shared/api/generated/endpoints';

interface BiSyncInterfaceProps {
  useDatamart: boolean;
  onSyncComplete: () => void;
}

interface SyncProgress {
  total: number;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

export const BiSyncInterface: React.FC<BiSyncInterfaceProps> = ({
  useDatamart,
  onSyncComplete,
}) => {
  const [isSyncingModels, setIsSyncingModels] = useState(false);
  const [isSyncingTasks, setIsSyncingTasks] = useState(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);

  const syncModelsMutation = useBiDatamartControllerSyncModelsDatamart();
  const syncTasksMutation = useBiDatamartControllerSyncTasksDatamart();

  const handleSyncModelsDatamart = async () => {
    setIsSyncingModels(true);
    setSyncLogs([]);
    setSyncProgress(null);

    try {
      setSyncLogs((prev) => [...prev, '🚀 Начало синхронизации BI витрины моделей...']);

      const response: any = await syncModelsMutation.mutateAsync();
      console.log('🐸 Pepe said >> handleSyncModelsDatamart >> response:', response);


      if (response && !syncModelsMutation.isError) {
        const data = response as any;

        if (data.message) {
          setSyncLogs((prev) => [...prev, `✅ ${data.message}`]);
        }

        if (data.totalProcessed !== undefined) {
          setSyncProgress({
            total: data.totalProcessed,
            processed: data.totalProcessed,
            inserted: data.inserted || 0,
            updated: data.updated || 0,
            skipped: data.skipped || 0,
            errors: (data.errors || []).length,
          });
        }

        if (data.totalProcessed !== undefined) {
          setSyncLogs((prev) => [
            ...prev,
            `📊 Обработано: ${data.totalProcessed} моделей`,
            `🆕 Вставлено: ${data.inserted || 0}`,
            `🔄 Обновлено: ${data.updated || 0}`,
            `⏭️ Пропущено: ${data.skipped || 0}`,
            `⏱️ Время выполнения: ${data.duration_ms || 0}мс`,
          ]);
        }

        if (data.errors && data.errors.length > 0) {
          setSyncLogs((prev) => [
            ...prev,
            `⚠️ Ошибки (${data.errors.length}):`,
            ...data.errors.map((error: string) => `   • ${error}`),
          ]);
        }

        setSyncLogs((prev) => [...prev, '🔄 Обновляем данные дашборда...']);
        onSyncComplete();
        setSyncNotification('Модели успешно синхронизированы');
        setTimeout(() => setSyncNotification(null), 5000);
      } else {
        const errorMessage = response?.data?.message || 'Ошибка синхронизации моделей';
        setSyncLogs((prev) => [...prev, `❌ Ошибка: ${errorMessage}`]);
        setSyncNotification(errorMessage);
        setTimeout(() => setSyncNotification(null), 5000);
      }
    } catch (error) {
      setSyncLogs((prev) => [...prev, `💥 Критическая ошибка: ${(error as Error).message}`]);
      setSyncNotification('Ошибка синхронизации моделей');
      setTimeout(() => setSyncNotification(null), 5000);
    } finally {
      setIsSyncingModels(false);
      setTimeout(() => {
        setSyncProgress(null);
        setSyncLogs([]);
      }, 10000);
    }
  };

  const handleSyncTasksDatamart = async () => {
    setIsSyncingTasks(true);
    setSyncLogs([]);
    setSyncProgress(null);

    try {
      setSyncLogs((prev) => [...prev, '🚀 Начало синхронизации BI витрины задач...']);

      const response: any = await syncTasksMutation.mutateAsync();
      console.log('🐸 Pepe said >> handleSyncTasksDatamart >> response:', response);


      if (response && !syncTasksMutation.isError) {
        const data = response as any;

        if (data.message) {
          setSyncLogs((prev) => [...prev, `✅ ${data.message}`]);
        }

        if (data.totalProcessed !== undefined) {
          setSyncProgress({
            total: data.totalProcessed,
            processed: data.totalProcessed,
            inserted: data.inserted || 0,
            updated: data.updated || 0,
            skipped: data.skipped || 0,
            errors: (data.errors || []).length,
          });
        }

        if (data.totalProcessed !== undefined) {
          setSyncLogs((prev) => [
            ...prev,
            `📊 Обработано: ${data.totalProcessed} задач`,
            `🆕 Вставлено: ${data.inserted || 0}`,
            `🔄 Обновлено: ${data.updated || 0}`,
            `⏭️ Пропущено: ${data.skipped || 0}`,
            `⏱️ Время выполнения: ${data.duration_ms || 0}мс`,
          ]);
        }

        if (data.errors && data.errors.length > 0) {
          setSyncLogs((prev) => [
            ...prev,
            `⚠️ Ошибки (${data.errors.length}):`,
            ...data.errors.map((error: string) => `   • ${error}`),
          ]);
        }

        setSyncLogs((prev) => [...prev, '🔄 Обновляем данные дашборда...']);
        onSyncComplete();
        setSyncNotification('Задачи успешно синхронизированы');
        setTimeout(() => setSyncNotification(null), 5000);
      } else {
        const errorMessage = response?.data?.message || 'Ошибка синхронизации задач';
        setSyncLogs((prev) => [...prev, `❌ Ошибка: ${errorMessage}`]);
        setSyncNotification(errorMessage);
        setTimeout(() => setSyncNotification(null), 5000);
      }
    } catch (error) {
      setSyncLogs((prev) => [...prev, `💥 Критическая ошибка: ${(error as Error).message}`]);
      setSyncNotification('Ошибка синхронизации задач');
      setTimeout(() => setSyncNotification(null), 5000);
    } finally {
      setIsSyncingTasks(false);
      setTimeout(() => {
        setSyncProgress(null);
        setSyncLogs([]);
      }, 10000);
    }
  };

  if (!useDatamart) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: '5px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <div
        style={{
          marginBottom: '16px',
          fontWeight: '600',
          color: '#374151',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            width: '4px',
            height: '16px',
            background: '#3b82f6',
            borderRadius: '2px',
          }}
        />
        🔄 Синхронизация BI витрин
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Button
          dimension="s"
          appearance="secondary"
          onClick={handleSyncModelsDatamart}
          loading={isSyncingModels}
          disabled={isSyncingModels || isSyncingTasks}
          style={{ minWidth: '180px' }}
        >
          {isSyncingModels ? 'Синхронизация...' : 'Синхронизировать модели'}
        </Button>
        <Button
          dimension="s"
          appearance="secondary"
          onClick={handleSyncTasksDatamart}
          loading={isSyncingTasks}
          disabled={isSyncingModels || isSyncingTasks}
          style={{ minWidth: '180px' }}
        >
          {isSyncingTasks ? 'Синхронизация...' : 'Синхронизировать задачи'}
        </Button>
      </div>

      {syncProgress && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            background: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
          }}
        >
          <div
            style={{
              marginBottom: '12px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px',
            }}
          >
            📊 Прогресс синхронизации
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '12px',
              marginBottom: '12px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#059669' }}>
                {syncProgress.processed}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Обработано</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#3b82f6' }}>
                {syncProgress.inserted}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Вставлено</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#f59e0b' }}>
                {syncProgress.updated}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Обновлено</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280' }}>
                {syncProgress.skipped}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Пропущено</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: syncProgress.errors > 0 ? '#dc2626' : '#059669',
                }}
              >
                {syncProgress.errors}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Ошибки</div>
            </div>
          </div>
        </div>
      )}

      {syncLogs.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            padding: '16px',
            background: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              marginBottom: '12px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            📝 Логи синхронизации
            <button
              onClick={() => setSyncLogs([])}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'underline',
              }}
            >
              Очистить
            </button>
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.5',
              color: '#374151',
            }}
          >
            {syncLogs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: '4px 0',
                  borderBottom: index < syncLogs.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {syncNotification && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: syncNotification.includes('Ошибка') ? '#fef2f2' : '#f0fdf4',
            color: syncNotification.includes('Ошибка') ? '#dc2626' : '#16a34a',
            borderRadius: '6px',
            fontSize: '14px',
            border: `1px solid ${syncNotification.includes('Ошибка') ? '#fecaca' : '#bbf7d0'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: syncNotification.includes('Ошибка') ? '#dc2626' : '#16a34a',
            }}
          />
          {syncNotification}
        </div>
      )}
    </div>
  );
};

