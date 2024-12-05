import { SELECT_TYPE, SelectOption, SelectStringProps } from '@shared/ui/organisms';
import {
  FormFieldConditions,
  FormFieldValueConditions,
  OptionConditionsType,
} from '@src/features/RightModalPanel/ModelForm';

enum INPUT_TYPE {
  STRING = 'STRING',
  STRING_GROUP = 'STRING_GROUP',
  DATE = 'DATE',
  QUARTERLY_DATE = 'QUARTERLY_DATE',
  QUARTERLY_DATE_GROUP = 'QUARTERLY_DATE_GROUP',
  PERCENT = 'PERCENT',
  PERCENT_GROUP = 'PERCENT_GROUP',
  QUARTERLY_DROPDOWN = 'QUARTERLY_DROPDOWN',
  QUARTERLY_DROPDOWN_GROUP = 'QUARTERLY_DROPDOWN_GROUP',
  NUMBER = 'NUMBER',
  FLAG = 'FLAG',
  TEXT_AREA = 'TEXT_AREA',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
}

type SelectInputValue = {
  type: INPUT_TYPE.SELECT;
  value?:
    | {
        id: string;
        text: string;
      }
    | {
        id: string;
        text: string;
      }[];
  values?: {
    id: string;
    text: string;
  }[];
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

type StringGroupInputValue = {
  type: INPUT_TYPE.STRING_GROUP;
  value: StringInputValue[];
};

type PercentInputValue = {
  type: INPUT_TYPE.PERCENT;
  value: string | null;
};

type QuarterlyPercentGroupInputValue = {
  type: INPUT_TYPE.PERCENT_GROUP;
  value: PercentInputValue[];
};

type QuarterlyDropdownInputValue = {
  type: INPUT_TYPE.QUARTERLY_DROPDOWN;
  value: {
    id: string;
    text: string;
  };
};

type QuarterlyDropdownGroupInputValue = {
  type: INPUT_TYPE.QUARTERLY_DROPDOWN_GROUP;
  value: QuarterlyDropdownInputValue[];
};

type InputValue =
  | FlagInputValue
  | StringInputValue
  | NumberInputValue
  | MultiSelectInputValue
  | SelectInputValue
  | DateInputValue
  | QuarterlyDateInputValue
  | QuarterlyDateGroupInputValue
  | PercentInputValue
  | QuarterlyPercentGroupInputValue
  | QuarterlyDateGroupInputValue
  | StringGroupInputValue
  | QuarterlyDropdownInputValue
  | QuarterlyDropdownGroupInputValue;

type CommonInputProps<T extends string> = {
  id: string;
  label: string;
  name: T;
  required: boolean;
  requireConditions?: FormFieldConditions | string[]; // TODO: fix imports (not allow FSD import rules)
  valueConditions?: FormFieldValueConditions; // TODO: fix imports (not allow FSD import rules)
  optionConditions?: OptionConditionsType[];
  autoCompleteConditions?: FormFieldValueConditions;
  disabledConditions?: FormFieldConditions | string[];
  enabledByValueConditions?: FormFieldValueConditions;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  group?: string;
  schemaKey?: string;
  schemaOrder?: number;
};

type StringInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.STRING;
  length?: number;
};

type TextAreaInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.TEXT_AREA;
  length?: number;
  maxRows?: number;
};

type DateInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.DATE;
  minDate?: Date;
  maxDate?: Date;
};

type QuarterlyDropdwonInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.QUARTERLY_DROPDOWN;
  options: {
    type: SELECT_TYPE.STRING;
    options: SelectOption[];
  };
  multiple: false;
};

type QuarterlyDropdwonGroupInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.QUARTERLY_DROPDOWN_GROUP;
  fields: Array<QuarterlyDropdwonInput<T>>;
};

type PercentInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.PERCENT;
};

type PercentGroupInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.PERCENT_GROUP;
  fields: Array<PercentInput<T>>;
};

type StringGroupInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.STRING_GROUP;
  fields: Array<StringInput<T>>;
};

type QuarterlyDateInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.QUARTERLY_DATE;
  fields: number;
  minDate?: Date;
  maxDate?: Date;
};

type QuarterlyDateGroupInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.QUARTERLY_DATE_GROUP;
  fields: Array<QuarterlyDateInput<T>>;
};

type NumberInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.NUMBER;
  suffix?: string;
  precision?: number;
  minValue?: number;
  maxValue?: number;
  displayPlusMinusIcons?: boolean;
};

type FlagInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.FLAG;
};

type SelectInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.SELECT;
  options: SelectStringProps;
  multiple: false;
};

type MultiSelectInput<T extends string> = CommonInputProps<T> & {
  type: INPUT_TYPE.MULTI_SELECT;
  options: SelectStringProps;
  multiple: true;
};

type InputFactoryProps<T extends string> =
  | StringInput<T>
  | DateInput<T>
  | QuarterlyDateInput<T>
  | QuarterlyDateGroupInput<T>
  | StringGroupInput<T>
  | PercentInput<T>
  | PercentGroupInput<T>
  | QuarterlyDropdwonInput<T>
  | QuarterlyDropdwonGroupInput<T>
  | NumberInput<T>
  | FlagInput<T>
  | TextAreaInput<T>
  | SelectInput<T>
  | MultiSelectInput<T>;

// TODO: refactor
type GroupFieldProps<T extends string> = {
  id: `${T}_group`;
  name: `${T}_group`;
  required: boolean;
  label: string;
  type: INPUT_TYPE;
  fields: InputFactoryProps<T>[];
};

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
  QuarterlyDropdownGroupInputValue,
  QuarterlyDropdownInputValue,
  QuarterlyDropdwonGroupInput,
  QuarterlyDropdwonInput,
  QuarterlyDateGroupInputValue,
  PercentInputValue,
  QuarterlyPercentGroupInputValue,
  StringGroupInputValue,
  QuarterlyDateInputValue,
  QuarterlyDateGroupInput,
  QuarterlyDateInput,
  NumberInput,
  FlagInput,
  PercentInput,
  TextAreaInput,
  SelectInput,
  MultiSelectInput,
  InputFactoryProps,
};
