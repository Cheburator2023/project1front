import React, { useEffect, useState } from 'react';
import { Button } from '@admiral-ds/react-ui';

import { COLUMN_TYPE, Column, ColumnsFilter, Row, TopFilters } from '@shared/types';
import { SELECT_TYPE } from '@shared/ui/organisms';
import { getColumnFilterOptions, getFilteredRowsByColumnsFilter } from '@shared/helpers';

import { CustomDateField, CustomSearchSelect } from './styles';
import { getDateRange, getFormattedDateValue } from './helpers';
import { useTemplateFilters } from '@src/shared/hooks';
import { Template } from '@src/shared/api/types';

export interface ColumnFilterProps {
  column: Column;
  rowList: Partial<Row>[];
  columnsFilters: Partial<ColumnsFilter>;
  onChangeColumnsFilter: (rowFieldName: string, selectValue: string[]) => void;
  onChangeTopFilters: (filters: any) => void;
  topFilters: TopFilters;
  templates: Template[];
}

export const ColumnFilter = React.memo(
  ({
    column,
    rowList,
    columnsFilters,
    onChangeColumnsFilter,
    onChangeTopFilters,
    topFilters,
    templates,
  }: ColumnFilterProps) => {
    const initialValue =
      column.type === COLUMN_TYPE.DATE
        ? getFormattedDateValue(columnsFilters?.[column.name])
        : columnsFilters?.[column.name];

    const [value, setValue] = useState<string[] | string | undefined>(initialValue);
    const initialTemplateValue = columnsFilters?.[column.name] || [];

    const { shouldResetTemplateOnInitialValueChange } = useTemplateFilters(
      columnsFilters,
      templates,
      topFilters.templates,
    );

    useEffect(() => {
      setValue(initialValue);
    }, [columnsFilters, initialValue]);

    const handleApplyFilter = () => {
      if (value) {
        const arrayValue = Array.isArray(value) ? value : [value];
        onChangeColumnsFilter(column.name, arrayValue);

        if (
          shouldResetTemplateOnInitialValueChange(arrayValue, initialTemplateValue, column.name)
        ) {
          onChangeTopFilters({ ...topFilters, templates: [] });
        }
      }
    };

    switch (column.type) {
      case COLUMN_TYPE.QUARTERLY_DATE:
      case COLUMN_TYPE.DATE: {
        const formattedValue = getFormattedDateValue(value);

        return (
          <div
            onClick={(
              e: React.MouseEvent<HTMLDivElement, MouseEvent> | React.KeyboardEvent<HTMLDivElement>,
            ) => {
              e.stopPropagation();
            }}
          >
            <CustomDateField
              type="date-range"
              dimension="s"
              id="dates"
              displayClearIcon
              placeholder="Дата не выбрана"
              dropContainerClassName="dropContainerClass"
              value={value}
              disableCopying
              onChange={(e) => {
                const newDateValue = e.currentTarget.value;

                setValue(newDateValue);

                const dateRange = getDateRange(newDateValue);

                if (dateRange) {
                  onChangeColumnsFilter(column.name, dateRange);
                }
              }}
            />
          </div>
        );
      }

      default: {
        if (typeof value === 'string') {
          return null;
        }

        const filteredRowsIds = getFilteredRowsByColumnsFilter(rowList, columnsFilters).reduce(
          (filteredRowsIds, filteredRow) => {
            if (filteredRow && filteredRow?.id) {
              return [...filteredRowsIds, filteredRow.id];
            }

            return filteredRowsIds;
          },
          [] as string[],
        );

        const options = getColumnFilterOptions(
          rowList,
          column.name,
          columnsFilters,
          filteredRowsIds,
        );

        return (
          <CustomSearchSelect
            key={`${filteredRowsIds.length}`}
            name={column.name}
            selectedValues={value}
            onChange={(_, newValue) => {
              setValue(newValue);
            }}
            selectNotNullEnabled
            selectEmptyEnabled
            virtualScrollEnabled
            options={{
              type: SELECT_TYPE.STRING,
              options,
            }}
            renderDropDownBottomPanel={() => (
              <Button onClick={handleApplyFilter} dimension="s">
                Применить
              </Button>
            )}
          />
        );
      }
    }
  },
);

ColumnFilter.displayName = 'ColumnFilter';
