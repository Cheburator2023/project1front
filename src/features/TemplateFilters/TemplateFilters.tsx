import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, TableRow as ATableRow, T, Toggle } from '@admiral-ds/react-ui';
import { ReactComponent as CloseOutline } from '@admiral-ds/icons/build/service/CloseOutline.svg';

import { COLUMN_TYPE, ColumnsFilter, Row } from '@shared/types';
import { Template } from '@shared/api';
import { useFiltersStore } from '@shared/stores/filtersStore';
import { Table } from '@shared/ui';
import {
  ACTIVE_SCREEN,
  RIGHT_PANEL_TYPE,
  initialColumns,
  initialColumnsFilters,
} from '@shared/constants';
import { TemplatesFilter, FilterButtonCount } from '@entities';
import { useTemplateFilters } from '@src/shared/hooks';

import {
  ActionPanelLeft,
  ActionPanelRight,
  ActionPanelWrapper,
  ActiveTemplate,
  ChipsCustom,
  Wrapper,
} from './styles';

export interface TemplateFiltersProps {
  templates: Template[];
  updateRightPanelType: (newRightPanelType: RIGHT_PANEL_TYPE | null) => void;
  updateActiveScreen: (newActiveScreen: ACTIVE_SCREEN) => void;
}

export const TemplateFilters = ({
  templates,
  updateRightPanelType,
  updateActiveScreen,
}: TemplateFiltersProps) => {
  const { topFilters, columnsFilters, setColumnsFilters, setTopFilters } = useFiltersStore();

  const [rows, setRows] = useState<ATableRow[]>([]);
  const [showFilterTemplate, setShowFilterTemplate] = useState(true);

  const {
    modifiedFilters,
    activeTemplate,
    getFilteredColumns,
    resetFilters,
    shouldResetTemplateOnInitialFilterRemove,
  } = useTemplateFilters(columnsFilters, templates, topFilters.templates);

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

        setColumnsFilters(newColumnsFilters);
        setTopFilters({ ...topFilters });
      }

      if (shouldResetTemplateOnInitialFilterRemove(columnFilterName)) {
        setTopFilters({ ...topFilters, templates: [] });
      }
    },
    [columnsFilters, topFilters, modifiedFilters, setColumnsFilters, setTopFilters],
  );

  const cols = useMemo(
    () => [
      {
        name: 'name',
        title: 'Наименование атрибута',
        width: 600,
        sticky: true,
      },
      {
        name: 'value',
        title: 'Выбор',
        width: 'calc(100% - 600px)',
        renderCell(filters: string[], row: ATableRow & { id: keyof Row }): React.ReactNode {
          const filterType = initialColumns.find((column) => column.name === row.id)?.type;

          const isTemplate = topFilters.templates.length > 0 && !modifiedFilters.has(row.id);

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
              {filters.map((filterValue) => (
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
    ],
    [handleRemoveColumnFilterValue, modifiedFilters],
  );

  useEffect(() => {
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
          selected: !!columnsFilters[column.name],
          value: columnsFilters[column.name] ?? [],
        };
      });

    setRows(newRows);
  }, [columnsFilters, showFilterTemplate, modifiedFilters]);

  const handleDragRows = (rowId: string, nextRowId: string | null, _: string | null) => {
    const currentRow = rows.find((row) => row.id === rowId);
    const nextRow = rows.find((row) => row.id === nextRowId);
    if (!currentRow?.selected || !nextRow?.selected) return;

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

    setColumnsFilters(
      keys.reduce((acc, cur) => {
        if (columnsFilters[cur as keyof typeof columnsFilters]) {
          acc[cur as keyof typeof columnsFilters] =
            columnsFilters[cur as keyof typeof columnsFilters];
        }

        return acc;
      }, {} as Partial<ColumnsFilter>),
    );
    setTopFilters({ ...topFilters, templates: [] });
  };

  const handleSelectionChange = (ids: Record<string, boolean>): void => {
    const updRows = rows.map((row) => ({ ...row, selected: ids[row.id] }));

    const newColumnFilters = Object.entries(ids).reduce((newColumnFilters, currentFilter) => {
      const [columnFilterName, selected] = currentFilter as [keyof Row, boolean];

      if (selected) {
        const value = columnsFilters[columnFilterName];

        if (value) {
          return {
            ...newColumnFilters,
            [columnFilterName]: value,
          };
        }

        return {
          ...newColumnFilters,
          [columnFilterName]: [],
        };
      }

      return newColumnFilters;
    }, {} as Partial<ColumnsFilter>);

    setColumnsFilters(newColumnFilters);
    setTopFilters({ ...topFilters, templates: [] });

    setRows(updRows);
  };

  const handleResetFilters = () => {
    resetFilters();
    setColumnsFilters(initialColumnsFilters);
    setTopFilters({ ...topFilters, templates: [] });
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
        <Table
          rowList={rows}
          columnList={cols}
          disableColumnResize
          rowsDraggable
          onRowDrag={handleDragRows}
          displayRowSelectionColumn
          greyHeader
          onRowSelectionChange={handleSelectionChange}
          style={{ maxHeight: 'calc(100vh - 185px)' }}
        />
      </div>
    </Wrapper>
  );
};
