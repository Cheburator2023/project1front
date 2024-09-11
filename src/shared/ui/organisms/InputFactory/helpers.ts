import { SelectStringOptions } from '@shared/ui/organisms';

import { format } from 'date-fns';

import {
  INPUT_TYPE,
  InputValue,
  MultiSelectInputValue,
  PercentInput,
  QuarterlyDropdownInputValue,
  SelectInputValue,
} from './types';

export const getSelectValues = (valueIds: string[], options: SelectStringOptions) =>
  options.reduce(
    (selectValues, option) => {
      const selectValue = valueIds.includes(option.value);

      if (selectValue) {
        return [
          ...selectValues,
          {
            id: option.value,
            text: option.text,
          },
        ];
      }

      return selectValues;
    },
    [] as {
      id: string;
      text: string;
    }[],
  );

export const formatValuesForSelect = (
  selectValue?: SelectInputValue | MultiSelectInputValue | QuarterlyDropdownInputValue,
) => {
  if (!selectValue || !selectValue.value) {
    return;
  }

  const { type, value } = selectValue;

  if (type === INPUT_TYPE.SELECT || type === INPUT_TYPE.QUARTERLY_DROPDOWN) {
    return value.id ? [value.id] : undefined;
  }

  if (type === INPUT_TYPE.MULTI_SELECT) {
    return value.length ? value.map(({ id }) => id) : undefined;
  }

  return;
};

export const getNumberValue = (value?: InputValue) => {
  if (value?.type === INPUT_TYPE.NUMBER) {
    return value.value;
  }
};

export const getStringValue = (value?: InputValue): string => {
  if (
    value?.type === INPUT_TYPE.STRING ||
    value?.type === INPUT_TYPE.TEXT_AREA ||
    value?.type === INPUT_TYPE.PERCENT
  ) {
    return value.value ?? '';
  }

  return '';
};

export const getDateValue = (value?: InputValue) => {
  if (
    value?.value &&
    (value.type === INPUT_TYPE.DATE || value.type === INPUT_TYPE.QUARTERLY_DATE)
  ) {
    return format(value.value, 'dd.MM.yyyy');
  }
};

export const getFlagValue = (value?: InputValue) => {
  if (value?.type === INPUT_TYPE.FLAG) {
    return value.value;
  }
};

export const getSelectValue = (value?: InputValue) => {
  if (
    value?.type === INPUT_TYPE.SELECT ||
    value?.type === INPUT_TYPE.MULTI_SELECT ||
    value?.type === INPUT_TYPE.QUARTERLY_DROPDOWN
  ) {
    return formatValuesForSelect(value);
  }
};
// TODO: refactoring
export const getFieldValueAsNumber = (rawValue: unknown): number => {
  if (typeof rawValue === 'string' || typeof rawValue === 'number') {
    const parsedValue = parseFloat(String(rawValue));
    return isNaN(parsedValue) ? 0 : parsedValue;
  }
  return 0;
};

export const calculateTotalPercentage = <T extends string>(
  fields: Array<PercentInput<T>>,
  values: Partial<Record<string, InputValue>>,
): number => {
  return fields.reduce((total, field) => {
    const rawValue = values?.[field.name]?.value || 0;
    const fieldValue = getFieldValueAsNumber(rawValue);

    return total + fieldValue;
  }, 0);
};
