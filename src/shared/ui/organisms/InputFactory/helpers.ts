import { SelectStringOptions } from '@shared/ui/organisms';

import { format } from 'date-fns';

import {
  INPUT_TYPE,
  InputValue,
  MultiSelectInputValue,
  NumberInputValue,
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

export const formatValuesForSelect = (selectValue?: SelectInputValue | MultiSelectInputValue) => {
  if (!selectValue) {
    return;
  }

  const { type, value } = selectValue;

  if (type === INPUT_TYPE.SELECT) {
    return value?.id ? [value.id] : undefined;
  }

  if (type === INPUT_TYPE.MULTI_SELECT) {
    return value.length ? value.map(({ id }) => id) : undefined;
  }
};

export const getNumberValue = (value?: InputValue, initialValue?: NumberInputValue) => {
  if (value?.type === INPUT_TYPE.NUMBER) {
    return value.value;
  }
};

export const getStringValue = (value?: InputValue) => {
  if (value?.type === INPUT_TYPE.STRING || value?.type === INPUT_TYPE.TEXT_AREA) {
    return value.value;
  }
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
  if (value?.type === INPUT_TYPE.SELECT || value?.type === INPUT_TYPE.MULTI_SELECT) {
    return formatValuesForSelect(value);
  }
};
