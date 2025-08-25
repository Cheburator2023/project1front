import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';

import { Button, T, Toggle } from '@admiral-ds/react-ui';
import { ReactComponent as CloseOutline } from '@admiral-ds/icons/build/service/CloseOutline.svg';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  GridReadyEvent,
  RowDragEndEvent,
  SelectionChangedEvent,
  ICellRendererParams,
} from 'ag-grid-community';

import { COLUMN_TYPE, ColumnsFilter, Row } from '@shared/types';
import { Template } from '@shared/api';
import { useFiltersStore } from '@shared/stores/filtersStore';
import {
  ACTIVE_SCREEN,
  RIGHT_PANEL_TYPE,
  initialColumns,
} from '@shared/constants';
import { TemplatesFilter, FilterButtonCount } from '@entities';
import { useTemplateFilters } from '@src/shared/hooks';
import { useDisplayStore, useTemplatesStore } from '@src/shared/stores';
import { AG_GRID_LOCALE_RU } from '@src/pages/Playground/locale/agGridLocale.ru';

import {
  ActionPanelLeft,
  ActionPanelRight,
  ActionPanelWrapper,
  ActiveTemplate,
  ChipsCustom,
  Wrapper,
} from './styles';
import { useDeepEffect } from '../../shared/hooks/useDeepEffect';

