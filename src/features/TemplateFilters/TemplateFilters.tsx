import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, TableRow as ATableRow, T, Chips } from '@admiral-ds/react-ui';
import { ReactComponent as FilterOutline } from '@admiral-ds/icons/build/system/FilterOutline.svg';
import { ReactComponent as CloseOutline } from '@admiral-ds/icons/build/service/CloseOutline.svg';

import { COLUMN_TYPE, ColumnsFilter, Row } from '@shared/types';
import { FiltersContext, Template } from '@shared/api';
import { Table } from '@shared/ui';
import {
  ACTIVE_SCREEN,
  RIGHT_PANEL_TYPE,
  initialColumns,
  initialColumnsFilters,
} from '@shared/constants';
import { TemplatesFilter } from '@entities';

import {
  ActionPanelLeft,
  ActionPanelRight,
  ActionPanelWrapper,
  ActiveTemplate,
  BadgeCustom,
  Wrapper,
} from './styles';
import { getActiveFiltersCount } from './helpers';

export interface TemplateFiltersProps {
  templates: Template[];
  updateRightPanelType: (value: React.SetStateAction<RIGHT_PANEL_TYPE | null>) => void;
  updateActiveScreen: React.Dispatch<React.SetStateAction<ACTIVE_SCREEN>>;
}

export const TemplateFilters = ({
  templates,
  updateRightPanelType,
  updateActiveScreen,
}: TemplateFiltersProps) => {
  const { topFilters, columnsFilters, onChangeColumnsFilters, onChangeTopFilters } =
    useContext(FiltersContext);

  const [rows, setRows] = useState<ATableRow[]>([]);

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
        onChangeTopFilters({ ...topFilters, templates: [] });
      }
    },
    [columnsFilters],
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

          if (filterType === COLUMN_TYPE.DATE) {
            return (
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                {filters.length ? (
                  <Chips
                    dimension="s"
                    onClose={() => handleRemoveColumnFilterValue(row.id, undefined, filterType)}
                  >
                    {filters[0]} - {filters[1]}
                  </Chips>
                ) : null}
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              {filters.map((filterValue) => (
                <Chips
                  style={{ marginRight: '5px' }}
                  key={filterValue}
                  dimension="s"
                  onClose={() => handleRemoveColumnFilterValue(row.id, filterValue)}
                >
                  {filterValue}
                </Chips>
              ))}
            </div>
          );
        },
      },
    ],
    [handleRemoveColumnFilterValue],
  );

  useEffect(() => {
    const filters = Object.keys(columnsFilters);
    const newRows: ATableRow[] = initialColumns
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
      .map((column) => ({
        id: column.name,
        name: column.title,
        selected: !!columnsFilters[column.name],
        value: columnsFilters[column.name] ?? [],
      }));

    setRows(newRows);
  }, [columnsFilters]);

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

    onChangeColumnsFilters(
      keys.reduce((acc, cur) => {
        if (columnsFilters[cur as keyof typeof columnsFilters]) {
          acc[cur as keyof typeof columnsFilters] =
            columnsFilters[cur as keyof typeof columnsFilters];
        }

        return acc;
      }, {} as Partial<ColumnsFilter>),
    );
    onChangeTopFilters({ ...topFilters, templates: [] });
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

    onChangeColumnsFilters(newColumnFilters);
    onChangeTopFilters({ ...topFilters, templates: [] });

    setRows(updRows);
  };

  const handleResetFilters = () => {
    onChangeColumnsFilters(initialColumnsFilters);
    onChangeTopFilters({ ...topFilters, templates: [] });
  };

  const activeFiltersCount = useMemo(() => getActiveFiltersCount(columnsFilters), [columnsFilters]);

  return (
    <Wrapper>
      <ActionPanelWrapper>
        <ActionPanelLeft>
          <div>
            <Button
              dimension="s"
              icon={<FilterOutline />}
              onClick={() => updateActiveScreen(ACTIVE_SCREEN.TABLE)}
              appearance={topFilters.templates.length ? 'success' : 'primary'}
              displayAsSquare
            />

            <BadgeCustom
              appearance={topFilters.templates.length ? 'success' : 'info'}
              dimension="s"
            >
              {activeFiltersCount}
            </BadgeCustom>
          </div>

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
          <div>
            <Button
              style={{ marginRight: '10px' }}
              onClick={handleResetFilters}
              appearance="primary"
              dimension="s"
            >
              <T font="Button/Button 2" color="Special/Static White" as="div">
                По умолчанию
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
