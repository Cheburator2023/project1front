/* eslint-disable no-useless-concat */
import React from 'react';
import { isWithinInterval, parse } from 'date-fns';
import {
  CheckboxField,
  DateField,
  Field,
  InputField,
  NumberInputField,
  TextField,
} from '@admiral-ds/react-ui';

import { SearchSelect, RFDInput } from '@shared/ui/organisms';

import { INPUT_TYPE, InputFactoryProps, InputValue } from './types';

import {
  calculateTotalPercentage,
  getDateValue,
  getFlagValue,
  getNumberValue,
  getSelectValue,
  getSelectValues,
  getStringValue,
  getRFDValue,
} from './helpers';
import { Artifact } from '../../../api';
import { InputFactoryExtraText } from './InputFactoryExtraText';
import { InputFactoryDateField } from './InputFactoryDateField';
import { ModelRiskInput } from '../ModelRiskInput';

interface InputFactoryI<T extends string> {
  inputFactory: InputFactoryProps<T>;
  editFieldName?: T;
  ref?: React.Ref<HTMLInputElement>;
  error?: boolean;
  values?: Partial<Record<T, InputValue>>;
  onChange: (name: T, value: InputValue) => void;
  artifacts?: Artifact[];
}

function InputFactorySwitcher<T extends string>({
  inputFactory,
  values,
  error,
  ref,
  editFieldName,
  onChange,
  artifacts,
}: InputFactoryI<T>) {
  const {
    type,
    name,
    label,
    addNewOptionEnabled,
    placeholder = 'Введите значение',
    id,
    requireConditions,
    valueConditions,
    required,
    disabled,
  } = inputFactory;

  const value = values?.[name];

  const autoFocus = editFieldName === name;

  const valueConditionsText = valueConditions
    ?.map(
      (valueCondition) =>
        `при значении поля: "${
          valueCondition.value || '"пустое_значение"'
        }", зависит от поля: ${valueCondition.conditions.map((condition) => {
          const key = artifacts?.find(
            (artifact) => artifact.artefact_tech_label === Object.keys(condition)[0],
          )?.artefact_label;

          return `"${key}", со значениями: "${Object.values(condition)
            .map((v) => v || '"пустое_значение"')
            .join(', ')}"`;
        })}`,
    )
    .join(', ');

  const extraTextInitial = `${valueConditionsText ? `${valueConditionsText}` : ''}`;

  const extraTextInitialError = extraTextInitial ? (
    <InputFactoryExtraText
      extraTextInitial={extraTextInitial}
      conditionText="Обязательное поле, есть условия для заполнения"
      isError
    />
  ) : (
    'Обязательное поле'
  );

    console.log('🐸 Pepe said >> InputFactorySwitcher >> type:', type, name);

  switch (type) {

    case INPUT_TYPE.NUMBER: {
      const {
        maxValue,
        minValue,
        displayPlusMinusIcons,
        precision = 0,
        suffix = '',
      } = inputFactory;

      const formattedValue = getNumberValue(value);

      return (
        <NumberInputField
          ref={ref}
          disabled={disabled}
          autoFocus={autoFocus}
          key={id}
          status={error ? 'error' : undefined}
          extraText={error && extraTextInitialError}
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

      const dateValue = getDateValue(value);

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const parsedDate = inputValue ? parse(inputValue, 'dd.MM.yyyy', new Date()) : null;

        onChange?.(name, {
          type,
          value: parsedDate?.toString() !== 'Invalid Date' ? parsedDate : null,
        });
      };

      return (
        <DateField
          ref={ref}
          autoFocus={autoFocus}
          key={id}
          disableCopying
          displayClearIcon
          status={error ? 'error' : undefined}
          extraText={error && extraTextInitialError}
          disabled={disabled}
          dimension="s"
          placeholder={placeholder}
          required={required}
          label={label}
          value={dateValue}
          maxDate={maxDate}
          minDate={minDate}
          onChange={handleChange}
        />
      );
    }

    case INPUT_TYPE.SELECT: {
      const { options } = inputFactory;
      const isTree = options?.options?.some(
        (option) => option?.nestedValues?.length || option?.parentsValues?.length,
      );

      const formattedValue = getSelectValue(value);

      const getExtraText = () => {
        if (error) {
          return extraTextInitialError;
        }

        if (requireConditions) {
          if (valueConditions) {
            return (
              <InputFactoryExtraText
                extraTextInitial={extraTextInitial}
                conditionText="Есть условия для заполнения"
              />
            );
          }

          return (
            <InputFactoryExtraText
              extraTextInitial={extraTextInitial}
              conditionText="Есть условия для обязательного заполнения 2"
            />
          );
        }

        if (valueConditions) {
          return (
            <InputFactoryExtraText
              extraTextInitial={extraTextInitial}
              conditionText="Есть условия для обязательного значения"
            />
          );
        }

        return '';
      };

      let allowedOptions: string[] = [];

      inputFactory?.optionConditions?.map((optionCondition) => {
        const connectedFieldValue =
          values?.[optionCondition?.connected_field as keyof typeof values];

        if ((connectedFieldValue?.value as { text: string })?.text === optionCondition.value) {
          allowedOptions = [...allowedOptions, ...optionCondition.options];
        }

        return null;
      });

      const _options = allowedOptions.length
        ? {
            ...options,
            options: options.options.filter((option) =>
              allowedOptions.toString().includes(option.text),
            ),
          }
        : options;

      return (
        <SearchSelect
          key={name}
          autoFocus={autoFocus}
          error={error}
          extraText={getExtraText()}
          disabled={disabled}
          name={`${name}`}
          multiple={isTree}
          displayClearIcon
          required={required}
          label={label}
          addNewOptionEnabled={addNewOptionEnabled}
          options={_options}
          selectAllEnabled={!isTree}
          selectType={type}
          selectedValues={formattedValue}
          onChange={(_, selectedValue) => {
            const _value = isTree
              ? getSelectValues(selectedValue, _options.options)
              : getSelectValues(selectedValue, _options.options)[0] || {
                  id: selectedValue[0],
                  text: selectedValue[0],
                };

            return onChange?.(name, {
              type,
              value: selectedValue === undefined ? undefined : _value,
            });
          }}
        />
      );
    }

    case INPUT_TYPE.QUARTERLY_DROPDOWN_GROUP: {
      const { fields } = inputFactory;

      return (
        <Field
          id={id}
          key={id}
          required={required}
          status={error ? 'error' : undefined}
          extraText={error && extraTextInitialError}
          label={label}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              rowGap: '10px',
              columnGap: '20px',
            }}
          >
            {fields?.map((field) => {
              const formattedValue = getSelectValue(values?.[field.name]);

              return (
                <SearchSelect
                  key={field.id}
                  autoFocus={editFieldName === field.name}
                  error={error}
                  multiple={false}
                  extraText={error ? extraTextInitialError : undefined}
                  disabled={field.disabled}
                  required={field.required}
                  label={field.label}
                  options={field.options}
                  selectedValues={formattedValue}
                  name={`${field.name}`}
                  onChange={(_, selectedValue) => {
                    return onChange?.(field.name, {
                      type: field.type,
                      value: getSelectValues(selectedValue, field.options.options)[0],
                    });
                  }}
                />
              );
            })}
          </div>
        </Field>
      );
    }

    case INPUT_TYPE.PERCENT_GROUP: {
      const { fields } = inputFactory;

      const totalPercentage = calculateTotalPercentage(fields, values || {});

      const hasFilledFields = fields.some((field) => {
        const rawValue = values?.[field.name]?.value;
        return rawValue !== undefined && rawValue !== '';
      });

      const hasError = hasFilledFields && (totalPercentage > 100 || totalPercentage < 100);

      const errorMessage =
        totalPercentage > 100
          ? 'Сумма процентов не может превышать 100%'
          : totalPercentage < 100
          ? 'Сумма процентов не может быть меньше 100%'
          : undefined;

      return (
        <Field
          id={id}
          key={id}
          required={required}
          status={hasError ? 'error' : undefined}
          extraText={errorMessage}
          label={label}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              rowGap: '10px',
              columnGap: '20px',
            }}
          >
            {fields?.map((field) => {
              const fieldValue = getStringValue(values?.[field.name]);

              return (
                <InputField
                  key={field.id}
                  ref={ref}
                  autoFocus={editFieldName === field.name}
                  status={hasError ? 'error' : undefined}
                  disabled={field.disabled}
                  dimension="s"
                  placeholder="(%)"
                  required={field.required}
                  label={field.label}
                  value={fieldValue}
                  inputMode="numeric"
                  pattern="^(100|[1-9]?[0-9])$"
                  min={0}
                  max={100}
                  onChange={(e) =>
                    onChange?.(field.name, {
                      type: field.type,
                      value: e.target.value,
                    })
                  }
                />
              );
            })}
          </div>
        </Field>
      );
    }

    case INPUT_TYPE.STRING_GROUP: {
      const { fields } = inputFactory;

      return (
        <Field
          id={id}
          key={id}
          required={required}
          status={error ? 'error' : undefined}
          extraText={error && extraTextInitialError}
          label={label}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              rowGap: '10px',
              columnGap: '20px',
            }}
          >
            {fields?.map((field) => {
              const fieldValue = getStringValue(values?.[field.name]);

              return (
                <InputField
                  key={field.id}
                  ref={ref}
                  autoFocus={editFieldName === field.name}
                  status={error ? 'error' : undefined}
                  extraText={error && extraTextInitialError}
                  disabled={field.disabled}
                  dimension="s"
                  placeholder="Введите значение"
                  required={field.required}
                  label={field.label}
                  value={fieldValue}
                  onChange={(e) =>
                    onChange?.(field.name, {
                      type: field.type,
                      value: e.target.value,
                    })
                  }
                />
              );
            })}
          </div>
        </Field>
      );
    }

    case INPUT_TYPE.QUARTERLY_DATE_GROUP: {
      const { fields } = inputFactory;

      return (
        <Field
          id={id}
          key={id}
          required={required}
          status={error ? 'error' : undefined}
          extraText={error && 'Введите корректную дату в пределах квартала'}
          label={label}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            {fields.map((field) => {
              return (
                <InputFactoryDateField
                  key={field.id}
                  field={field}
                  values={values}
                  editFieldName={editFieldName}
                  onChange={onChange as any}
                  ref={ref}
                />
              );
            })}
          </div>
        </Field>
      );
    }

    case INPUT_TYPE.TEXT_AREA: {
      const { length, maxRows } = inputFactory;

      const formattedValue = getStringValue(value);

      const getExtraText = () => {
        if (error) {
          return extraTextInitialError;
        }

        if (requireConditions) {
          if (valueConditions) {
            return (
              <InputFactoryExtraText
                extraTextInitial={extraTextInitial}
                conditionText="Есть условия для заполнения"
              />
            );
          }

          return (
            <InputFactoryExtraText
              extraTextInitial={extraTextInitial}
              conditionText="Есть условия для обязательного заполнения"
            />
          );
        }

        if (valueConditions) {
          return (
            <InputFactoryExtraText
              extraTextInitial={extraTextInitial}
              conditionText="Есть условия для обязательного значения"
            />
          );
        }

        return null;
      };

      return (
        <TextField
          autoFocus={autoFocus}
          key={id}
          status={error ? 'error' : undefined}
          extraText={getExtraText()}
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
    case INPUT_TYPE.MULTI_SELECT: {
      const { options } = inputFactory;

      const formattedValue = getSelectValue(value);

      const getExtraText = () => {
        if (error) {
          return extraTextInitialError;
        }

        if (requireConditions) {
          if (valueConditions) {
            return (
              <InputFactoryExtraText
                extraTextInitial={extraTextInitial}
                conditionText="Есть условия для заполнения"
              />
            );
          }

          return (
            <InputFactoryExtraText
              extraTextInitial={extraTextInitial}
              conditionText="Есть условия для обязательного заполнения"
            />
          );
        }

        if (valueConditions) {
          return (
            <InputFactoryExtraText
              extraTextInitial={extraTextInitial}
              conditionText="Есть условия для обязательного значения"
            />
          );
        }

        return '';
      };

      return (
        <SearchSelect
          key={name}
          name={`${name}`}
          displayClearIcon
          error={error}
          multiple
          extraText={getExtraText()}
          disabled={disabled}
          autoFocus={autoFocus}
          required={required}
          label={label}
          options={options}
          selectedValues={formattedValue}
          onChange={(_, selectedValues) => {
            return onChange?.(name, {
              type,
              value: getSelectValues(selectedValues, options.options),
            });
          }}
        />
      );
    }
    case INPUT_TYPE.FLAG: {
      const formattedValue = getFlagValue(value);

      return (
        <Field
          key={id}
          required={required}
          status={error ? 'error' : undefined}
          extraText={error && extraTextInitialError}
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
      const { length } = inputFactory;

      const formattedValue = getStringValue(value);

      const getExtraText = () => {
        if (error) {
          return extraTextInitialError;
        }

        // If no conditions are set, don't show any extra text
        if (!requireConditions && !valueConditions) {
          return null;
        }

        let conditionText: string;

        // Determine the appropriate condition text based on the combination of flags
        if (requireConditions) {
          if (valueConditions) {
            // Both requireConditions and valueConditions are true
            conditionText = 'Есть условия для заполнения';
          } else {
            // Only requireConditions is true
            conditionText = 'Есть условия для обязательного заполнения';
          }
        } else {
          // Only valueConditions is true
          conditionText = 'Есть условия для обязательного значения';
        }

        return (
          <InputFactoryExtraText
            extraTextInitial={extraTextInitial}
            conditionText={conditionText}
          />
        );
      };

      return (
        <InputField
          ref={ref}
          status={error ? 'error' : undefined}
          extraText={getExtraText()}
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

    case INPUT_TYPE.RFD: {
      const formattedValue = getRFDValue(value);

      const getExtraText = () => {
        if (error) {
          return extraTextInitialError;
        }

        // If no conditions are set, don't show any extra text
        if (!requireConditions && !valueConditions) {
          return null;
        }

        let conditionText: string;

        // Determine the appropriate condition text based on the combination of flags
        if (requireConditions) {
          if (valueConditions) {
            // Both requireConditions and valueConditions are true
            conditionText = 'Есть условия для заполнения';
          } else {
            // Only requireConditions is true
            conditionText = 'Есть условия для обязательного заполнения';
          }
        } else {
          // Only valueConditions is true
          conditionText = 'Есть условия для обязательного значения';
        }

        return (
          <InputFactoryExtraText
            extraTextInitial={extraTextInitial}
            conditionText={conditionText}
          />
        );
      };

      return (
        <RFDInput
          id={id}
          label={label}
          value={formattedValue}
          onChange={(newValue) => onChange?.(name, { type, value: newValue })}
          disabled={disabled}
          required={required}
          error={error}
          autoFocus={autoFocus}
          extraText={getExtraText()}
        />
      );
    }

    case INPUT_TYPE.MODEL_RISK: {
      const formattedValue = getStringValue(value);

      return (
        <ModelRiskInput
          id={id}
          label={label}
          value={formattedValue || null}
          onChange={(newValue) => onChange?.(name, { type, value: newValue })}
          disabled={disabled}
          required={required}
          error={!!error}
        />
      );
    }

    default:
      return null;
  }
}

const InputFactory = React.memo(InputFactorySwitcher) as typeof InputFactorySwitcher;

export { InputFactory, InputFactoryI };