export const TemplateFilters = () => {
  const { templates } = useTemplatesStore();
  const { setActiveScreen, setRightPanelType } = useDisplayStore();
  const { topFilters, setTopFilters, filterModel, setFilterModel, resetFilters } = useFiltersStore();
  const gridRef = useRef<AgGridReact>(null);

  const handleChangeColumnsFilter = useCallback(
    (rowFieldName: string, selectValue: string[]) => {
      const columnType = initialColumns.find((col) => col.name === rowFieldName)?.type;

      const newFilterModel = { ...filterModel };
      if (selectValue.length > 0) {
        if (columnType === COLUMN_TYPE.DATE) {
          if (selectValue[0] === selectValue[1]) {
            newFilterModel[rowFieldName] = {
              dateFrom: selectValue[0],
              dateTo: null,
              type: 'equals',
            };
          } else {
            newFilterModel[rowFieldName] = {
              dateFrom: selectValue[0],
              dateTo: selectValue[1],
              type: 'inRange',
            };
          }
        } else {
          newFilterModel[rowFieldName] = {
            values: selectValue,
          };
        }
      } else {
        delete newFilterModel[rowFieldName];
      }

      setFilterModel(newFilterModel);
      setTopFilters({ ...topFilters, templates: topFilters.templates || [] });
    },
    [filterModel, setFilterModel, topFilters, setTopFilters],
  );
  const columnsFilters = filterModel;

  const [rows, setRows] = useState<any[]>([]);
  const [showFilterTemplate, setShowFilterTemplate] = useState(true);

  const {
    modifiedFilters,
    activeTemplate,
    getFilteredColumns,
    resetFilters: resetTemplateFilters,
    shouldResetTemplateOnInitialFilterRemove,
  } = useTemplateFilters(columnsFilters, templates, topFilters.templates);

  // refactor
  const handleRemoveColumnFilterValue = useCallback(
    (columnFilterName: keyof Row, value?: string, type?: COLUMN_TYPE) => {
      const prevColumnsFilterValues = columnsFilters[columnFilterName];

      if (prevColumnsFilterValues) {
        const newFilterValues = type === COLUMN_TYPE.DATE
          ? []
          : prevColumnsFilterValues.filter((filterValue) => filterValue !== value);

        setFilterModel({ ...filterModel, [columnFilterName]: newFilterValues });
        setTopFilters({ ...topFilters });
      }

      if (shouldResetTemplateOnInitialFilterRemove(columnFilterName)) {
        setTopFilters({ ...topFilters, templates: [] });
      }
    },
    [columnsFilters, topFilters, filterModel, setFilterModel, setTopFilters, shouldResetTemplateOnInitialFilterRemove],
  );

  const ValueCellRenderer = useCallback((params: ICellRendererParams) => {
    const filters = params.value || [];
    const row = params.data;
    const filterType = initialColumns.find((column) => column.name === row.id)?.type;
    const hasActiveTemplate = topFilters.templates.length > 0;
    const isModified = modifiedFilters.has(row.id);
    const isTemplate = hasActiveTemplate && !isModified;

    if (filterType === COLUMN_TYPE.DATE) {
      return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {filters.length ? (
            <ChipsCustom
              isTemplate={isTemplate}
              dimension="s"
              appearance="filled"
              onClose={() => handleRemoveColumnFilterValue(row.id, undefined, filterType)}
            >
              {filters[0]} - {filters[1]}
            </ChipsCustom>
          ) : null}
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        {filters.map((filterValue: string) => (
          <ChipsCustom
            isTemplate={isTemplate}
            style={{ marginRight: '5px' }}
            key={filterValue}
            dimension="s"
            appearance="filled"
            onClose={() => handleRemoveColumnFilterValue(row.id, filterValue)}
          >
            {filterValue}
          </ChipsCustom>
        ))}
      </div>
    );
  }, [handleRemoveColumnFilterValue, modifiedFilters, topFilters.templates.length]);

  const columnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Наименование атрибута',
        field: 'name',
        width: 600,
        pinned: 'left',
        rowDrag: true,
      },
      {
        headerName: 'Выбор',
        field: 'value',
        flex: 1,
        cellRenderer: ValueCellRenderer,
      },
    ],
    [ValueCellRenderer],
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    const selectedRowIds = rows.filter(row => row.selected).map(row => row.id);
    params.api.forEachNode(node => {
      if (selectedRowIds.includes(node.data.id)) {
        node.setSelected(true);
      }
    });
  }, [rows]);

  const getFilterValues = useCallback((filterValue: any): string[] => {
    if (!filterValue) return [];
    if (Array.isArray(filterValue)) return filterValue;

    if (typeof filterValue === 'object') {
      if ('values' in filterValue) {
        return filterValue.values;
      }
      if ('dateFrom' in filterValue) {
        return filterValue.dateTo ? [filterValue.dateFrom, filterValue.dateTo] : [filterValue.dateFrom];
      }
    }

    return [];
  }, []);

  useDeepEffect(() => {
    const filters = Object.keys(columnsFilters);

    const newRows: any[] = getFilteredColumns(initialColumns, showFilterTemplate)
      .sort((prevColumn, nextColumn) => {
        const prevIndex = filters.indexOf(prevColumn.name);
        const nextIndex = filters.indexOf(nextColumn.name);

        if (prevIndex !== -1 && nextIndex !== -1) {
          return prevIndex - nextIndex;
        }

        if (prevIndex !== -1) {
          return -1;
        }

        if (nextIndex !== -1) {
          return 1;
        }

        return 0;
      })
      .map((column) => {
        return {
          id: column.name,
          name: column.title,
          selected: !!columnsFilters[column.name],
          value: getFilterValues(columnsFilters[column.name]),
        };
      });

    setRows(newRows);
  }, [columnsFilters, showFilterTemplate, modifiedFilters, getFilteredColumns]);

  const handleRowDragEnd = useCallback((event: RowDragEndEvent) => {
    if (!event.overNode) return;

    const draggedData = event.node.data;
    const overData = event.overNode.data;

    if (!draggedData?.selected || !overData?.selected) return;

    const keys = Object.keys(columnsFilters);
    const currentRowIndex = keys.findIndex((key) => key === draggedData.id);
    const nextRowIndex = keys.findIndex((key) => key === overData.id);

    if (currentRowIndex === -1 || nextRowIndex === -1) return;

    const direction = currentRowIndex > nextRowIndex ? 'up' : 'down';

    keys.splice(currentRowIndex, 1);
    const nextRowIndexUpdated = keys.findIndex((key) => key === overData.id);

    if (direction === 'up') {
      keys.splice(nextRowIndexUpdated, 0, draggedData.id);
    } else {
      keys.splice(nextRowIndexUpdated + 1, 0, draggedData.id);
    }

    keys.forEach((key) => {
      const filterValues = columnsFilters[key as keyof typeof columnsFilters];
      if (filterValues) {
        handleChangeColumnsFilter(key, getFilterValues(filterValues));
      }
    });
    setTopFilters({ ...topFilters, templates: [] });
  }, [columnsFilters, handleChangeColumnsFilter, topFilters, setTopFilters, getFilterValues]);

  const handleSelectionChange = useCallback((event: SelectionChangedEvent): void => {
    const selectedNodes = event.api.getSelectedNodes();
    const selectedIds = selectedNodes.map(node => node.data.id);

    const updatedRows = rows.map(row => ({
      ...row,
      selected: selectedIds.includes(row.id)
    }));

    const newFilterModel = { ...filterModel };
    let hasChanges = false;

    updatedRows.forEach(row => {
      const columnName = row.id as keyof Row;
      const columnType = initialColumns.find((col) => col.name === columnName)?.type;

      if (row.selected) {
        const existingValue = columnsFilters[columnName];
        const filterValues = getFilterValues(existingValue) || [];

        if (filterValues.length > 0) {
          if (columnType === COLUMN_TYPE.DATE) {
            if (filterValues[0] === filterValues[1]) {
              newFilterModel[columnName] = {
                dateFrom: filterValues[0],
                dateTo: null,
                type: 'equals',
              };
            } else {
              newFilterModel[columnName] = {
                dateFrom: filterValues[0],
                dateTo: filterValues[1],
                type: 'inRange',
              };
            }
          } else {
            newFilterModel[columnName] = {
              values: filterValues,
            };
          }
          hasChanges = true;
        }
      } else {
        if (newFilterModel[columnName]) {
          delete newFilterModel[columnName];
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setFilterModel(newFilterModel);
      setTopFilters({ ...topFilters, templates: [] });
    }

    setRows(updatedRows);
  }, [rows, filterModel, columnsFilters, topFilters, setFilterModel, setTopFilters, getFilterValues]);

  const handleResetFilters = () => {
    resetFilters();
  };

  const handleToggleChange = () => {
    setShowFilterTemplate((prev) => !prev);
  };

  return (
    <Wrapper>
      <ActionPanelWrapper>
        <ActionPanelLeft>
          <FilterButtonCount
            topFilters={topFilters}
            updateActiveScreen={setActiveScreen}
            columnsFilters={columnsFilters}
            activeScreen={ACTIVE_SCREEN.TABLE}
            templates={templates}
          />
          <T style={{ marginLeft: '10px' }} font="Subtitle/Subtitle 2">
            Фильтры
          </T>
        </ActionPanelLeft>
        <ActionPanelRight>
          <ActiveTemplate>
            <T style={{ marginRight: '10px' }} font="Subtitle/Subtitle 2">
              Активный шаблон:
            </T>
            <TemplatesFilter
              showLabel={false}
              templates={templates}
              activeTemplate={activeTemplate}
              updateRightPanelType={setRightPanelType}
            />
          </ActiveTemplate>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {activeTemplate && (
              <Toggle
                checked={showFilterTemplate}
                dimension="s"
                labelPosition="right"
                onChange={handleToggleChange}
              >
                Показать фильтры шаблона
              </Toggle>
            )}
            <Button
              style={{ marginRight: '10px', marginLeft: '10px' }}
              onClick={handleResetFilters}
              appearance="danger"
              dimension="s"
            >
              <T font="Button/Button 2" color="Special/Static White" as="div">
                Очистить фильтры
              </T>
            </Button>
            <Button
              onClick={() => setActiveScreen(ACTIVE_SCREEN.TABLE)}
              appearance="ghost"
              dimension="s"
              icon={<CloseOutline />}
              iconPlace="right"
            >
              <T font="Body/Body 2 Long" color="Primary/Primary 60 Main" as="div">
                Закрыть
              </T>
            </Button>
          </div>
        </ActionPanelRight>
      </ActionPanelWrapper>
      <div className="ag-theme-quartz" style={{ height: 'calc(100vh - 185px)', width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          rowSelection={{ mode: 'multiRow', checkboxes: true }}
          rowDragManaged
          animateRows
          onGridReady={onGridReady}
          onSelectionChanged={handleSelectionChange}
          onRowDragEnd={handleRowDragEnd}
          localeText={AG_GRID_LOCALE_RU}
          suppressRowClickSelection
          headerHeight={40}
          rowHeight={50}
        />
      </div>
    </Wrapper>
  );
};
