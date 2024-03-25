import React from 'react';
import { format, parse } from 'date-fns';
import {
  CheckboxField,
  DateField,
  Field,
  InputField,
  NumberInputField,
  TextField,
} from '@admiral-ds/react-ui';

import { SearchSelect } from 'src/components';

import { INPUT_TYPE, InputFactoryProps, InputValue } from './types';

import {
  getDateValue,
  getFlagValue,
  getNumberValue,
  getSelectValue,
  getSelectValues,
  getStringValue,
} from './helpers';

interface InputFactoryI<T> {
  inputFactory: InputFactoryProps<T>;
  autoFocus?: boolean;
  ref?: React.Ref<HTMLInputElement>;
  error?: boolean;
  value?: InputValue;
  onChange: (name: T, value: InputValue) => void;
}

function InputFactory<T>({
  inputFactory,
  value,
  error,
  ref,
  autoFocus,
  onChange,
}: InputFactoryI<T>) {
  const {
    type,
    name,
    label,
    placeholder = 'Введите значение',
    id,
    required,
    disabled,
    initialValue,
  } = inputFactory;

  switch (type) {
    case INPUT_TYPE.NUMBER: {
      const {
        maxValue,
        minValue,
        displayPlusMinusIcons,
        precision = 0,
        suffix = '',
      } = inputFactory;

      const formattedValue = getNumberValue(value, initialValue);

      return (
        <NumberInputField
          ref={ref}
          disabled={disabled}
          autoFocus={autoFocus}
          key={id}
          status={error ? 'error' : undefined}
          extraText={error && 'Обязательное поле'}
          value={formattedValue}
          dimension="s"
          suffix={suffix}
          precision={precision}
          placeholder={placeholder}
          required={required}
          label={label}
          maxValue={maxValue}
          minValue={minValue}
          displayPlusMinusIcons={displayPlusMinusIcons}
          onChange={(e) => onChange?.(name, { type, value: Number(e.target.value) })}
        />
      );
    }
    case INPUT_TYPE.DATE: {
      const { maxDate, minDate } = inputFactory;

      const formattedValue = getDateValue(value, initialValue);

      return (
        <DateField
          ref={ref}
          autoFocus={autoFocus}
          key={id}
          status={error ? 'error' : undefined}
          extraText={error && 'Обязательное поле'}
          disabled={disabled}
          dimension="s"
          placeholder={placeholder}
          required={required}
          label={label}
          value={formattedValue ? format(formattedValue, 'dd.MM.YYYY') : undefined}
          maxDate={maxDate}
          minDate={minDate}
          onChange={(e) =>
            onChange?.(name, { type, value: parse(e.target.value, 'dd.MM.YYYY', new Date()) })
          }
        />
      );
    }
    case INPUT_TYPE.TEXT_AREA: {
      const { length, maxRows } = inputFactory;

      const formattedValue = getStringValue(value, initialValue);

      return (
        <TextField
          autoFocus={autoFocus}
          key={id}
          status={error ? 'error' : undefined}
          extraText={error && 'Обязательное поле'}
          disabled={disabled}
          dimension="s"
          value={formattedValue}
          placeholder={placeholder}
          required={required}
          label={label}
          maxLength={length}
          maxRows={maxRows}
          onChange={(e) => onChange?.(name, { type, value: e.target.value })}
        />
      );
    }
    case INPUT_TYPE.SELECT: {
      const { options } = inputFactory;

      const formattedValue = getSelectValue(value, initialValue);

      return (
        <SearchSelect
          key={String(formattedValue?.length)}
          autoFocus={autoFocus}
          error={error}
          extraText={error ? 'Обязательное поле' : undefined}
          disabled={disabled}
          name={`${name}`}
          multiple={false}
          displayClearIcon
          required={required}
          label={label}
          options={options}
          selectedValues={formattedValue}
          onChange={(_, selectedValue) =>
            onChange?.(name, {
              type,
              value: getSelectValues(selectedValue, options.options)[0],
            })
          }
        />
      );
    }
    case INPUT_TYPE.MULTI_SELECT: {
      const { options } = inputFactory;

      const formattedValue = getSelectValue(value, initialValue);

      return (
        <SearchSelect
          key={String(formattedValue?.length)}
          name={`${name}`}
          displayClearIcon
          error={error}
          extraText={error ? 'Обязательное поле' : undefined}
          disabled={disabled}
          autoFocus={autoFocus}
          required={required}
          label={label}
          options={options}
          selectedValues={formattedValue}
          onChange={(_, selectedValues) =>
            onChange?.(name, {
              type,
              value: getSelectValues(selectedValues, options.options),
            })
          }
        />
      );
    }
    case INPUT_TYPE.FLAG: {
      const formattedValue = getFlagValue(value, initialValue);

      return (
        <Field
          key={id}
          required={required}
          status={error ? 'error' : undefined}
          extraText={error && 'Обязательное поле'}
          label={label}
          id={id}
        >
          <CheckboxField
            id={id}
            disabled={disabled}
            autoFocus={autoFocus}
            dimension="s"
            checked={formattedValue}
            onChange={(e) => onChange?.(name, { type, value: e.target.checked })}
          >
            Да
          </CheckboxField>
        </Field>
      );
    }
    default: {
      const { length } = inputFactory;

      const formattedValue = getStringValue(value, initialValue);

      return (
        <InputField
          ref={ref}
          status={error ? 'error' : undefined}
          extraText={error && 'Обязательное поле'}
          disabled={disabled}
          autoFocus={autoFocus}
          key={id}
          maxLength={length}
          dimension="s"
          value={formattedValue}
          placeholder={placeholder}
          required={required}
          label={label}
          onChange={(e) => onChange?.(name, { type, value: e.target.value })}
        />
      );
    }
  }
}

export default React.memo(InputFactory) as typeof InputFactory;
