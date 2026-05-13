import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type {
  ColDef,
  ICellRendererParams,
  RowClassParams,
  ValueGetterParams,
} from 'ag-grid-community';
import styled from 'styled-components';
import { Button, Tag } from '@admiral-ds/react-ui';
import type { ConfirmationModelRow } from '@shared/api/hooks/useQuarterlyConfirmation';
import { ModelSource } from '@shared/types/general';
import { ConfirmationSearchBar } from '../molecules/ConfirmationSearchBar';
import { ConfirmationDateCell } from '../molecules/ConfirmationDateCell';
import { UsageStatusCell, usageLabel } from '../molecules/UsageStatusCell';
import { RowStatusChips, rowStatusLabel, rowStatusTitle } from '../molecules/RowStatusChips';
import { AG_GRID_LOCALE_RU } from '../../../app/agGridLocale.ru';

type EditableModel = ConfirmationModelRow & {
  edited_confirmation_date: string | null;
  edited_is_used: boolean | null;
};

type ConfirmationTableProps = {
  models: ConfirmationModelRow[];
  quarter: number;
  year: number;
  minDate: string;
  maxDate: string;
  onSave: (models: EditableModel[]) => void;
  onCancel: () => void;
  isSaving: boolean;
};

const toDateInput = (value: string | null | undefined): string => {
  if (!value) return '';
  return value.length >= 10 ? value.slice(0, 10) : value;
};

function readRegistryString(
  card: Record<string, unknown> | null | undefined,
  key: string,
  fallback: string | null | undefined,
): string {
  const v = card?.[key];
  if (typeof v === 'string' && v.trim() !== '') return v;
  if (fallback != null && String(fallback).trim() !== '') return String(fallback);
  return '';
}

const ActionsBar = styled('div')`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  gap: 12px;
`;

const ActionsRight = styled('div')`
  display: flex;
  gap: 8px;
`;

const GridWrapper = styled('div')`
  height: calc(100vh - 300px);
  width: 100%;

  .ag-row.confirmation-row-new {
    background-color: #fef3c7;
  }
  .ag-row.confirmation-row-new.ag-row-hover {
    background-color: #fde68a;
  }

  & .ag-filter-menu .ag-set-filter-list {
    min-width: 340px;
  }
`;

const LegendBar = styled('div')`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 6px 0 10px;
`;

const LegendLabel = styled('span')`
  color: #6b7280;
  font-size: 12px;
  margin-right: 4px;
`;

const computePrevQuarter = (
  quarter: number,
  year: number,
): { quarter: number; year: number } =>
  quarter === 1 ? { quarter: 4, year: year - 1 } : { quarter: quarter - 1, year };

