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

interface InputFactoryI<T extends string> {
  inputFactory: InputFactoryProps<T>;
  autoFocus?: boolean;
  ref?: React.Ref<HTMLInputElement>;
  error?: boolean;
  values?: Partial<Record<T, InputValue>>;
  onChange: (name: T, value: InputValue) => void;
}

function InputFactory<T extends string>({
  inputFactory,
  values,
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
  } = inputFactory;

  const value = values?.[name];

  switch (type) {
    case INPUT_TYPE.NUMBER: {
      const {
        maxValue,
        minValue,
        displayPlusMinusIcons,
        precision = 0,
        suffix = '',
        initialValue,
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
      const { maxDate, minDate, initialValue } = inputFactory;

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
          value={formattedValue ? format(formattedValue, 'dd.MM.yyyy') : undefined}
          maxDate={maxDate}
          minDate={minDate}
          onChange={(e) =>
            onChange?.(name, { type, value: parse(e.target.value, 'dd.MM.yyyy', new Date()) })
          }
        />
      );
    }
    case INPUT_TYPE.QUARTERLY_DATE_GROUP: {
      const { quartes } = inputFactory;

      return (
        <Field
          key={id}
          required={required}
          status={error ? 'error' : undefined}
          extraText={error && 'Обязательное поле'}
          label={label}
          id={id}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              rowGap: '10px',
            }}
          >
            {quartes.map((quarter) => {
              const quarterValue = values?.[quarter.name];
              const quarterFormattedValue = getDateValue(quarterValue, quarter.initialValue);

              return (
                <DateField
                  style={{ maxWidth: '140px' }}
                  ref={ref}
                  autoFocus={autoFocus}
                  key={quarter.id}
                  status={error ? 'error' : undefined}
                  extraText={error && 'Обязательное поле'}
                  disabled={quarter.disabled}
                  dimension="s"
                  placeholder={quarter.placeholder}
                  required={quarter.required}
                  label={quarter.label}
                  value={
                    quarterFormattedValue ? format(quarterFormattedValue, 'dd.MM.yyyy') : undefined
                  }
                  maxDate={quarter.maxDate}
                  minDate={quarter.minDate}
                  onChange={(e) =>
                    onChange?.(quarter.name, {
                      type: quarter.type,
                      value: parse(e.target.value, 'dd.MM.yyyy', new Date()),
                    })
                  }
                />
              );
            })}
          </div>
        </Field>
      );
    }
    case INPUT_TYPE.TEXT_AREA: {
      const { length, maxRows, initialValue } = inputFactory;

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
      const { options, initialValue } = inputFactory;

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
      const { options, initialValue } = inputFactory;

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
      const { initialValue } = inputFactory;

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
    case INPUT_TYPE.STRING: {
      const { length, initialValue } = inputFactory;

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

    default:
      return null;
  }
}

export default React.memo(InputFactory) as typeof InputFactory;
