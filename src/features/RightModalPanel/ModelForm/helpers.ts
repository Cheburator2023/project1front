import {
  addMonths,
  addYears,
  differenceInYears,
  format,
  isWithinInterval,
  startOfYear,
  subBusinessDays,
} from 'date-fns';

import { ArtifactType, type Artifact, type ArtifactApi, type ArtifactValue } from '@shared/api';
import { Row } from '@shared/types';
import { initialColumns, RIGHT_PANEL_TYPE, MODEL_FORM_MODE } from '@shared/constants';
import {
  CommonInputProps,
  INPUT_TYPE,
  InputFactoryProps,
  InputValue,
  MultiSelectInputValue,
  SelectInputValue,
  SELECT_TYPE,
  SelectOption,
  SelectStringOptions,
  QuarterlyDropdownInputValue,
} from '@shared/ui/organisms';

import {
  FormFieldConditions,
  FormFieldValueConditions,
  FormFields,
  FormFieldsSchema,
  FormValues,
} from './types';

import { BASE_MODEL_SCHEMA } from './constants';
import { ArtifactGroup } from '@src/shared/api/types';
const getInputValuesFromRow = (artifacts: Artifact[], activeRow: Partial<Row> = {}): FormValues =>
  Object.entries(activeRow).reduce((inputValues, rowItem) => {
    const [name, rowValue] = rowItem as [keyof Row, string];

    const artifact = artifacts.find((artifact) => artifact.artefact_tech_label === name);

    if (artifact) {
      const inputValue = getInputValue(artifact, rowValue);

      return {
        ...inputValues,
        [name]: inputValue,
      };
    }

    return inputValues;
  }, {});

const getInputValue = (artifact: Artifact, rowValue: string) => {
  switch (artifact.artefact_type_desc) {
    case ArtifactType.BOOLEAN: {
      const type = INPUT_TYPE.FLAG;

      return { type, value: rowValue === '1' };
    }
    case ArtifactType.QUARTERLY_DROPDOWN:
    case ArtifactType.DROPDOWN: {
      const options = getSelectOptions(artifact.values);

      return getSelectInitialValue(options, rowValue);
    }
    case ArtifactType.MULTI_DROPDOWN: {
      const options = getSelectOptions(artifact.values);

      return getMultiSelectInitialValue(options, rowValue);
    }
    case ArtifactType.QUARTERLY_DATE: {
      const type = INPUT_TYPE.QUARTERLY_DATE;

      let formattedInitialValue: Date | undefined;

      if (rowValue) {
        const date = new Date(rowValue);

        if (date.toString() !== 'Invalid Date') {
          formattedInitialValue = date;
        }
      }

      return formattedInitialValue
        ? {
            type,
            value: formattedInitialValue,
          }
        : undefined;
    }
    case ArtifactType.DATE:
    case ArtifactType.DATE_ISO8601:
    case ArtifactType.CASE_DATE: {
      const type = INPUT_TYPE.DATE;

      let formattedInitialValue: Date | undefined;

      if (rowValue) {
        const date = new Date(rowValue);

        if (date.toString() !== 'Invalid Date') {
          formattedInitialValue = date;
        }
      }

      return formattedInitialValue
        ? {
            type,
            value: formattedInitialValue,
          }
        : undefined;
    }
    case ArtifactType.NUMBER: {
      const type = INPUT_TYPE.NUMBER;

      const validInitialValue = rowValue && !isNaN(Number(rowValue));

      return validInitialValue ? { type, value: Number(rowValue) } : undefined;
    }
    case ArtifactType.PERCENTAGE: {
      const type = INPUT_TYPE.PERCENT;

      return rowValue ? { type, value: rowValue } : undefined;
    }
    default: {
      const type = INPUT_TYPE.STRING;

      return rowValue ? { type, value: rowValue } : undefined;
    }
  }
};

// A set of functions that help with the conversion of artifacts values for selected options
const getArtifactValueByValueId = (
  artifactValues: ArtifactValue[],
  artifactParentValueId: number,
) => artifactValues.find(({ artefact_value_id }) => artefact_value_id === artifactParentValueId);

