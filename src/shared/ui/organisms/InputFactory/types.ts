import { SelectStringProps } from '@shared/ui/organisms';

enum INPUT_TYPE {
  STRING = 'STRING',
  DATE = 'DATE',
  QUARTERLY_DATE = 'QUARTERLY_DATE',
  QUARTERLY_DATE_GROUP = 'QUARTERLY_DATE_GROUP',
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
  value: Date | null;
};

type QuarterlyDateInputValue = {
  type: INPUT_TYPE.QUARTERLY_DATE;
  value: Date | null;
};

type QuarterlyDateGroupInputValue = {
  type: INPUT_TYPE.QUARTERLY_DATE_GROUP;
  value: QuarterlyDateInputValue[];
};

type InputValue =
  | FlagInputValue
  | StringInputValue
  | NumberInputValue
  | MultiSelectInputValue
  | SelectInputValue
  | DateInputValue
  | QuarterlyDateInputValue
  | QuarterlyDateGroupInputValue;

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

type QuarterlyDateInput<T> = CommonInputProps<T> & {
  type: INPUT_TYPE.QUARTERLY_DATE;
  quarter: number;
  initialValue?: QuarterlyDateInputValue;
  minDate?: Date;
  maxDate?: Date;
};

type QuarterlyDateGroupInput<T> = CommonInputProps<T> & {
  type: INPUT_TYPE.QUARTERLY_DATE_GROUP;
  quartes: Array<QuarterlyDateInput<T>>;
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
  | QuarterlyDateInput<T>
  | QuarterlyDateGroupInput<T>
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
  QuarterlyDateInputValue,
  QuarterlyDateGroupInputValue,
  StringInputValue,
  MultiSelectInputValue,
  FlagInputValue,
  StringInput,
  DateInput,
  QuarterlyDateInput,
  QuarterlyDateGroupInput,
  NumberInput,
  FlagInput,
  TextAreaInput,
  SelectInput,
  MultiSelectInput,
  InputFactoryProps,
};
