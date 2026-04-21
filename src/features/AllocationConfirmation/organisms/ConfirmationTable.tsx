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
import { ConfirmationSearchBar } from '../molecules/ConfirmationSearchBar';
import { ConfirmationDateCell } from '../molecules/ConfirmationDateCell';
import { UsageStatusCell, usageLabel } from '../molecules/UsageStatusCell';
import { RowStatusChips, rowStatusLabel } from '../molecules/RowStatusChips';
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

  const columnDefs = useMemo<ColDef<EditableModel>[]>(
    () => [
      {
        field: 'system_model_id',
        headerName: 'Идентификатор версии модели',
        flex: 1,
        minWidth: 180,
        pinned: 'left',
      },
      { field: 'model_alias', headerName: 'Алиас', flex: 1, minWidth: 140 },
      { field: 'model_name', headerName: 'Название модели', flex: 2, minWidth: 200 },
      {
        field: 'model_name_dadm',
        headerName: 'Название модели в реестре ДАДМ',
        flex: 2,
        minWidth: 200,
      },
      {
        field: 'business_customer',
        headerName: 'Владелец модели/алгоритма',
        flex: 1,
        minWidth: 180,
      },
      {
        field: 'business_customer_departament',
        headerName: 'Подразделение владельца модели/алгоритма',
        flex: 1,
        minWidth: 220,
      },
      {
        headerName: 'Дата подтверждения',
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
        colId: 'row_status',
        cellRenderer: StatusCell,
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
      // {
      //   field: 'model_source',
      //   headerName: 'Источник модели',
      //   minWidth: 140,
      //   filter: 'agSetColumnFilter',
      //   valueGetter: (p: ValueGetterParams<EditableModel>) => p.data?.model_source ?? '—',
      // },
    ],
    [DateCell, UsageCell, StatusCell, isRowEdited, prevQuarterLabel],
  );

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
        <Tag kind="warning" statusViaBackground dimension="s">
          Новая модель — {newModelsCount}
        </Tag>
        <Tag kind="neutral" statusViaBackground dimension="s">
          Перенесено (ПИМ / {prevQuarterLabel}) — {carriedCount}
        </Tag>
        <Tag kind="success" statusViaBackground dimension="s">
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