const getParentsChildrenValues = (artifactValues: ArtifactValue[]) =>
  artifactValues.reduce((parentsChildrenValues, currentArtifactValue) => {
    if (currentArtifactValue?.artefact_parent_value_id) {
      const currentParentValue = getArtifactValueByValueId(
        artifactValues,
        currentArtifactValue.artefact_parent_value_id,
      )?.artefact_value;

      if (currentParentValue) {
        const currentParentChildrenValues = parentsChildrenValues?.[currentParentValue] ?? [];

        return {
          ...parentsChildrenValues,
          [currentParentValue]: [
            ...currentParentChildrenValues,
            currentArtifactValue.artefact_value,
          ],
        };
      }
    }

    return parentsChildrenValues;
  }, {} as Record<string, string[]>);

const getParentsValues = (
  artifactValues: ArtifactValue[],
  artefactParentValueId?: number | null,
  parentValues: string[] = [],
): string[] => {
  if (artefactParentValueId) {
    const parentValue = getArtifactValueByValueId(artifactValues, artefactParentValueId);

    if (parentValue) {
      return getParentsValues(artifactValues, parentValue?.artefact_parent_value_id, [
        parentValue.artefact_value,
        ...parentValues,
      ]);
    }

    return parentValues;
  }

  return parentValues;
};

const sortSelectOptions = (selectOptions: SelectOption[]) => {
  const sortedSelectOptions = selectOptions.sort(
    (a, b) => (a.parentsValues?.length || 0) - (b.parentsValues?.length || 0),
  );

  return sortedSelectOptions.reduce((prevValue, option) => {
    if (option.parentsValues?.length) {
      const parentOptionValueId = option.parentsValues[option.parentsValues.length - 1];

      const parentOptionIndex = prevValue.findIndex(({ text }) => text === parentOptionValueId);

      const newPrevValue = [...prevValue];
      newPrevValue.splice(parentOptionIndex + 1, 0, option);

      return newPrevValue;
    }

    return [...prevValue, option];
  }, [] as SelectOption[]);
};

const getSelectOptions = (artifactValues: ArtifactValue[]) => {
  const parentsChildrenValues = getParentsChildrenValues(artifactValues);

  const selectOptions = artifactValues.map(
    ({ artefact_value, artefact_value_id, artefact_parent_value_id }) => ({
      text: artefact_value,
      value: artefact_value_id.toString(),
      parentsValues: getParentsValues(artifactValues, artefact_parent_value_id),
      nestedValues: parentsChildrenValues?.[artefact_value],
    }),
  );

  return sortSelectOptions(selectOptions);
};

const getSelectInitialValue = (
  options: SelectOption[],
  initialValue?: string | null,
): SelectInputValue | undefined => {
  if (!initialValue) {
    return;
  }

  const initialOption = options.find((option) => option.text === initialValue);

  if (!initialOption) {
    return;
  }

  return {
    type: INPUT_TYPE.SELECT,
    value: {
      id: initialOption.value,
      text: initialOption.text,
    },
  };
};

const getMultiSelectInitialValue = (
  options: SelectOption[],
  initialValue?: string | null,
): MultiSelectInputValue | undefined => {
  if (!initialValue) {
    return;
  }

  const initialTextsList = initialValue.split(',').map((text) => text.trim());
  const initialOptions = options.filter((option) => initialTextsList.includes(option.text));

  if (!initialOptions.length) {
    return;
  }

  return {
    type: INPUT_TYPE.MULTI_SELECT,
    value: initialOptions.map((option) => ({
      id: option.value,
      text: option.text,
    })),
  };
};

const getDateLimits = (startDate: Date, quarter: number) => {
  const firstDateOfCurrentYear = startOfYear(startDate); // Начало года

  // Минимальная дата — первый день квартала
  const minDate = addMonths(firstDateOfCurrentYear, (quarter - 1) * 3);

  // Максимальная дата — последний день квартала
  const maxDate = addMonths(minDate, 3);
  const lastDayOfQuarter = subBusinessDays(maxDate, 1); // Последний день квартала

  return {
    minDate,
    maxDate: lastDayOfQuarter,
  };
};

export const getStartDateInCurrentYear = (startDate: Date) => {
  const yearsFromStartDate = differenceInYears(Date.now(), startDate);

  if (yearsFromStartDate) {
    return addYears(startDate, yearsFromStartDate);
  }

  return startDate;
};

const getDisabledStatus = (minDate: Date, maxDate: Date) => {
  return !isWithinInterval(Date.now(), {
    start: minDate,
    end: maxDate,
  });
};

