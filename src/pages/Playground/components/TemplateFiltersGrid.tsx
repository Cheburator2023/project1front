import { ChangeEvent, useCallback, useMemo, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, RowDragEndEvent, IHeaderParams } from 'ag-grid-community';
import {
  Button,
  Checkbox,
  MenuActionsPanel,
  Option,
  Select,
  DateField,
} from '@admiral-ds/react-ui';
import { format, parse, isValid } from 'date-fns';
import {
  useTemplateFiltersModalStore,
  ColumnFilterData,
} from '../stores/templateFiltersModalStore';
import { Flexbox } from '../../../shared/ui/atoms';
import { useGlobalStore } from '../../../shared/stores/globalStore';
import { getColumnFilterOptions } from '../../../shared/helpers/helpers';
import { useDeepEffect } from '../../../shared/hooks/useDeepEffect';
import { COLUMN_TYPE } from '../../../shared/types';

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

const DateFieldRenderer = ({ data }: any) => {
  const filterValues: string[] = data.filterValues;

  const { updateColumnFilter } = useTemplateFiltersModalStore();

  const initializeDateValue = () => {
    if (!data.filterValues || data.filterValues.length === 0) return '';

    const firstFilter = data.filterValues[0];

    if (typeof firstFilter === 'object' && firstFilter.dateFrom) {
      const startDate = new Date(firstFilter.dateFrom);
      const startFormatted = isValid(startDate) ? format(startDate, 'yyyy-MM-dd') : '';

      if (firstFilter.dateTo && firstFilter.dateTo !== firstFilter.dateFrom) {
        const endDate = new Date(firstFilter.dateTo);
        const endFormatted = isValid(endDate) ? format(endDate, 'yyyy-MM-dd') : '';
        return `${startFormatted} - ${endFormatted}`;
      }

      return startFormatted;
    }

    if (data.filterValues.length === 1) {
      const date = new Date(data.filterValues[0]);
      return isValid(date) ? format(date, 'yyyy-MM-dd') : '';
    }

    if (data.filterValues.length === 2) {
      const startDate = new Date(data.filterValues[0]);
      const endDate = new Date(data.filterValues[1]);
      const startFormatted = isValid(startDate) ? format(startDate, 'yyyy-MM-dd') : '';
      const endFormatted = isValid(endDate) ? format(endDate, 'yyyy-MM-dd') : '';
      return `${startFormatted} - ${endFormatted}`;
    }

    return '';
  };

  const initializeFilterType = () => {
    if (!data.filterValues || data.filterValues.length === 0) return 'equals';

    const firstFilter = data.filterValues[0];

    if (typeof firstFilter === 'object' && firstFilter.type) {
      return firstFilter.type === 'inRange' ? 'isRange' : 'equals';
    }

    return data.filterValues.length === 2 ? 'isRange' : 'equals';
  };

  const [dateValue, setDateValue] = useState<string>(initializeDateValue());
  const [filterType, setFilterType] = useState<'equals' | 'isRange'>(initializeFilterType());

  useEffect(() => {
    setDateValue(initializeDateValue());
    setFilterType(initializeFilterType());
  }, [data.filterValues]);

  const parseDateValue = (value: string): Date | null => {
    if (!value) return null;

    const nativeDate = new Date(value);
    if (isValid(nativeDate)) return nativeDate;

    const parsedDate = parse(value, 'dd.MM.yyyy', new Date());
    return isValid(parsedDate) ? parsedDate : null;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDateValue(inputValue);
  };

  const handleApplyButtonClick = () => {
    if (!dateValue) {
      updateColumnFilter(data.colId, {
        filterValues: [],
      });
      return;
    }

    if (filterType === 'isRange') {
      // dateValue is array
      const dates = dateValue.split(' - ');

      if (dates.length === 2) {
        const startDate = parseDateValue(dates[0]);
        console.log('🐸 Pepe said >> handleApplyButtonClick >> startDate:', dates, startDate);

        const endDate = parseDateValue(dates[1]);
        console.log('🐸 Pepe said >> handleApplyButtonClick >> endDate:', endDate);


        if (startDate && endDate) {
          const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00');
          const formattedEndDate = format(endDate, 'yyyy-MM-dd 00:00:00');
          updateColumnFilter(data.colId, {
            filterValues: [formattedStartDate, formattedEndDate],
          });
        }
      }
    } else {
      const parsedDate = parseDateValue(dateValue);
      if (parsedDate) {
        const formattedDate = format(parsedDate, 'yyyy-MM-dd 00:00:00');
        updateColumnFilter(data.colId, {
          filterValues: [formattedDate],
        });
      }
    }
  };

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'equals' | 'isRange';
    setFilterType(newType);
    setDateValue('');
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Select
        disabled={!data.isActive}
        value={filterType}
        onChange={handleFilterTypeChange}
        style={{ width: '100%' }}
      >
        <Option value="equals">Равно</Option>
        <Option value="isRange">Диапазон</Option>
      </Select>

      <DateField
        type={filterType === 'isRange' ? 'date-range' : 'date'}
        disabled={!data.isActive}
        value={dateValue}
        onChange={handleDateChange}
        placeholder={filterType === 'equals' ? 'Выберите дату' : 'Выберите диапазон'}
        style={{ width: '100%' }}
        dimension="s"
        displayClearIcon
      />

      <Button
        dimension="s"
        onClick={handleApplyButtonClick}
        disabled={!data.isActive}
        style={{ width: '100%' }}
      >
        Применить
      </Button>
    </div>
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
        cellRenderer: (params: any) => {
          if (params.data.type === COLUMN_TYPE.DATE) {
            return DateFieldRenderer(params);
          }
          return ChipsCellRenderer(params);
        },
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

