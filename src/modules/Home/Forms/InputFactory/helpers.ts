import { SELECT_TYPE, SelectStringOptions } from 'src/components/SearchSelect/types';
import {
  DateInputValue,
  FlagInputValue,
  INPUT_TYPE,
  InputValue,
  MultiSelectInputValue,
  NumberInputValue,
  SelectInputValue,
  StringInputValue,
} from './types';

const getValueIdsByValueText = (values: string[], options: SelectStringOptions) =>
  values.reduce((valueIds, valueText) => {
    const valueId = options.find((option) => option.text === valueText)?.value;

    if (valueId) {
      return [...valueIds, valueId];
    }

    return valueIds;
  }, [] as string[]);

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

export const getDateValue = (value?: InputValue, initialValue?: DateInputValue) => {
  if (!value) {
    return initialValue?.value;
  }

  if (value.type === INPUT_TYPE.DATE) {
    return value.value;
  }
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