export const ConfirmationTable = ({
  models,
  quarter,
  year,
  minDate,
  maxDate,
  onSave,
  onCancel,
  isSaving,
}: ConfirmationTableProps) => {
  const gridRef = useRef<AgGridReact<EditableModel>>(null);

  const normalizedMinDate = toDateInput(minDate);
  const normalizedMaxDate = toDateInput(maxDate);

  const prevQuarter = useMemo(
    () => computePrevQuarter(quarter, year),
    [quarter, year],
  );
  const prevQuarterLabel = `Q${prevQuarter.quarter} ${prevQuarter.year}`;

  const initialRows = useMemo<EditableModel[]>(
    () =>
      models.map((m) => ({
        ...m,
        edited_confirmation_date: m.confirmation_date ? toDateInput(m.confirmation_date) : null,
        // По умолчанию is_used наследуется из предыдущего квартала/ПИМ (backend уже
        // положил prev.is_used / pim.is_used в is_used при prefill_source='previous_quarter'|'pim').
        // Если данных нет — значение null ("Не выбрано").
        edited_is_used: m.is_used,
      })),
    [models],
  );

  const initialIsUsedMap = useMemo(() => {
    const map = new Map<string, boolean | null>();
    for (const m of models) map.set(m.system_model_id, m.is_used);
    return map;
  }, [models]);

  const [rows, setRows] = useState<EditableModel[]>(initialRows);
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  const [searchQuery, setSearchQuery] = useState('');

  const updateRow = useCallback((systemModelId: string, patch: Partial<EditableModel>) => {
    setRows((prev) =>
      prev.map((r) => (r.system_model_id === systemModelId ? { ...r, ...patch } : r)),
    );
  }, []);

  const DateCell = useCallback(
    (params: ICellRendererParams<EditableModel>) => {
      const row = params.data;
      if (!row) return null;
      return (
        <ConfirmationDateCell
          value={row.edited_confirmation_date}
          min={normalizedMinDate}
          max={normalizedMaxDate}
          onChange={(next) =>
            updateRow(row.system_model_id, { edited_confirmation_date: next })
          }
        />
      );
    },
    [normalizedMinDate, normalizedMaxDate, updateRow],
  );

  const UsageCell = useCallback(
    (params: ICellRendererParams<EditableModel>) => {
      const row = params.data;
      if (!row) return null;
      return (
        <UsageStatusCell
          value={row.edited_is_used}
          onChange={(next) => updateRow(row.system_model_id, { edited_is_used: next })}
        />
      );
    },
    [updateRow],
  );

  const isRowEdited = useCallback(
    (row: EditableModel): boolean => {
      const initial = initialIsUsedMap.get(row.system_model_id);
      // Если было значение (boolean) — проверяем изменилось ли
      if (initial === true || initial === false) {
        return row.edited_is_used !== initial;
      }
      // Если изначально было null, а теперь есть — это считается "Заполнена",
      // а не "Изменено"; так что не считаем правкой.
      return false;
    },
    [initialIsUsedMap],
  );

  const StatusCell = useCallback(
    (params: ICellRendererParams<EditableModel>) => {
      const row = params.data;
      if (!row) return null;
      return (
        <RowStatusChips
          prefillSource={row.prefill_source}
          isEdited={isRowEdited(row)}
          editedIsUsed={row.edited_is_used}
          prevQuarterLabel={prevQuarterLabel}
        />
      );
    },
    [isRowEdited, prevQuarterLabel],
  );

  const hideAliasColumn = useMemo(
    () =>
      models.length > 0 &&
      models.every((m) => m.model_source === ModelSource.SUM_RM),
    [models],
  );

  const columnDefs = useMemo<ColDef<EditableModel>[]>(() => {
    const cols: ColDef<EditableModel>[] = [
      {
        field: 'system_model_id',
        headerName: 'Идентификатор версии модели',
        headerTooltip: 'Технический идентификатор версии модели. Поле только для просмотра.',
        flex: 1,
        minWidth: 180,
        pinned: 'left',
      },
    ];

    if (!hideAliasColumn) {
      cols.push({
        field: 'model_alias',
        headerName: 'Алиас',
        headerTooltip:
          'Алиас модели (для моделей только из СУРМ без отображения, как на стороне СУМ при отсутствии версии из СУМ).',
        flex: 1,
        minWidth: 140,
        valueGetter: (p: ValueGetterParams<EditableModel>) => {
          if (!p.data) return '';
          if (p.data.model_source === ModelSource.SUM_RM) return '';
          return readRegistryString(p.data.registry_card, 'model_alias', p.data.model_alias);
        },
      });
    }

    cols.push(
      {
        field: 'model_name',
        headerName: 'Название модели',
        headerTooltip: 'Внутреннее название модели. Поле только для просмотра.',
        flex: 2,
        minWidth: 200,
        valueGetter: (p: ValueGetterParams<EditableModel>) =>
          readRegistryString(p.data?.registry_card, 'model_name', p.data?.model_name),
      },
      {
        field: 'model_name_dadm',
        headerName: 'Название модели в реестре ДАДМ',
        headerTooltip: 'Название модели в реестре ДАДМ. Поле только для просмотра.',
        flex: 2,
        minWidth: 200,
        valueGetter: (p: ValueGetterParams<EditableModel>) =>
          readRegistryString(
            p.data?.registry_card,
            'model_name_dadm',
            p.data?.model_name_dadm,
          ) || (p.data?.model_name ?? ''),
      },
      {
        field: 'business_customer',
        headerName: 'Владелец модели/алгоритма',
        headerTooltip: 'Бизнес-заказчик модели. Поле только для просмотра.',
        flex: 1,
        minWidth: 180,
        valueGetter: (p: ValueGetterParams<EditableModel>) =>
          readRegistryString(
            p.data?.registry_card,
            'business_customer',
            p.data?.business_customer,
          ),
      },
      {
        field: 'business_customer_departament',
        headerName: 'Подразделение владельца модели/алгоритма',
        headerTooltip: 'Подразделение владельца модели/алгоритма. Поле только для просмотра.',
        flex: 1,
        minWidth: 220,
        valueGetter: (p: ValueGetterParams<EditableModel>) =>
          readRegistryString(
            p.data?.registry_card,
            'business_customer_departament',
            p.data?.business_customer_departament,
          ),
      },
      {
        headerName: 'Дата подтверждения',
        headerTooltip: `Дата подтверждения использования модели. Допустимый диапазон: ${normalizedMinDate} - ${normalizedMaxDate}.`,
        colId: 'confirmation_date',
        cellRenderer: DateCell,
        valueGetter: (p: ValueGetterParams<EditableModel>) =>
          p.data?.edited_confirmation_date ?? '',
        minWidth: 170,
        filter: 'agDateColumnFilter',
        sortable: true,
      },
      {
        headerName: 'Модель используется заказчиком (текущий квартал)',
        headerTooltip:
          'Признак использования модели в текущем квартале. Можно выбрать Да, Нет или оставить Не выбрано.',
        colId: 'is_used',
        cellRenderer: UsageCell,
        valueGetter: (p: ValueGetterParams<EditableModel>) =>
          usageLabel(p.data?.edited_is_used ?? null),
        minWidth: 200,
        filter: 'agSetColumnFilter',
        filterParams: { values: ['Да', 'Нет', 'Не выбрано'] },
        sortable: true,
      },
      {
        headerName: 'Статус',
        headerTooltip:
          'Подсказка о происхождении значения: новая модель, перенос из ПИМ/предыдущего квартала или изменение пользователем.',
        colId: 'row_status',
        cellRenderer: StatusCell,
        tooltipValueGetter: (p) => {
          if (!p.data) return '';
          return rowStatusTitle({
            prefillSource: p.data.prefill_source,
            isEdited: isRowEdited(p.data),
            editedIsUsed: p.data.edited_is_used,
            prevQuarterLabel,
          });
        },
        valueGetter: (p: ValueGetterParams<EditableModel>) => {
          if (!p.data) return '';
          return rowStatusLabel({
            prefillSource: p.data.prefill_source,
            isEdited: isRowEdited(p.data),
            editedIsUsed: p.data.edited_is_used,
            prevQuarterLabel,
          });
        },
        minWidth: 220,
        filter: 'agSetColumnFilter',
        sortable: true,
      },
    );

    return cols;
  }, [
    DateCell,
    UsageCell,
    StatusCell,
    isRowEdited,
    prevQuarterLabel,
    hideAliasColumn,
    normalizedMinDate,
    normalizedMaxDate,
  ]);

  const getRowClass = useCallback((params: RowClassParams<EditableModel>) => {
    const row = params.data;
    if (!row) return undefined;
    // Подсветка новых моделей без данных ни из ПИМ, ни из прошлого квартала.
    if (row.prefill_source === null && row.edited_is_used === null) {
      return 'confirmation-row-new';
    }
    return undefined;
  }, []);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: true,
    }),
    [],
  );

  useEffect(() => {
    if (!gridRef.current?.api) return;
    gridRef.current.api.setGridOption('quickFilterText', searchQuery);
  }, [searchQuery]);

  const handleSave = () => {
    onSave(rowsRef.current);
  };

  const newModelsCount = rows.filter(
    (r) => r.prefill_source === null && r.edited_is_used === null,
  ).length;
  const editedCount = rows.filter((r) => isRowEdited(r)).length;
  const carriedCount = rows.filter(
    (r) => r.prefill_source !== null && !isRowEdited(r),
  ).length;

  return (
    <div>
      <ActionsBar>
        <ConfirmationSearchBar onSearch={setSearchQuery} />
        <ActionsRight>
          <Button dimension="s" appearance="secondary" onClick={onCancel} disabled={isSaving}>
           Отменить
          </Button>
          <Button dimension="s" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </ActionsRight>
      </ActionsBar>

      <LegendBar>
        <LegendLabel>Обозначения:</LegendLabel>
        <Tag
          kind="warning"
          statusViaBackground
          dimension="s"
          title="Новая модель: в ПИМ и в предыдущем квартале нет данных для предзаполнения."
        >
          Новая модель — {newModelsCount}
        </Tag>
        <Tag
          kind="neutral"
          statusViaBackground
          dimension="s"
          title={`Перенесённые значения: предзаполнены из ПИМ или из ${prevQuarterLabel} и пока не изменены.`}
        >
          Перенесено (ПИМ / {prevQuarterLabel}) — {carriedCount}
        </Tag>
        <Tag
          kind="success"
          statusViaBackground
          dimension="s"
          title="Изменённые значения: пользователь изменил предзаполненное значение."
        >
          Изменено — {editedCount}
        </Tag>
      </LegendBar>

      <GridWrapper className="ag-theme-quartz confirmation-grid">
        <AgGridReact<EditableModel>
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={(p) => p.data.system_model_id}
          getRowClass={getRowClass}
          animateRows={false}
          suppressMovableColumns
          enableCellTextSelection
          rowHeight={44}
          pagination
          paginationPageSize={100}
          localeText={AG_GRID_LOCALE_RU}
          overlayNoRowsTemplate={'<span style="color:#9ca3af">Модели не найдены</span>'}
        />
      </GridWrapper>
    </div>
  );
};
