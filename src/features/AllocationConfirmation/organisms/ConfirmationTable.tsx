import { useEffect, useMemo, useState, useCallback } from 'react';
import styled from 'styled-components';
import { T, Button, Toggle } from '@admiral-ds/react-ui';
import type { ConfirmationModelRow } from '@shared/api/hooks/useQuarterlyConfirmation';
import { PrefillSourceBadge } from '../atoms/PrefillSourceBadge';
import { ConfirmationSearchBar } from '../molecules/ConfirmationSearchBar';

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

const TableWrapper = styled('div')`
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
`;

const StyledTable = styled('table')`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;

  th,
  td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
  }

  th {
    background: #f3f4f6;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tr:hover {
    background: #f9fafb;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const ScrollableBody = styled('div')`
  max-height: calc(100vh - 280px);
  overflow-y: auto;
`;

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

const DateInput = styled('input')`
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #0132b0;
    box-shadow: 0 0 0 2px rgba(1, 50, 176, 0.1);
  }
`;

const ModelCount = styled('div')`
  color: #6b7280;
  font-size: 12px;
  padding: 4px 0;
`;

const FilterRow = styled('div')`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ConfirmationTable = ({
  models,
  minDate,
  maxDate,
  onSave,
  onCancel,
  isSaving,
}: ConfirmationTableProps) => {
  const toDateInputValue = useCallback((value: string | null | undefined) => {
    if (!value) return '';
    // Accept `YYYY-MM-DD` or ISO timestamps.
    return value.length >= 10 ? value.slice(0, 10) : value;
  }, []);

  const normalizedMinDate = toDateInputValue(minDate);
  const normalizedMaxDate = toDateInputValue(maxDate);

  const [editableModels, setEditableModels] = useState<EditableModel[]>(() => {
    return models.map((m) => ({
      ...m,
      edited_confirmation_date: m.confirmation_date ? toDateInputValue(m.confirmation_date) : null,
      edited_is_used: m.is_used,
    }));
  });

  useEffect(() => {
    setEditableModels(
      models.map((m) => ({
        ...m,
        edited_confirmation_date: m.confirmation_date ? toDateInputValue(m.confirmation_date) : null,
        edited_is_used: m.is_used,
      })),
    );
  }, [models, toDateInputValue]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterField, setFilterField] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

  const filteredModels = useMemo(() => {
    let result = editableModels;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.model_id?.toLowerCase().includes(q) ||
          m.model_alias?.toLowerCase().includes(q) ||
          m.model_name?.toLowerCase().includes(q) ||
          m.model_name_dadm?.toLowerCase().includes(q) ||
          m.business_customer?.toLowerCase().includes(q),
      );
    }

    if (filterField && filterValue) {
      const fv = filterValue.toLowerCase();
      result = result.filter((m) => {
        const val = m[filterField as keyof ConfirmationModelRow];
        return val !== null && val !== undefined && String(val).toLowerCase().includes(fv);
      });
    }

    return result;
  }, [editableModels, searchQuery, filterField, filterValue]);

  const filterableFields = useMemo(
    () => [
      { key: 'model_id', label: 'ID модели' },
      { key: 'model_alias', label: 'Алиас' },
      { key: 'model_name', label: 'Название' },
      { key: 'business_customer', label: 'Владелец' },
      { key: 'business_customer_departament', label: 'Подразделение' },
    ],
    [],
  );

  const handleDateChange = useCallback((modelId: string, date: string) => {
    setEditableModels((prev) =>
      prev.map((m) => (m.model_id === modelId ? { ...m, edited_confirmation_date: date } : m)),
    );
  }, []);

  const handleUsedChange = useCallback((modelId: string, isUsed: boolean) => {
    setEditableModels((prev) =>
      prev.map((m) => (m.model_id === modelId ? { ...m, edited_is_used: isUsed } : m)),
    );
  }, []);

  const handleSave = () => {
    onSave(editableModels);
  };

  return (
    <div>
      <ActionsBar>
        <FilterRow>
          <ConfirmationSearchBar onSearch={setSearchQuery} />
          <select
            value={filterField}
            onChange={(e) => setFilterField(e.target.value)}
            style={{
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '13px',
            }}
          >
            <option value="">Фильтр по полю...</option>
            {filterableFields.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
          {filterField && (
            <input
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              placeholder="Значение фильтра..."
              style={{
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '6px 8px',
                fontSize: '13px',
                width: '200px',
              }}
            />
          )}
        </FilterRow>
        <ActionsRight>
          <Button dimension="s" appearance="secondary" onClick={onCancel} disabled={isSaving}>
            <T font="Button/Button 2">Отменить</T>
          </Button>
          <Button dimension="s" onClick={handleSave} disabled={isSaving}>
            <T font="Button/Button 2">{isSaving ? 'Сохранение...' : 'Сохранить'}</T>
          </Button>
        </ActionsRight>
      </ActionsBar>

      <ModelCount>
        <T font="Caption/Caption 1">
          Показано {filteredModels.length} из {editableModels.length} моделей
        </T>
      </ModelCount>

      <TableWrapper>
        <ScrollableBody>
          <StyledTable>
            <thead>
              <tr>
                <th>ID версии модели</th>
                <th>Алиас</th>
                <th>Название модели</th>
                <th>Название в ДАДМ</th>
                <th>Владелец</th>
                <th>Дата подтверждения</th>
                <th>Используется заказчиком</th>
                <th>Источник</th>
              </tr>
            </thead>
            <tbody>
              {filteredModels.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                    <T font="Body/Body 1 Long">Модели не найдены</T>
                  </td>
                </tr>
              ) : (
                filteredModels.map((model) => (
                  <tr key={model.model_id}>
                    <td title={model.model_id}>{model.model_id}</td>
                    <td title={model.model_alias ?? ''}>{model.model_alias ?? '-'}</td>
                    <td
                      title={model.model_name ?? ''}
                      style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {model.model_name ?? '-'}
                    </td>
                    <td
                      title={model.model_name_dadm ?? ''}
                      style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {model.model_name_dadm ?? '-'}
                    </td>
                    <td title={model.business_customer ?? ''}>{model.business_customer ?? '-'}</td>
                    <td>
                      <DateInput
                        type="date"
                        value={model.edited_confirmation_date ?? ''}
                        min={normalizedMinDate}
                        max={normalizedMaxDate}
                        onChange={(e) => handleDateChange(model.model_id, e.target.value)}
                      />
                    </td>
                    <td>
                      <Toggle
                        checked={model.edited_is_used === true}
                        onChange={(e) => handleUsedChange(model.model_id, e.currentTarget.checked)}
                        dimension="s"
                      />
                      <span style={{ marginLeft: '6px', fontSize: '12px' }}>
                        {model.edited_is_used === true ? 'Да' : model.edited_is_used === false ? 'Нет' : '-'}
                      </span>
                    </td>
                    <td>
                      <PrefillSourceBadge source={model.prefill_source} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </StyledTable>
        </ScrollableBody>
      </TableWrapper>
    </div>
  );
};
