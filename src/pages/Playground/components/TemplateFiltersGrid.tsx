import { ChangeEvent, useCallback, useMemo, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, RowDragEndEvent, IHeaderParams } from 'ag-grid-community';
import { Button, Checkbox, MenuActionsPanel, Option, Select } from '@admiral-ds/react-ui';
import {
  useTemplateFiltersModalStore,
  ColumnFilterData,
} from '../stores/templateFiltersModalStore';
import { Flexbox } from '../../../shared/ui/atoms';
import { useGlobalStore } from '../../../shared/stores/globalStore';
import { getColumnFilterOptions } from '../../../shared/helpers/helpers';
import { useDeepEffect } from '../../../shared/hooks/useDeepEffect';

const CheckboxHeaderRenderer = (props: IHeaderParams) => {
  const { toggleAllColumns, columnFilters } = useTemplateFiltersModalStore();

  const isAllSelected = columnFilters.every((f) => f.isActive);
  const isIndeterminate = columnFilters.some((f) => f.isActive) && !isAllSelected;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Checkbox
        checked={isAllSelected}
        indeterminate={isIndeterminate}
        onChange={toggleAllColumns}
      />
    </div>
  );
};

const CheckboxCellRenderer = ({ data }: any) => {
  const { toggleColumnActive } = useTemplateFiltersModalStore();

  return (
    <Flexbox alignItems="center" height="100%">
      <Checkbox checked={data.isActive} onChange={() => toggleColumnActive(data.colId)} />
    </Flexbox>
  );
};

const ChipsCellRenderer = ({ data }: any) => {
  const { updateColumnFilter } = useTemplateFiltersModalStore();
  const { agGridApi } = useGlobalStore();
  const [selectedValues, setSelectedValues] = useState<string[]>(data.filterValues || []);
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);

  useDeepEffect(() => {
    if (!agGridApi) {
      setAvailableOptions([]);
      return;
    }

    const rowData: any[] = [];
    agGridApi.forEachNode((node) => {
      if (node.data) {
        rowData.push(node.data);
      }
    });

    const columnOptions = getColumnFilterOptions(rowData, data.colId);
    setAvailableOptions(columnOptions.map((option) => option.value));
  }, [agGridApi, data.colId]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = e.target.selectedOptions;

    let newSelectedValues = Array.from(selectedOptions).map((option) => option.value);
    const _options = availableOptions as any;

    if (selectedValues?.includes(newSelectedValues[0])) {
      newSelectedValues = [];
    }
    const selectOptionsValues = _options;
    const prevSelectedValues =
      selectedValues?.filter((value) => !selectOptionsValues.includes(value)) ?? [];
    newSelectedValues = [...prevSelectedValues, ...newSelectedValues];
    setSelectedValues(newSelectedValues);
  };

  const handleApplyButtonClick = () => {
    updateColumnFilter(data.colId, {
      filterValues: selectedValues,
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <Select
        multiple
        disabled={!data.isActive}
        isLoading={!availableOptions.length}
        mode="searchSelect"
        placeholder="Выберите значения"
        defaultValue={selectedValues}
        onChange={handleChange}
        style={{ width: '100%' }}
        maxRowCount={1}
        minRowCount={1}
        renderDropDownBottomPanel={() => {
          return (
            <MenuActionsPanel dimension="s">
              <Button dimension="s" onClick={handleApplyButtonClick}>
                Применить
              </Button>
            </MenuActionsPanel>
          );
        }}
      >
        {availableOptions.map((option) => (
          <Option key={option} value={option}>
            {option}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export const TemplateFiltersGrid = () => {
  const { columnFilters, reorderColumns, quickFilterText, setLocalGridApi } =
    useTemplateFiltersModalStore();

  const rowData = useMemo(() => {
    return columnFilters.sort((a, b) => a.order - b.order);
  }, [columnFilters]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: '',
        field: 'drag',
        rowDrag: true,
        width: 50,
        maxWidth: 55,
        suppressMenu: true,
        suppressSorting: true,
        suppressFilter: true,
      },
      {
        headerName: 'Активна',
        field: 'isActive',
        width: 55,
        maxWidth: 55,
        suppressMenu: true,
        suppressSorting: true,
        suppressFilter: true,
        cellRenderer: CheckboxCellRenderer,
        headerComponent: CheckboxHeaderRenderer,
      },
      {
        headerName: 'Название колонки',
        field: 'title',
        flex: 1,
        suppressMenu: true,
        suppressSorting: true,
        suppressFilter: true,
      },
      {
        headerName: 'Значения фильтров',
        field: 'filterValues',
        flex: 2,
        suppressMenu: true,
        suppressSorting: true,
        suppressFilter: true,
        autoHeight: true,
        cellRenderer: ChipsCellRenderer,
      },
    ],
    [],
  );

  const onRowDragEnd = useCallback(
    (event: RowDragEndEvent) => {
      const { node, overNode, overIndex } = event;

      if (!node || overIndex === undefined) {
        return;
      }

      const startIndex = rowData.findIndex((f) => f.colId === node.data.colId);
      const endIndex = overIndex;

      if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
        reorderColumns(startIndex, endIndex);
      }
    },
    [rowData, reorderColumns],
  );

  const onGridReady = useCallback(
    (params: GridReadyEvent) => {
      params.api.sizeColumnsToFit();
      setLocalGridApi(params.api);
    },
    [setLocalGridApi],
  );

  return (
    <div className="ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        rowDragManaged
        suppressContextMenu
        onRowDragEnd={onRowDragEnd}
        onGridReady={onGridReady}
        suppressRowClickSelection
        suppressCellFocus
        headerHeight={40}
        rowHeight={50}
        animateRows
        quickFilterText={quickFilterText}
      />
    </div>
  );
};

