import { useState, useCallback, useRef, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, SelectionChangedEvent } from 'ag-grid-community';
import styled from 'styled-components';
import { Button, T } from '@admiral-ds/react-ui';
import { useModelsControllerGetModels } from '@shared/api/generated/endpoints';
import type { Row } from '@src/shared/types';
import type { SeedPimUsagePayload } from '@shared/api/hooks/useQuarterlyConfirmation';

const Panel = styled('div')`
  background: #fef9c3;
  border: 1px dashed #ca8a04;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PanelTitle = styled('div')`
  font-size: 12px;
  font-weight: 600;
  color: #92400e;
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
  height: 280px;
  width: 100%;
`;

const SelectedCount = styled('span')`
  font-size: 12px;
  color: #78350f;
`;

type SeedPimPanelProps = {
  quarter: number;
  year: number;
  onSeed: (payload: SeedPimUsagePayload) => void;
  isSeeding: boolean;
};

export const SeedPimPanel = ({ quarter, year, onSeed, isSeeding }: SeedPimPanelProps) => {
  const gridRef = useRef<AgGridReact>(null);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [seedIsUsed, setSeedIsUsed] = useState(true);

  const { data: modelsData, isLoading } = useModelsControllerGetModels(
    {},
    { query: { refetchOnWindowFocus: false } },
  );
  const rows = (modelsData as any)?.data?.cards as Partial<Row>[] | undefined ?? [];

  const columnDefs = useMemo<ColDef[]>(() => [
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
    { field: 'model_id', headerName: 'Идентификатор', flex: 1, minWidth: 160 },
    { field: 'model_alias', headerName: 'Алиас', flex: 1, minWidth: 130 },
    { field: 'model_name', headerName: 'Название', flex: 2, minWidth: 200 },
    { field: 'business_customer', headerName: 'Владелец', flex: 1, minWidth: 160 },
    { field: 'business_customer_departament', headerName: 'Подразделение', flex: 1, minWidth: 180 },
  ], []);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
    sortable: true,
    filter: true,
  }), []);

  const rowSelection = useMemo(() => ({
    mode: 'multiRow' as const,
    headerCheckbox: true,
  }), []);

  const handleSelectionChanged = useCallback((event: SelectionChangedEvent) => {
    const selected = event.api.getSelectedRows() as Partial<Row>[];
    setSelectedModelIds(selected.map((r) => r.model_id).filter(Boolean) as string[]);
  }, []);

  const handleSeed = () => {
    if (!selectedModelIds.length) return;
    console.log('[ALLOC_DEBUG] Seeding PIM usage:', { quarter, year, modelIds: selectedModelIds, is_used: seedIsUsed });
    onSeed({
      quarter,
      year,
      models: selectedModelIds.map((model_id) => ({ model_id, is_used: seedIsUsed })),
    });
    gridRef.current?.api?.deselectAll();
    setSelectedModelIds([]);
  };

  return (
    <Panel>
      <PanelTitle>🧪 [innodev] Засеять данные ПИМ для тестирования приоритетов</PanelTitle>
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
          Выбрано: {selectedModelIds.length} {rows.length > 0 ? `из ${rows.length}` : ''}
        </SelectedCount>
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={seedIsUsed}
            onChange={(e) => setSeedIsUsed(e.target.checked)}
          />
          is_used = {seedIsUsed ? 'true' : 'false'}
        </CheckboxLabel>
        <Button
          dimension="s"
          appearance="secondary"
          onClick={handleSeed}
          disabled={isSeeding || selectedModelIds.length === 0}
        >
          <T font="Button/Button 2">{isSeeding ? 'Засевается...' : `Засеять ПИМ (${selectedModelIds.length})`}</T>
        </Button>
      </ControlRow>
    </Panel>
  );
};
