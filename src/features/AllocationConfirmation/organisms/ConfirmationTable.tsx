import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, ICellRendererParams, ValueGetterParams } from 'ag-grid-community';
import styled from 'styled-components';
import { T, Button } from '@admiral-ds/react-ui';
import type { ConfirmationModelRow } from '@shared/api/hooks/useQuarterlyConfirmation';
import { PrefillSourceBadge } from '../atoms/PrefillSourceBadge';
import { ConfirmationSearchBar } from '../molecules/ConfirmationSearchBar';
import { ConfirmationDateCell } from '../molecules/ConfirmationDateCell';
import { UsageStatusCell, usageLabel } from '../molecules/UsageStatusCell';

type EditableModel = ConfirmationModelRow & {
  edited_confirmation_date: string | null;
  edited_is_used: boolean | null;
};

type ConfirmationTableProps = {
  models: ConfirmationModelRow[];
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

const HelpText = styled('div')`
  color: #4b5563;
  font-size: 12px;
  padding: 4px 0 8px;
`;

const GridWrapper = styled('div')`
  height: calc(100vh - 260px);
  width: 100%;
`;

const ModelCount = styled('div')`
  color: #6b7280;
  font-size: 12px;
  padding: 4px 0;
`;

const PREFILL_SOURCE_LABEL: Record<string, string> = {
  pim: 'ПИМ',
  previous_quarter: 'Предыдущий квартал',
  none: 'Нет данных',
};

export const ConfirmationTable = ({
  models,
  minDate,
  maxDate,
  onSave,
  onCancel,
  isSaving,
}: ConfirmationTableProps) => {
  const gridRef = useRef<AgGridReact<EditableModel>>(null);

  const normalizedMinDate = toDateInput(minDate);
  const normalizedMaxDate = toDateInput(maxDate);

  const initialRows = useMemo<EditableModel[]>(
    () =>
      models.map((m) => ({
        ...m,
        edited_confirmation_date: m.confirmation_date ? toDateInput(m.confirmation_date) : null,
        // По умолчанию is_used наследуется из предыдущего квартала (backend уже
        // положил prev.is_used в is_used при prefill_source='previous_quarter').
        // Если данных нет — значение null ("Не выбрано").
        edited_is_used: m.is_used,
      })),
    [models],
  );

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

  const PrefillCell = useCallback((params: ICellRendererParams<EditableModel>) => {
    const row = params.data;
    if (!row) return null;
    return <PrefillSourceBadge source={row.prefill_source} />;
  }, []);

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
        field: 'model_source',
        headerName: 'Источник модели',
        minWidth: 140,
        filter: 'agSetColumnFilter',
        valueGetter: (p: ValueGetterParams<EditableModel>) => p.data?.model_source ?? '—',
      },
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
        headerName: 'Используется в текущем квартале',
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
        headerName: 'Источник предзаполнения',
        colId: 'prefill_source',
        cellRenderer: PrefillCell,
        valueGetter: (p: ValueGetterParams<EditableModel>) =>
          PREFILL_SOURCE_LABEL[p.data?.prefill_source ?? 'none'],
        minWidth: 180,
        filter: 'agSetColumnFilter',
        sortable: true,
      },
    ],
    [DateCell, UsageCell, PrefillCell],
  );

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

  return (
    <div>
      <ActionsBar>
        <ConfirmationSearchBar onSearch={setSearchQuery} />
        <ActionsRight>
          <Button dimension="s" appearance="secondary" onClick={onCancel} disabled={isSaving}>
            <T font="Button/Button 2">Отменить</T>
          </Button>
          <Button dimension="s" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </ActionsRight>
      </ActionsBar>

      <ModelCount>
        <T font="Caption/Caption 1">Всего моделей: {rows.length}</T>
      </ModelCount>

      <HelpText>
        <T font="Caption/Caption 1">
          В колонке «Используется в текущем квартале» значение по умолчанию наследуется из
          предыдущего квартала; если данных нет — «Не выбрано».
        </T>
      </HelpText>

      <GridWrapper className="ag-theme-quartz">
        <AgGridReact<EditableModel>
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          getRowId={(p) => p.data.system_model_id}
          animateRows={false}
          suppressMovableColumns
          enableCellTextSelection
          rowHeight={44}
          overlayNoRowsTemplate={'<span style="color:#9ca3af">Модели не найдены</span>'}
        />
      </GridWrapper>
    </div>
  );
};
