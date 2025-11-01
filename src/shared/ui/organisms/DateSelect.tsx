import { DateField, DropdownContainer, Select, Option, Field } from '@admiral-ds/react-ui';
import { isEmpty } from 'lodash';
import React, { useState, ChangeEvent } from 'react';

type DateType = 'single' | 'range';

interface DateSelectProps {
  value?: string[];
  initType?: DateType;
  onChange?: (value: string[]) => void;
}

export const DateSelect = ({ value, initType, onChange }: DateSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateType, setDateType] = useState<DateType>(initType || 'single');
  const [dateValue, setDateValue] = useState(value || []);

  const getDisplayValue = () => {
    if (!isEmpty(dateValue)) {
      return dateType === 'range' ? dateValue.join(' - ') : dateValue;
    }
    return 'Выберите дату';
  };

  const formatDateString = (dateValue: string): string[] => {
    if (!dateValue) return [];

    if (dateType === 'range' && dateValue.includes(' - ')) {
      const [startDate, endDate] = dateValue.split(' - ');

      if (endDate.includes('__')) {
        return [`${startDate}`];
      }

      return [`${startDate}`, `${endDate}`];
    }

    return [`${dateValue}`];
  };

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    const formattedDates = formatDateString(newValue);

    setDateValue(formattedDates);

    onChange?.(formattedDates.length === 1 ? formattedDates : formattedDates);
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDateType(event.target.value as DateType);
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const triggerRef = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        style={{
          padding: '0 12px',
          border: '1px solid #9BA0AA',
          borderRadius: '4px',
          cursor: 'pointer',
          minWidth: '200px',
          height: '-webkit-fill-available',
          display: 'flex',
          alignItems: 'center',
        }}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        {getDisplayValue()}
      </div>

      {isOpen && (
        <DropdownContainer
          alignSelf="stretch"
          targetRef={triggerRef as any}
          onClickOutside={() => setIsOpen(false)}
        >
          <div
            style={{
              padding: '16px',
              minWidth: '300px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow:
                ' 0px -1.5px 6px rgba(0, 0, 0, 0.06), 0px 0.6px 1.8px rgba(0, 0, 0, 0.1), 0px 3.2px 9px rgba(0, 0, 0, 0.16)',
            }}
          >
            <Select
              value={dateType}
              onChange={handleSelectChange}
              placeholder="Тип даты"
              style={{ marginBottom: '16px' }}
            >
              <Option value="single">Точная дата</Option>
              <Option value="range">Промежуток дат</Option>
            </Select>

            <DateField
              type={dateType === 'range' ? 'date-range' : 'date'}
              value={dateValue.join(' - ')}
              onChange={handleDateChange}
              placeholder={
                dateType === 'single'
                  ? 'Выберите дату'
                  : dateType === 'range'
                  ? 'Выберите промежуток'
                  : 'Выберите период'
              }
            />
          </div>
        </DropdownContainer>
      )}
    </>
  );
};

