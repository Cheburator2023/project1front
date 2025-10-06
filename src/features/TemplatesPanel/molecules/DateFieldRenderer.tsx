import { useState, useEffect } from 'react';
import { Button, Select, Option, DateField } from '@admiral-ds/react-ui';
import { format, parse, isValid } from 'date-fns';
import ru from 'date-fns/locale/ru/index.js';
import styled from 'styled-components';
import {
  useTemplateFiltersModalStore,
  useTemplateFiltersModalStoreSelected,
} from '../stores/templateFiltersModalStore';

export const DateFieldRenderer = ({ data }: any) => {
  const updateColumnFilter = useTemplateFiltersModalStoreSelected.use.updateColumnFilter();
  const isEditMode = useTemplateFiltersModalStoreSelected.use.isEditMode();
  
  const readOnly = !isEditMode;

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
  const [initialDateValue, setInitialDateValue] = useState<string>(initializeDateValue());
  const [initialFilterType, setInitialFilterType] = useState<'equals' | 'isRange'>(
    initializeFilterType(),
  );

  useEffect(() => {
    const newDateValue = initializeDateValue();
    const newFilterType = initializeFilterType();
    setDateValue(newDateValue);
    setFilterType(newFilterType);
    setInitialDateValue(newDateValue);
    setInitialFilterType(newFilterType);
  }, [data.filterValues]);

  const parseDateValue = (value: string): Date | null => {
    if (!value) return null;

    const parsedDate = parse(value, 'dd.MM.yyyy', new Date(), { locale: ru });
    return isValid(parsedDate) ? parsedDate : null;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDateValue(inputValue);
  };

  const handleApply = () => {
    if (!dateValue) {
      updateColumnFilter(data.colId, {
        filterValues: [],
      });
      setInitialDateValue(dateValue);
      setInitialFilterType(filterType);
      return;
    }

    if (filterType === 'isRange') {
      const dates = dateValue.split(' - ');

      if (dates.length === 2) {
        const startDate = parseDateValue(dates[0]);
        const endDate = parseDateValue(dates[1]);

        if (startDate && endDate) {
          const formattedStartDate = format(startDate, 'yyyy-MM-dd 00:00:00', { locale: ru });
          const formattedEndDate = format(endDate, 'yyyy-MM-dd 00:00:00', { locale: ru });

          updateColumnFilter(data.colId, {
            filterValues: [formattedStartDate, formattedEndDate],
          });
          setInitialDateValue(dateValue);
          setInitialFilterType(filterType);
        }
      }
    } else {
      const parsedDate = parseDateValue(dateValue);
      if (parsedDate) {
        const formattedDate = format(parsedDate, 'yyyy-MM-dd 00:00:00');
        updateColumnFilter(data.colId, {
          filterValues: [formattedDate],
        });
        setInitialDateValue(dateValue);
        setInitialFilterType(filterType);
      }
    }
  };

  const handleFilterTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'equals' | 'isRange';
    setFilterType(newType);
    setDateValue('');
  };

  const hasChanges = dateValue !== initialDateValue || filterType !== initialFilterType;

  useEffect(() => {
    if (!hasChanges) return;

    setTimeout(() => {
      handleApply();
    }, 100);
  }, [hasChanges]);

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        padding: '8px 0',
      }}
    >
      <Select
        disabled={!data.isActive || readOnly}
        value={filterType}
        onChange={handleFilterTypeChange}
        dimension="s"
        readOnly={readOnly}
      >
        <Option value="equals">Равно</Option>
        <Option value="isRange">Диапазон</Option>
      </Select>

      <DateFieldWrapper>
        <DateField
          readOnly={readOnly}
          type={filterType === 'isRange' ? 'date-range' : 'date'}
          disabled={!data.isActive || readOnly}
          value={dateValue}
          onChange={handleDateChange}
          placeholder={filterType === 'equals' ? 'Выберите дату' : 'Выберите диапазон'}
          style={{ width: '100%' }}
          dimension="s"
          displayClearIcon
        />
      </DateFieldWrapper>

      {/* {hasChanges && (
        <Button
          dimension="s"
          onClick={handleApply}
          disabled={!data.isActive}
          style={{ width: '100%' }}
        >
          Применить
        </Button>
      )} */}
    </div>
  );
};

const DateFieldWrapper = styled('div')`
  width: 100%;
  * > {
    width: 100%;
  }
`;

