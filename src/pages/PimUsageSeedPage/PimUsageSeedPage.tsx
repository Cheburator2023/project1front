import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { SelectionChangedEvent, ColDef } from 'ag-grid-community';
import { Button, Checkbox, InputField, T } from '@admiral-ds/react-ui';
import { AgGridModelsTable } from '@src/features/AgGridTables/templates/AgGridModelsTable';

import { AG_GRID_LOCALE_RU } from '../../app/agGridLocale.ru';
import { RightModalPanel } from '../../features/RightModalPanel';
import { Flexbox, Spacer, useToast } from '../../shared/ui/atoms';
import { Row } from '../../shared/types';
import {
  useActiveQuarter,
  useSeedPimUsage,
  usePimUsageTable,
  type PimUsageTableRow,
} from '../../shared/api/hooks/useQuarterlyConfirmation';

/**
 * Страница утилиты: тот же грид моделей, что на главной + выбор строк и запись в
 * models_pim_usage через POST /quarterly-confirmation/seed-pim-usage.
 */
export const PimUsageSeedPage = () => {
  const { showToast } = useToast();

  const { data: quarterRes } = useActiveQuarter();

  const [quarter, setQuarter] = useState<number>(1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [pimUsed, setPimUsed] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const q = quarterRes?.data;
    if (q) {
      setQuarter(q.quarter);
      setYear(q.year);
    }
  }, [quarterRes?.data]);

  const handleSelectionChanged = useCallback((e: SelectionChangedEvent) => {
    const rows = e.api.getSelectedRows() as Partial<Row>[];
    const ids = rows
      .map((r) => r.system_model_id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
    setSelectedIds(ids);
  }, []);

  const seedMutation = useSeedPimUsage();
  const { data: pimTableRes, isLoading: pimTableLoading, refetch: refetchPimTable } =
    usePimUsageTable();

  const pimUsageRows = pimTableRes?.data?.rows ?? [];

  const pimUsageColDefs = useMemo<ColDef<PimUsageTableRow>[]>(
    () => [
      { field: 'pim_usage_id', headerName: 'ID', width: 80, pinned: 'left' },
      { field: 'system_model_id', headerName: 'system_model_id', flex: 1, minWidth: 280 },
      {
        field: 'confirmation_year',
        headerName: 'Год',
        width: 90,
      },
      {
        field: 'confirmation_quarter',
        headerName: 'Квартал',
        width: 100,
      },
      {
        field: 'is_used',
        headerName: 'is_used',
        width: 100,
      },
      { field: 'source_system', headerName: 'source_system', flex: 0.8, minWidth: 110 },
      { field: 'create_date', headerName: 'create_date', flex: 1, minWidth: 160 },
      { field: 'update_date', headerName: 'update_date', flex: 1, minWidth: 160 },
    ],
    [],
  );

  const handleSeed = () => {
    if (selectedIds.length === 0) {
      showToast({
        message: 'Выберите одну или несколько моделей в таблице (чекбоксы слева).',
        type: 'warning',
        duration: 5000,
      });
      return;
    }
    seedMutation.mutate(
      {
        quarter,
        year,
        models: selectedIds.map((system_model_id) => ({
          system_model_id,
          is_used: pimUsed,
        })),
      },
      {
        onSuccess: async (res) => {
          const n = res?.data?.seeded?.length ?? selectedIds.length;
          await refetchPimTable();
          showToast({
            message: `Записано в ПИМ: ${n} модель(ей) для Q${quarter} ${year}.`,
            type: 'success',
            duration: 6000,
          });
        },
        onError: () => {
          showToast({
            message: 'Ошибка записи seed-pim-usage. Проверьте права и сеть.',
            type: 'error',
            duration: 8000,
          });
        },
      },
    );
  };

  const quarterStr = quarter.toString();
  const yearStr = year.toString();

  return (
    <>
      <RightModalPanel />
      <Flexbox
        flexDirection="column"
        style={{
          gap: 0,
          flex: 1,
          width: '100%',
          minHeight: 0,
          overflowY: 'auto',
          background: '#f3f4f6',
        }}
      >
        <Flexbox
          alignItems="flex-end"
          wrap="wrap"
          gap={16}
          style={{ padding: '12px', background: '#e5e7eb' }}
        >
          <div style={{ minWidth: 72 }}>
            <T font="Caption/Caption 1" color="Neutral/Neutral 50">
              Квартал (1–4)
            </T>
            <InputField
              dimension="s"
              value={quarterStr}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isNaN(v)) {
                  setQuarter(1);
                  return;
                }
                setQuarter(Math.min(4, Math.max(1, Math.round(v))));
              }}
            />
          </div>
          <div style={{ minWidth: 92 }}>
            <T font="Caption/Caption 1" color="Neutral/Neutral 50">
              Год
            </T>
            <InputField
              dimension="s"
              value={yearStr}
              onChange={(e) => {
                const v = Number(e.target.value);
                setYear(Number.isNaN(v) ? new Date().getFullYear() : Math.round(v));
              }}
            />
          </div>
          <Flexbox alignItems="center" gap={8} style={{ marginBottom: 4 }}>
            <Checkbox
              dimension="s"
              checked={pimUsed}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPimUsed(e.target.checked)}
            />
            <T font="Body/Body 2 Short">Признак is_used для выбранных</T>
          </Flexbox>
          <Spacer />
          <Button dimension="s" appearance="secondary" onClick={() => refetchPimTable()}>
            Обновить таблицу ПИМ
          </Button>
          <Button dimension="s" onClick={handleSeed} loading={seedMutation.isPending}>
            Seed PIM (выбрано: {selectedIds.length})
          </Button>
        </Flexbox>


        <div
          data-name="pim-seed-models-grid-slot"
          style={{
            flex: '0 0 auto',
            width: '100%',
            height: 'clamp(260px, 46vh, 560px)',
            minHeight: 260,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <AgGridModelsTable
            onSelectionChanged={handleSelectionChanged}
            wrapperHeight="100%"
          />
        </div>

        <div data-name="pim-usage-grid-header" style={{ flex: '0 0 auto', padding: '12px 12px 8px', background: '#f3f4f6' }}>
          <T font="Subtitle/Subtitle 2" color="Neutral/Neutral 90" as="div">
            Таблица models_pim_usage (текущее состояние)
          </T>
        </div>
        <div
          data-name="pim-usage-grid"
          className="ag-theme-quartz"
          style={{
            flex: '0 0 auto',
            width: '100%',
            padding: '0 12px 16px',
            background: '#f3f4f6',
            height: 'clamp(240px, 34vh, 440px)',
            minHeight: 240,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ flex: '1 1 auto', width: '100%', minHeight: 0 }}>
            <AgGridReact<PimUsageTableRow>
              rowData={pimUsageRows}
              columnDefs={pimUsageColDefs}
              defaultColDef={{ resizable: true, sortable: true, filter: true }}
              loading={pimTableLoading}
              getRowId={(p) => String(p.data.pim_usage_id)}
              animateRows={false}
              enableCellTextSelection
              rowHeight={40}
              localeText={AG_GRID_LOCALE_RU}
              overlayNoRowsTemplate={
                '<span style="color:#9ca3af">Нет строк в models_pim_usage</span>'
              }
            />
          </div>
        </div>
        <Spacer height={200} />
      </Flexbox>
    </>
  );
};
