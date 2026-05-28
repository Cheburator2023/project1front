import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type {
  ColDef,
  GetMainMenuItemsParams,
  ICellRendererParams,
  MenuItemDef,
  RowClassParams,
  RowSelectionOptions,
  SelectionChangedEvent,
  SelectionColumnDef,
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

/** Рендер значений в списке agSetColumnFilter — как в AgGridTable (`setFilterParams.cellRenderer`). */
function allocationConfirmationSetFilterCellRenderer(
  props: Pick<ICellRendererParams, 'value'>,
) {
  const text = props.value === null ? '(Пустые)' : String(props.value ?? '');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        minWidth: 0,
        lineHeight: '18px',
      }}
      title={text}
    >
      <span
        style={{
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
          flex: '1 1 auto',
        }}
      >
        {text}
      </span>
    </div>
  );
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

/** Легенда: жёлтая зона строки таблицы + подпись и счётчик в одном блоке. */
const LegendNewModelBadge = styled('div')`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  min-height: 24px;
  border-radius: 4px;
  box-sizing: border-box;
  background-color: #fef3c7;
  border: 1px solid #fde68a;
  font-size: 12px;
  line-height: 1.3;
  color: #78350f;
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

/** Текст кнопки «Сохранить» с числом выделенных строк (модель / модели / моделей). */
function saveConfirmButtonCaption(selectedModelsCount: number, isSaving: boolean): string {
  if (isSaving) return 'Сохранение...';
  if (selectedModelsCount <= 0) return 'Сохранить';

  const n10 = selectedModelsCount % 100;
  const n1 = selectedModelsCount % 10;
  let noun: string;
  if (n10 > 10 && n10 < 20) {
    noun = 'моделей';
  } else if (n1 === 1) {
    noun = 'модель';
  } else if (n1 >= 2 && n1 <= 4) {
    noun = 'модели';
  } else {
    noun = 'моделей';
  }

  return `Сохранить (${selectedModelsCount} ${noun})`;
}

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

  const [selectedSaveCount, setSelectedSaveCount] = useState(0);

  useEffect(() => {
    setRows(initialRows);
    queueMicrotask(() => {
      const api = gridRef.current?.api;
      api?.deselectAll?.();
      setSelectedSaveCount(0);
    });
  }, [initialRows]);

  const rowSelection = useMemo<RowSelectionOptions>(
    () => ({
      mode: 'multiRow',
      headerCheckbox: true,
      /** Чекбокс в заголовке — только строки, попадающие под текущие фильтры/поиск (на всех страницах набора после фильтра). */
      selectAll: 'filtered',
    }),
    [],
  );

  const selectionColumnDef = useMemo<SelectionColumnDef>(
    () => ({
      pinned: 'left',
      width: 52,
      minWidth: 52,
      maxWidth: 52,
      resizable: false,
      sortable: false,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
      tooltipValueGetter: () =>
        'Флажок: строка попадёт в запрос при «Сохранить». В заголовке — выделить все строки, проходящие текущие фильтры колонок и быстрый поиск (со всех страниц отфильтрованного набора). То, что скрыто фильтром, не попадает в выделение.',
    }),
    [],
  );

  const onSelectionChanged = useCallback((e: SelectionChangedEvent<EditableModel>) => {
    setSelectedSaveCount(e.api.getSelectedNodes().length);
  }, []);

  const getMainMenuItems = useCallback(
    (params: GetMainMenuItemsParams): (string | MenuItemDef)[] => {
      const defaults = [...(params.defaultItems ?? [])];
      const colId = params.column?.getColId();
      const filterAllowed = !!params.column?.getColDef()?.filter;
      const resetColumnFilter: MenuItemDef = {
        name: 'Сбросить фильтр колонки',
        disabled: !filterAllowed || !colId,
        action: () => {
          if (!colId || !filterAllowed) return;
          const prev = params.api.getFilterModel() ?? {};
          if (!(colId in prev)) return;
          const next = { ...prev };
          delete next[colId];
          params.api.setFilterModel(Object.keys(next).length ? next : null);
        },
      };

      return [...defaults, 'separator', resetColumnFilter];
    },
    [],
  );

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
        filterParams: { buttons: ['reset', 'clear'] },
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
        filterParams: {
          values: ['Да', 'Нет', 'Не выбрано'],
          buttons: ['reset', 'clear'],
          cellHeight: 42,
          cellRenderer: allocationConfirmationSetFilterCellRenderer,
        },
        sortable: true,
      },
      {
        headerName: 'Статус',
        headerTooltip:
          'Происхождение значения: новая модель, перенос из ПИМ или предыдущего квартала, изменение пользователем. Если есть и ПИМ, и данные прошлого квартала, статус переноса — из ПИМ.',
        colId: 'row_status',
        cellStyle: { display: 'flex', justifyContent: 'flex-start' },
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
        filterParams: {
          buttons: ['reset', 'clear'],
          cellHeight: 42,
          cellRenderer: allocationConfirmationSetFilterCellRenderer,
        },
        sortable: true,
      },
    );

    return cols.map((col) => ({
      ...col,
      filterParams: {
        cellRenderer: allocationConfirmationSetFilterCellRenderer, 
      }
    }));

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
    // Жёлтая строка («новая модель» в легенде): нет prefill ни из ПИМ, ни из прошл. квартала и «используется» не выбрано.
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
      filterParams: {
        buttons: ['reset', 'clear'],
      },
    }),
    [],
  );

  useEffect(() => {
    if (!gridRef.current?.api) return;
    gridRef.current.api.setGridOption('quickFilterText', searchQuery);
  }, [searchQuery]);

  const handleSave = () => {
    const api = gridRef.current?.api;
    if (!api) return;
    onSave(api.getSelectedRows() as EditableModel[]);
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
          <Button
            dimension="s"
            onClick={handleSave}
            disabled={isSaving || selectedSaveCount === 0}
          >
            {saveConfirmButtonCaption(selectedSaveCount, isSaving)}
          </Button>
        </ActionsRight>
      </ActionsBar>

      <LegendBar>
        <LegendLabel>Обозначения:</LegendLabel>
        <Tag
          kind="primary"
          statusViaBackground
          dimension="s"
          title="Только строки с флажком попадут в запрос при нажатии «Сохранить»."
        >
          Выбрано для сохранения — {selectedSaveCount}
        </Tag>
        <LegendNewModelBadge
          title={
            'Жёлтый фон строки в таблице: модель новая для квартала — нет предзаполнения ни из ПИМ, ни из предыдущего квартала; признак «Модель используется» ещё не выбран (Да/Нет).' +
            ' После заполнения «Да» или «Нет» строка становится без жёлтой подсветки.'
          }
        >
          Новая модель без предзаполнения — {newModelsCount}
        </LegendNewModelBadge>
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
          rowSelection={rowSelection}
          selectionColumnDef={selectionColumnDef}
          onSelectionChanged={onSelectionChanged}
          getMainMenuItems={getMainMenuItems}
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
