import { useState, useCallback, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, SelectionChangedEvent } from 'ag-grid-community';
import styled from 'styled-components';
import { Button, T } from '@admiral-ds/react-ui';
import { useModelsControllerGetModels } from '@shared/api/generated/endpoints';
import {
  useActiveQuarter,
  useSeedPimUsage,
} from '@shared/api/hooks/useQuarterlyConfirmation';
import type { Row } from '@shared/types';
import { useToast } from '@shared/ui/atoms';

const getCurrentUsername = (): string =>
  window.keycloak?.tokenParsed?.preferred_username ?? '';

const Wrapper = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ControlRow = styled('div')`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const CheckboxLabel = styled('label')`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #78350f;
  cursor: pointer;
`;

const GridWrapper = styled('div')`
  height: 320px;
  width: 100%;
`;

const SelectedCount = styled('span')`
  font-size: 12px;
  color: #78350f;
`;

const UserTag = styled('span')`
  font-size: 12px;
  color: #78350f;
  background: #fde68a;
  border-radius: 4px;
  padding: 2px 6px;
`;

const HelpText = styled('div')`
  font-size: 12px;
  color: #92400e;
  background: #fef9c3;
  border: 1px dashed #ca8a04;
  border-radius: 6px;
  padding: 8px 10px;
`;

export const SeedPimTool = () => {
  const gridRef = useRef<AgGridReact>(null);
  const { showToast } = useToast();
  const [selectedSystemModelIds, setSelectedSystemModelIds] = useState<string[]>([]);
  const [seedIsUsed, setSeedIsUsed] = useState(true);
  const [filterByCurrentUser, setFilterByCurrentUser] = useState(false);

  const currentUsername = useMemo(() => getCurrentUsername(), []);

  const { data: quarterResp } = useActiveQuarter();
  const quarterInfo = quarterResp?.data ?? null;

  const { mutate: seedPim, isPending: isSeeding } = useSeedPimUsage();

  const { data: modelsData, isLoading } = useModelsControllerGetModels(
    { mode: ['Активные', 'Архив', 'Ошибка заведения', 'empty', 'not-null'] },
    { query: { refetchOnWindowFocus: false } },
  );
  const allRows = ((modelsData as any)?.data?.cards as Partial<Row>[] | undefined) ?? [];

  const rows = useMemo(() => {
    if (!filterByCurrentUser || !currentUsername) return allRows;
    return allRows.filter((r) => r.model_creator === currentUsername);
  }, [allRows, filterByCurrentUser, currentUsername]);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 48,
        minWidth: 48,
        maxWidth: 48,
        pinned: 'left',
        suppressHeaderMenuButton: true,
        resizable: false,
      },
      {
        field: 'business_customer',
        headerName: 'Владелец модели',
        flex: 1,
        minWidth: 160,
        pinned: 'left',
      },
      { field: 'system_model_id', headerName: 'Идентификатор версии', flex: 1, minWidth: 160 },
      { field: 'model_id', headerName: 'Идентификатор', flex: 1, minWidth: 160 },
      { field: 'model_alias', headerName: 'Алиас', flex: 1, minWidth: 130 },
      { field: 'model_name', headerName: 'Название', flex: 2, minWidth: 200 },
      {
        field: 'business_customer_departament',
        headerName: 'Подразделение',
        flex: 1,
        minWidth: 180,
      },
    ],
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({ resizable: true, sortable: true, filter: true }),
    [],
  );

  const rowSelection = useMemo(
    () => ({ mode: 'multiRow' as const, headerCheckbox: true }),
    [],
  );

  const handleSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selected = event.api.getSelectedRows() as Partial<Row>[];
    setSelectedSystemModelIds(
      selected.map((r) => r.system_model_id).filter(Boolean) as string[],
    );
  }, []);

  const handleSeed = () => {
    if (!selectedSystemModelIds.length || !quarterInfo) return;
    seedPim(
      {
        quarter: quarterInfo.quarter,
        year: quarterInfo.year,
        models: selectedSystemModelIds.map((system_model_id) => ({
          system_model_id,
          is_used: seedIsUsed,
        })),
      },
      {
        onSuccess: (res) => {
          showToast({
            message: `ПИМ засеян: ${res.data.seeded.length} моделей`,
            type: 'success',
            duration: 3000,
          });
        },
        onError: () => {
          showToast({
            message: 'Ошибка при засеивании ПИМ данных',
            type: 'error',
            duration: 4000,
          });
        },
      },
    );
    gridRef.current?.api?.deselectAll();
    setSelectedSystemModelIds([]);
  };

  if (!quarterInfo) {
    return (
      <HelpText>
        <T font="Caption/Caption 1">
          Нет активного квартала — засеивать ПИМ нечего. Откройте `/allocation-confirmation`
          после старта активного квартала.
        </T>
      </HelpText>
    );
  }

  return (
    <Wrapper>
      <HelpText>
        <T font="Caption/Caption 1">
          🧪 Засеивание ПИМ-данных для тестирования приоритетов предзаполнения в активном
          квартале Q{quarterInfo.quarter} {quarterInfo.year}.
        </T>
      </HelpText>
      <ControlRow>
        {currentUsername && <UserTag>Я: {currentUsername}</UserTag>}
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={filterByCurrentUser}
            onChange={(e) => {
              setFilterByCurrentUser(e.target.checked);
              gridRef.current?.api?.deselectAll();
              setSelectedSystemModelIds([]);
            }}
            disabled={!currentUsername}
          />
          Только мои модели ({filterByCurrentUser ? rows.length : allRows.length} из{' '}
          {allRows.length})
        </CheckboxLabel>
      </ControlRow>
      <GridWrapper className="ag-theme-quartz">
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowSelection={rowSelection}
          onSelectionChanged={handleSelectionChanged}
          loading={isLoading}
          pagination
          paginationPageSize={20}
          suppressMovableColumns
        />
      </GridWrapper>
      <ControlRow>
        <SelectedCount>
          Выбрано: {selectedSystemModelIds.length} {rows.length > 0 ? `из ${rows.length}` : ''}
        </SelectedCount>
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={seedIsUsed}
            onChange={(e) => setSeedIsUsed(e.target.checked)}
          />
          Модель используется заказчиком = {seedIsUsed ? 'true' : 'false'}
        </CheckboxLabel>
        <Button
          dimension="s"
          appearance="secondary"
          onClick={handleSeed}
          disabled={isSeeding || selectedSystemModelIds.length === 0}
        >
          <T font="Button/Button 2">
            {isSeeding ? 'Засевается...' : `Засеять ПИМ (${selectedSystemModelIds.length})`}
          </T>
        </Button>
      </ControlRow>
    </Wrapper>
  );
};