// Main mapping function that combine object for proper input format
const mapArtifactToField = (
  artifact: Artifact,
  fieldSchema?: FormFieldsSchema[number],
  activeRow?: Partial<Row>,
): InputFactoryProps<keyof Row> => {
  const commonAttributes: CommonInputProps<keyof Row> = {
    id: artifact.artefact_id.toString(),
    name: artifact.artefact_tech_label,
    label: artifact.artefact_label,
    required: !!fieldSchema?.required,
    maxLength: fieldSchema?.maxLength,
    requireConditions: fieldSchema?.requireConditions,
    valueConditions: fieldSchema?.valueConditions,
    disabled: artifact.is_edit_flg === '0',
    placeholder: artifact.artefact_desc ? artifact.artefact_desc : undefined,
    group: artifact.group,
  };

  const activeRowValue = activeRow?.[artifact?.artefact_tech_label];

  switch (artifact.artefact_type_desc) {
    case ArtifactType.BOOLEAN: {
      const type = INPUT_TYPE.FLAG;

      return {
        ...commonAttributes,
        type,
      };
    }
    case ArtifactType.DROPDOWN: {
      const type = INPUT_TYPE.SELECT;

      return {
        ...commonAttributes,
        type,
        multiple: false,
        options: {
          type: SELECT_TYPE.STRING,
          options: getSelectOptions(artifact.values),
        },
      };
    }

    case ArtifactType.QUARTERLY_DROPDOWN: {
      const type = INPUT_TYPE.QUARTERLY_DROPDOWN;

      let startDate = new Date();

      // Получение стартовой даты
      if (artifact?.start_date_depend_artefact && activeRow) {
        const artifactStartDateValue = activeRow[artifact.start_date_depend_artefact];

        if (artifactStartDateValue) {
          const date = new Date(artifactStartDateValue);

          if (date.toString() !== 'Invalid Date') {
            startDate = date;
          }
        }
      }

      // Получение номера квартала из tech_label
      const fields = Number(artifact.artefact_tech_label[artifact.artefact_tech_label.length - 1]);

      // Вычисление минимальной и максимальной даты для квартала
      const { minDate, maxDate } = getDateLimits(startDate, fields);
      const quarterDisabledStatus = getDisabledStatus(minDate, maxDate);

      return {
        ...commonAttributes,
        type,
        multiple: false,
        disabled: quarterDisabledStatus,
        options: {
          type: SELECT_TYPE.STRING,
          options: getSelectOptions(artifact.values),
        },
      };
    }

    case ArtifactType.MULTI_DROPDOWN: {
      const type = INPUT_TYPE.MULTI_SELECT;

      return {
        ...commonAttributes,
        type,
        multiple: true,
        options: {
          type: SELECT_TYPE.STRING,
          options: getSelectOptions(artifact.values),
        },
      };
    }

    case ArtifactType.PERCENTAGE: {
      const type = INPUT_TYPE.PERCENT;

      return {
        ...commonAttributes,
        type,
      };
    }

    case ArtifactType.QUARTERLY_DATE: {
      const type = INPUT_TYPE.QUARTERLY_DATE;

      let formattedInitialValue: Date | undefined;
      let startDate = new Date();

      // Get start date helper ****
      if (artifact?.start_date_depend_artefact && activeRow) {
        const artifactStartDateValue = activeRow[artifact.start_date_depend_artefact];

        if (artifactStartDateValue) {
          const date = new Date(artifactStartDateValue);

          if (date.toString() !== 'Invalid Date') {
            startDate = date;
          }
        }
      }
      // ****

      // Get formatted initial value helper ****
      if (activeRowValue) {
        const date = new Date(activeRowValue);

        if (date.toString() !== 'Invalid Date') {
          formattedInitialValue = date;
        }
      }
      // ****

      // Get quarter number by tech label helper ****
      const fields = Number(artifact.artefact_tech_label[artifact.artefact_tech_label.length - 1]);
      // ****

      const { minDate, maxDate } = getDateLimits(startDate, fields);
      const quarterDisabledStatus = getDisabledStatus(minDate, maxDate);

      return {
        ...commonAttributes,
        fields,
        minDate,
        maxDate,
        disabled: quarterDisabledStatus,
        type,
      };
    }
    case ArtifactType.DATE:
    case ArtifactType.DATE_ISO8601:
    case ArtifactType.CASE_DATE: {
      return {
        ...commonAttributes,
        type: INPUT_TYPE.DATE,
      };
    }
    case ArtifactType.NUMBER: {
      return {
        ...commonAttributes,
        type: INPUT_TYPE.NUMBER,
      };
    }

    default: {
      return {
        ...commonAttributes,
        type: INPUT_TYPE.STRING,
      };
    }
  }
};

