import React, { forwardRef, useState } from 'react';
import { parse, isWithinInterval } from 'date-fns';
import { DateField } from '@admiral-ds/react-ui';
import { getDateValue } from './helpers';
import { InputValue } from './types';

interface InputFactoryDateFieldProps<T> {
  values: any;
  field: any;
  editFieldName?: string;
  onChange: (name: string, value: InputValue) => void;
}

interface InputFactoryDateFieldRef {
  focus: () => void;
}

export const InputFactoryDateField = forwardRef<
  InputFactoryDateFieldRef,
  InputFactoryDateFieldProps<string>
>(({ values, field, onChange, editFieldName }, ref) => {
  const quarterDateValue = getDateValue(values?.[field.name]);
  const { minDate, maxDate } = field;
  const [hasError, setHasError] = useState(false);
  // TODO: refactoring
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const parsedDate = inputValue ? parse(inputValue, 'dd.MM.yyyy', new Date()) : null;

    const isValidDate =
      parsedDate && isWithinInterval(parsedDate, { start: minDate!, end: maxDate! });

    if (isValidDate) {
      setHasError(false);
      onChange?.(field.name, {
        type: field.type,
        value: parsedDate,
      });
    } else {
      setHasError(true);
      onChange?.(field.name, {
        type: field.type,
        value: null,
      });
    }
  };

  return (
    <DateField
      ref={ref as React.Ref<HTMLInputElement> | undefined}
      style={{ minWidth: '140px' }}
      autoFocus={editFieldName === field.name}
      status={hasError ? 'error' : undefined}
      extraText={hasError ? 'Введите корректную дату в пределах квартала' : undefined}
      disabled={field.disabled}
      dimension="s"
      placeholder="Укажите дату"
      required={field.required}
      label={field.label}
      value={quarterDateValue}
      disableCopying
      displayClearIcon
      maxDate={field.maxDate}
      minDate={field.minDate}
      onChange={handleDateChange}
    />
  );
});

