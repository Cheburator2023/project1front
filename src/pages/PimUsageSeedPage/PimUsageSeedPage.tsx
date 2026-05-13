import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import type { SelectionChangedEvent } from 'ag-grid-community';
import { Button, Checkbox, InputField, T } from '@admiral-ds/react-ui';

import { AgGridModelsTable } from '@src/features/AgGridTables/templates/AgGridModelsTable';
import { RightModalPanel } from '../../features/RightModalPanel';
import { FiltersPanel } from '../../features/FiltersPanel/organisms/FiltersPanel';
import { TemplatesPanel } from '../../features/TemplatesPanel/organisms/TemplatesPanel';
import { Flexbox, Spacer, useToast } from '../../shared/ui/atoms';
import { Row } from '../../shared/types';
import {
  useActiveQuarter,
  useSeedPimUsage,
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
        onSuccess: (res) => {
          const n = res?.data?.seeded?.length ?? selectedIds.length;
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
      <Flexbox flexDirection="column" style={{ gap: 0, minHeight: '100%', background: '#f3f4f6' }}>
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
          <Button dimension="s" onClick={handleSeed} loading={seedMutation.isPending}>
            Seed PIM (выбрано: {selectedIds.length})
          </Button>
        </Flexbox>

        <Flexbox alignItems="center" gap={12} style={{ padding: '0px 12px', background: '#e5e7eb' }}>
          <TemplatesPanel />
          <FiltersPanel />
        </Flexbox>

        <div style={{ flex: 1, minHeight: 480 }}>
          <AgGridModelsTable onSelectionChanged={handleSelectionChanged} />
        </div>
      </Flexbox>
    </>
  );
};