const getGroupField = (
  fields: InputFactoryProps<keyof Row>[],
  groupLabel: string,
  groupType: INPUT_TYPE,
): any => {
  return {
    id: `${groupLabel}_group`,
    name: `${groupLabel}_group`,
    label: groupLabel,
    type: groupType,
    fields: fields,
  };
};

// Функция для фильтрации полей по группе
const getGroupedFields = (fields: FormFields, groupLabel: string): FormFields => {
  return fields.filter((field) => field.group === groupLabel);
};

// Функция для получения типа группы
const getGroupType = (group: ArtifactGroup): INPUT_TYPE => {
  switch (group) {
    case ArtifactGroup.CONFIRMATION_DATE:
      return INPUT_TYPE.QUARTERLY_DATE_GROUP;
    case ArtifactGroup.CUSTOMER_USAGE:
      return INPUT_TYPE.QUARTERLY_DROPDOWN_GROUP;
    case ArtifactGroup.ALLOCATION_COMMENT:
      return INPUT_TYPE.STRING_GROUP;
    case ArtifactGroup.ALLOCATION_USAGE:
      return INPUT_TYPE.PERCENT_GROUP;
    default:
      return INPUT_TYPE.STRING;
  }
};

// Функция для создания нового группового поля
const createNewGroupField = (
  formFields: FormFields,
  groupLabel: string,
  groupType: INPUT_TYPE,
): InputFactoryProps<keyof Row> => {
  const groupedFields = getGroupedFields(formFields, groupLabel);
  return getGroupField(groupedFields, groupLabel, groupType);
};

// Функция для получения имени группы
const getGroupLabel = (field: InputFactoryProps<keyof Row>): string => {
  return field.group || '';
};

// Основная функция для генерации полей формы
const getFormFields = ({
  artifacts,
  initialRow,
  mode,
  activeFormSchema,
}: {
  artifacts: Artifact[];
  activeFormSchema: FormFieldsSchema;
  mode: MODEL_FORM_MODE;
  initialRow?: Partial<Row>;
}) => {
  const fieldsNamesToGenerate =
    mode === MODEL_FORM_MODE.ADD
      ? BASE_MODEL_SCHEMA.map(({ name }) => name)
      : initialColumns.map(({ name }) => name);

  // Генерация полей
  const formFields = fieldsNamesToGenerate.reduce((fields, fieldName) => {
    const artifact = artifacts.find(({ artefact_tech_label }) => artefact_tech_label === fieldName);
    const fieldSchema = activeFormSchema.find(({ name }) => name === fieldName);

    if (artifact) {
      const field = mapArtifactToField(artifact, fieldSchema, initialRow);
      return [...fields, field];
    }

    return fields;
  }, [] as FormFields);

  // Используем Set для отслеживания созданных групп
  const createdGroups = new Set<string>();

  // Генерация финального списка полей с группами
  const finalFormFields = formFields.reduce((fields, field) => {
    const groupLabel = getGroupLabel(field);

    // Если поле принадлежит группе и эта группа еще не создана
    if (field.group && !createdGroups.has(groupLabel)) {
      const groupType = getGroupType(field.group as ArtifactGroup);
      const newGroupField = createNewGroupField(formFields, groupLabel, groupType);
      createdGroups.add(groupLabel);
      return [...fields, newGroupField];
    }

    // Если поле принадлежит группе, которая уже создана — пропускаем его
    if (field.group && createdGroups.has(groupLabel)) {
      return fields;
    }

    // Добавляем поле, если оно не принадлежит группе
    return [...fields, field];
  }, [] as FormFields);

  return finalFormFields;
};

const getFormValue = (value?: InputValue) => {
  switch (value?.type) {
    case INPUT_TYPE.SELECT: {
      return value.value?.text;
    }
    case INPUT_TYPE.MULTI_SELECT: {
      return value.value.map(({ text }) => text);
    }
    default: {
      return value?.value?.toString() || '';
    }
  }
};

const compareValues = (value1: string | string[], value2: string) => {
  if (Array.isArray(value1)) {
    return value1.includes(value2);
  }

  return value1 === value2;
};

