import { SelectStringOptions } from '@shared/ui/organisms';

import { format } from 'date-fns';

import {
  DateInputValue,
  FlagInputValue,
  INPUT_TYPE,
  InputValue,
  MultiSelectInputValue,
  NumberInputValue,
  QuarterlyDateInputValue,
  SelectInputValue,
  StringInputValue,
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

export const formatValuesForSelect = (selectValue?: SelectInputValue | MultiSelectInputValue) => {
  if (!selectValue) {
    return;
  }

  const { type, value } = selectValue;

  if (type === INPUT_TYPE.SELECT) {
    return value.id ? [value.id] : undefined;
  }

  if (type === INPUT_TYPE.MULTI_SELECT) {
    return value.length ? value.map(({ id }) => id) : undefined;
  }
};

export const getNumberValue = (value?: InputValue, initialValue?: NumberInputValue) => {
  if (!value) {
    return initialValue?.value;
  }

  if (value.type === INPUT_TYPE.NUMBER) {
    return value.value;
  }
};

export const getStringValue = (value?: InputValue, initialValue?: StringInputValue) => {
  if (!value) {
    return initialValue?.value;
  }

  if (value.type === INPUT_TYPE.STRING || value.type === INPUT_TYPE.TEXT_AREA) {
    return value.value;
  }
};

export const getDateValue = (
  value?: InputValue,
  initialValue?: DateInputValue | QuarterlyDateInputValue,
) => {
  let dateValue;

  if (!value && initialValue?.value) {
    dateValue = format(initialValue.value, 'dd.MM.yyyy');
  }

  if (
    value?.value &&
    (value.type === INPUT_TYPE.DATE || value.type === INPUT_TYPE.QUARTERLY_DATE)
  ) {
    dateValue = format(value.value, 'dd.MM.yyyy');
  }

  return dateValue;
};

export const getFlagValue = (value?: InputValue, initialValue?: FlagInputValue) => {
  if (!value) {
    return initialValue?.value;
  }

  if (value.type === INPUT_TYPE.FLAG) {
    return value.value;
  }
};

export const getSelectValue = (
  value?: InputValue,
  initialValue?: SelectInputValue | MultiSelectInputValue,
) => {
  if (!value) {
    return formatValuesForSelect(initialValue);
  }

  if (value.type === INPUT_TYPE.SELECT || value.type === INPUT_TYPE.MULTI_SELECT) {
    return formatValuesForSelect(value);
  }
};
