/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Button, TableRow as ATableRow, T, Toggle } from '@admiral-ds/react-ui';
import { ReactComponent as CloseOutline } from '@admiral-ds/icons/build/service/CloseOutline.svg';

import { Column, COLUMN_TYPE, ColumnsFilter, Row } from '@shared/types';
import { FiltersContext, Template } from '@shared/api';
import {
  ACTIVE_SCREEN,
  RIGHT_PANEL_TYPE,
  initialColumns,
  initialColumnsFilters,
} from '@shared/constants';
import { TemplatesFilter, FilterButtonCount } from '@entities';
import { useTemplateFilters } from '@src/shared/hooks';

import {
  ColDef,
  FirstDataRenderedEvent,
  GridApi,
  GridReadyEvent,
  IRowNode,
  RowDataUpdatedEvent,
  RowDragEndEvent,
  RowDragMoveEvent,
  RowSelectedEvent,
  SelectionChangedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { useDeepEffect } from '@src/shared/hooks/useDeepEffect';
import { AgGridReact, CustomCellRendererProps } from 'ag-grid-react';
import {
  ActionPanelLeft,
  ActionPanelRight,
  ActionPanelWrapper,
  ActiveTemplate,
  ChipsCustom,
  Wrapper,
} from './styles';
import { AgGridTemplateFilters } from '../NewTables/AgGridTemplateFilters';

export interface TemplateFiltersProps {
  templates: Template[];
  updateRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
  updateActiveScreen: (newActiveScreen: ACTIVE_SCREEN) => void;
}

const selectGridRowsByApi = (api: GridApi, selectedRows?: string[]) => {
  setTimeout(() => {
    const nodesToSelect: IRowNode[] = [];
    api.forEachNode((node) => {
      if (Array.isArray(selectedRows)) {
        if (selectedRows?.find((rowId) => rowId === node.data?.id)) {
          nodesToSelect.push(node);
        }
      } else {
        nodesToSelect.push(node);
      }
    });
    api.setNodesSelected({ nodes: nodesToSelect, newValue: true });
  }, 100);
};

export const TemplateFiltersNew = ({
  templates,
  updateRightPanelType,
  updateActiveScreen,
}: TemplateFiltersProps) => {
  const { topFilters, columnsFilters, onChangeColumnsFilters, onChangeTopFilters } =
    useContext(FiltersContext);

  const [rowData, setRowData] = useState<any[]>([]);
  const [showFilterTemplate, setShowFilterTemplate] = useState(true);
  const gridRef = useRef<AgGridReact>(null);

  const {
    modifiedFilters,
    activeTemplate,
    getFilteredColumns,
    resetFilters,
    shouldResetTemplateOnInitialFilterRemove,
  } = useTemplateFilters(columnsFilters, templates, topFilters.templates);

  const onGridReady = useCallback(() => {
    // add id to each item, needed for immutable store to work
    const newRows: ATableRow[] = getFilteredColumns(initialColumns, showFilterTemplate).map(
      (column) => {
        return {
          id: column.name,
          name: column.title,
          value: columnsFilters[column.name] ?? [],
        };
      },
    );

    setRowData(newRows);
  }, [columnsFilters, getFilteredColumns, showFilterTemplate]);

  // refactor
  const handleRemoveColumnFilterValue = useCallback(
    (columnFilterName: keyof Row, value?: string, type?: COLUMN_TYPE) => {
      const prevColumnsFilterValues = columnsFilters[columnFilterName];

      if (prevColumnsFilterValues) {
        const newColumnsFilters = {
          ...columnsFilters,
          [columnFilterName]:
            type === COLUMN_TYPE.DATE
              ? []
              : prevColumnsFilterValues.filter((filterValue) => filterValue !== value),
        };

        onChangeColumnsFilters(newColumnsFilters);
        onChangeTopFilters({ ...topFilters });
      }

      if (shouldResetTemplateOnInitialFilterRemove(columnFilterName)) {
        onChangeTopFilters({ ...topFilters, templates: [] });
      }
    },
    [columnsFilters, topFilters, modifiedFilters, onChangeColumnsFilters, onChangeTopFilters],
  );

  const cols: any[] = [
    {
      name: 'name',
      title: 'Наименование атрибута',
      width: '600px',
    },
    {
      name: 'value',
      title: 'Выбор',
      width: 'calc(100% - 600px)',
      cellStyle: {
        display: 'flex',
        alignItems: 'center',
      },

      cellRenderer: (params: CustomCellRendererProps) => {
        const row: any = rowData[params.data?.id || 0];
        const filters = columnsFilters[params.data?.id || 0];

        const filterType = initialColumns.find((column) => column.name === row?.id)?.type;

        const isTemplate = topFilters.templates.length > 0 && !modifiedFilters.has(row?.id);

        if (filterType === COLUMN_TYPE.DATE) {
          return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {filters?.length ? (
                <ChipsCustom
                  isTemplate={isTemplate}
                  dimension="s"
                  appearance="filled"
                  onClose={() => handleRemoveColumnFilterValue(row?.id, undefined, filterType)}
                >
                  {filters[0]} - {filters[1]}
                </ChipsCustom>
              ) : null}
            </div>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            {filters?.map((filterValue) => (
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
      },
    },
  ];

  const onSelectionChanged = (event: SelectionChangedEvent): void => {
    const eventSource = event.source;

    // prevent event loop. on chbx click events
    if (eventSource === 'checkboxSelected' || eventSource === 'uiSelectAllFiltered') {
      const selectedRows = event.api.getSelectedRows();

      const newColumnFilters = selectedRows.reduce((acc, currentRow) => {
        const columnFilterId = currentRow.id as keyof Row;

        const value = columnsFilters[columnFilterId];

        return { ...acc, [columnFilterId]: value || [] };
      }, {});

      onChangeColumnsFilters(newColumnFilters);
      onChangeTopFilters({ ...topFilters, templates: [] });

      const nodesToSelect: IRowNode[] = [];

      event.api.forEachNode((node) => {
        if (selectedRows.find((row) => row.id === node.data?.id)) {
          nodesToSelect.push(node);
        }
      });
      event.api.setNodesSelected({ nodes: nodesToSelect, newValue: true });
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    onChangeColumnsFilters(initialColumnsFilters);
    onChangeTopFilters({ ...topFilters, templates: [] });
    setTimeout(() => {
      if (gridRef.current?.api) {
        selectGridRowsByApi(gridRef.current.api);
      }
    }, 100);
  };

  const handleToggleChange = () => {
    setShowFilterTemplate((prev) => !prev);
  };

  const onFirstDataRendered = (event: FirstDataRenderedEvent) => {
    const selectedRows = Object.keys(columnsFilters);

    // select all if no template and no filters
    if (!activeTemplate && selectedRows.length === 0) {
      selectGridRowsByApi(event.api, []);
    }
    // select specific rows
    if (!activeTemplate && selectedRows.length > 0) {
      selectGridRowsByApi(event.api, selectedRows);
    }
  };

  const onRowDataUpdated = (event: RowDataUpdatedEvent) => {
    if (activeTemplate) {
      const selectedRows = Object.keys(activeTemplate.template_value ?? {});
      selectGridRowsByApi(event.api, selectedRows);
    }
  };

  const onRowDragEnd = (event: RowDragEndEvent) => {
    const rowId: string = event.node.data.id;
    const nextRowId: string = rowData[event.overIndex || 0 + 1]?.id as any;

    const keys = Object.keys(columnsFilters);
    const currentRowIndex = keys.findIndex((key) => key === rowId);
    const nextRowIndex = keys.findIndex((key) => key === nextRowId);
    const direction = currentRowIndex > nextRowIndex ? 'up' : 'down';

    keys.splice(currentRowIndex, 1);
    const nextRowIndexUpdated = keys.findIndex((key) => key === nextRowId);

    if (direction === 'up') {
      keys.splice(nextRowIndexUpdated, 0, rowId);
    } else {
      keys.splice(nextRowIndexUpdated + 1, 0, rowId);
    }

    const colFilters = keys.reduce((acc, cur) => {
      if (columnsFilters[cur as keyof typeof columnsFilters]) {
        acc[cur as keyof typeof columnsFilters] =
          columnsFilters[cur as keyof typeof columnsFilters];
      }

      return acc;
    }, {} as Partial<ColumnsFilter>);

    onChangeColumnsFilters(colFilters);
    onChangeTopFilters({ ...topFilters, templates: [] });
  };

  const filters = Object.keys(columnsFilters);

  const newRows: ATableRow[] = getFilteredColumns(initialColumns, showFilterTemplate)
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
        value: columnsFilters[column.name] ?? [],
      };
    });

  return (
    <Wrapper>
      <ActionPanelWrapper>
        <ActionPanelLeft>
          <FilterButtonCount
            topFilters={topFilters}
            updateActiveScreen={updateActiveScreen}
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
              updateRightPanelType={updateRightPanelType}
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
              onClick={() => updateActiveScreen(ACTIVE_SCREEN.TABLE)}
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
      <div>
        <AgGridTemplateFilters
          ref={gridRef}
          overrideColumnList={cols}
          overrideRowList={newRows as any}
          onRowDragEnd={onRowDragEnd}
          onFirstDataRendered={onFirstDataRendered}
          onRowDataUpdated={onRowDataUpdated}
          onSelectionChanged={onSelectionChanged}
          onGridReady={onGridReady}
          noCustomCells
        />
      </div>
    </Wrapper>
  );
};