const checkForSatisfyConditions = (conditionsList: FormFieldConditions, values?: FormValues) =>
  conditionsList.some((conditions) => {
    const conditionsList = Object.entries(conditions);

    const satisfyConditionsNumber = conditionsList.filter((condition) => {
      const [name, conditionValue] = condition as [keyof Row, string];

      const formValueToCheck = getFormValue(values?.[name]);

      return compareValues(formValueToCheck, conditionValue);
    }).length;

    return conditionsList.length === satisfyConditionsNumber;
  });

const checkRequireStatus = (
  values?: FormValues,
  required?: boolean,
  requireConditions?: FormFieldConditions,
) => {
  if (required) {
    return true;
  }

  if (requireConditions) {
    return checkForSatisfyConditions(requireConditions, values);
  }

  return false;
};

// Check for require specific value
const checkRequireValueStatus = (
  values?: FormValues,
  valueConditions?: FormFieldValueConditions,
) => {
  if (valueConditions) {
    for (let index = 0; index < valueConditions.length; index++) {
      const currentCondition = valueConditions[index];

      if (checkForSatisfyConditions(currentCondition.conditions, values)) {
        return currentCondition.value;
      }
    }
  }
};

const getInvalidFields = (activeFormSchema: FormFieldsSchema, values?: FormValues) =>
  activeFormSchema
    .filter(({ name, required, requireConditions, valueConditions }) => {
      const formValue = getFormValue(values?.[name]);

      const requiredField = checkRequireStatus(values, required, requireConditions);

      if (requiredField) {
        if (!formValue) {
          return true;
        }
      }

      const valueToCompare = checkRequireValueStatus(values, valueConditions);

      if (valueToCompare && !compareValues(formValue, valueToCompare)) {
        return true;
      }

      return false;
    })
    .map(({ name }) => name);

const getProperFormatValueForSubmit = (inputValue: InputValue) => {
  const { type, value } = inputValue;

  switch (type) {
    case INPUT_TYPE.DATE:
    case INPUT_TYPE.QUARTERLY_DATE:
      return {
        artefact_string_value: value ? format(value, 'dd.MM.yyyy') : '',
        artefact_value_id: null,
      };
    case INPUT_TYPE.FLAG:
      return {
        artefact_string_value: value ? '1' : '0',
        artefact_value_id: null,
      };
    case INPUT_TYPE.SELECT:
      return {
        artefact_string_value: value.text,
        artefact_value_id: Number(value.id),
      };
    case INPUT_TYPE.QUARTERLY_DROPDOWN:
      return {
        artefact_string_value: value.text,
        artefact_value_id: Number(value.id),
      };
    case INPUT_TYPE.MULTI_SELECT:
      return value.map(({ id, text }) => ({
        artefact_string_value: text,
        artefact_value_id: Number(id),
      }));
    default:
      return {
        artefact_string_value: String(value),
        artefact_value_id: null,
      };
  }
};

const getArtifactApiItems = (values?: FormValues, parentModelId?: string) => {
  const artifactApiItems = Object.entries(values ?? {}).reduce((bodyItems, [fieldName, value]) => {
    if (!value) {
      return bodyItems;
    }

    const content = getProperFormatValueForSubmit(value);

    if (Array.isArray(content)) {
      return [
        ...bodyItems,
        ...content.map((item) => ({
          artefact_tech_label: fieldName,
          ...item,
        })),
      ];
    }

    return [
      ...bodyItems,
      {
        artefact_tech_label: fieldName,
        ...content,
      },
    ];
  }, [] as ArtifactApi[]);

  if (parentModelId) {
    return [
      ...artifactApiItems,
      {
        artefact_tech_label: 'parent_model_id',
        artefact_string_value: parentModelId,
        artefact_value_id: null,
      },
    ];
  }

  return artifactApiItems;
};

const getParentModelOptions = (rows: Partial<Row>[]) =>
  rows.reduce((options, row) => {
    const { system_model_id, model_name, model_source } = row;
    if (system_model_id && model_name && model_source === 'sum-rm') {
      return [
        ...options,
        {
          value: system_model_id,
          text: model_name,
        },
      ];
    }

    return options;
  }, [] as SelectStringOptions);

const getFormMode = (activePanelType: RIGHT_PANEL_TYPE) => {
  if (activePanelType === RIGHT_PANEL_TYPE.EDIT_MODEL) {
    return MODEL_FORM_MODE.EDIT;
  }

  return MODEL_FORM_MODE.ADD;
};

export {
  getFormMode,
  getFormFields,
  getInvalidFields,
  getArtifactApiItems,
  getParentModelOptions,
  getInputValuesFromRow,
};
