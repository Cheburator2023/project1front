import { SelectStringProps } from 'src/components/SearchSelect/types';

enum INPUT_TYPE {
  STRING = 'STRING',
  DATE = 'DATE',
  NUMBER = 'NUMBER',
  FLAG = 'FLAG',
  TEXT_AREA = 'TEXT_AREA',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
}

type SelectInputValue = {
  type: INPUT_TYPE.SELECT;
  value: {
    id: string;
    text: string;
  };
};

type MultiSelectInputValue = {
  type: INPUT_TYPE.MULTI_SELECT;
  value: {
    id: string;
    text: string;
  }[];
};

type NumberInputValue = {
  type: INPUT_TYPE.NUMBER;
  value: number;
};

type StringInputValue = {
  type: INPUT_TYPE.STRING | INPUT_TYPE.TEXT_AREA;
  value: string;
};

type FlagInputValue = {
  type: INPUT_TYPE.FLAG;
  value: boolean;
};

type DateInputValue = {
  type: INPUT_TYPE.DATE;
  value: Date;
};

type InputValue =
  | FlagInputValue
  | StringInputValue
  | NumberInputValue
  | MultiSelectInputValue
  | SelectInputValue
  | DateInputValue;

type CommonInputProps<T> = {
  id: string;
  label: string;
  name: T;
  required: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
};

type StringInput<T> = CommonInputProps<T> & {
  type: INPUT_TYPE.STRING;
  initialValue?: StringInputValue;
  length?: number;
};

type TextAreaInput<T> = CommonInputProps<T> & {
  type: INPUT_TYPE.TEXT_AREA;
  initialValue?: StringInputValue;
  length?: number;
  maxRows?: number;
};

type DateInput<T> = CommonInputProps<T> & {
  type: INPUT_TYPE.DATE;
  initialValue?: DateInputValue;
  minDate?: Date;
  maxDate?: Date;
};

type NumberInput<T> = CommonInputProps<T> & {
  type: INPUT_TYPE.NUMBER;
  initialValue?: NumberInputValue;
  suffix?: string;
  precision?: number;
  minValue?: number;
  maxValue?: number;
  displayPlusMinusIcons?: boolean;
};

type FlagInput<T> = CommonInputProps<T> & {
  type: INPUT_TYPE.FLAG;
  initialValue?: FlagInputValue;
};

type SelectInput<T> = CommonInputProps<T> & {
  type: INPUT_TYPE.SELECT;
  initialValue?: SelectInputValue;
  options: SelectStringProps;
  multiple: false;
};

type MultiSelectInput<T> = CommonInputProps<T> & {
  type: INPUT_TYPE.MULTI_SELECT;
  initialValue?: MultiSelectInputValue;
  options: SelectStringProps;
  multiple: true;
};

type InputFactoryProps<T> =
  | StringInput<T>
  | DateInput<T>
  | NumberInput<T>
  | FlagInput<T>
  | TextAreaInput<T>
  | SelectInput<T>
  | MultiSelectInput<T>;

export {
  INPUT_TYPE,
  CommonInputProps,
  InputValue,
  SelectInputValue,
  NumberInputValue,
  DateInputValue,
  StringInputValue,
  MultiSelectInputValue,
  FlagInputValue,
  StringInput,
  DateInput,
  NumberInput,
  FlagInput,
  TextAreaInput,
  SelectInput,
  MultiSelectInput,
  InputFactoryProps,
};
