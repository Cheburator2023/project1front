import { Artifact, ArtifactApi, ArtifactEditApi, ArtifactType, ArtifactValue } from 'src/api/types';
import { SELECT_TYPE, SelectOption, SelectStringOptions } from 'src/components/SearchSelect/types';

import {
  CommonInputProps,
  INPUT_TYPE,
  InputFactoryProps,
  InputValue,
  MultiSelectInput,
  MultiSelectInputValue,
  SelectInputValue,
} from '../InputFactory/types';

import { FormFields, FormValues } from './types';
import { ColumnsFilter, Row } from '../../TableModels/types';
import { initialColumns } from '../../constants';
import { ADD_NEW_MODEL_SCHEMA } from './constants';
import { format, isValid } from 'date-fns';
import { TABLE_ACTION } from '../../types';

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

// Map initial columns to active columns filters to get filtered and ordered column name list
const getSortedColumnsNames = (columnsFilters: Partial<ColumnsFilter>) => {
  const activeColumnsFiltersNames = Object.keys(columnsFilters);

  return initialColumns.reduce((columnsNames, column) => {
    if (activeColumnsFiltersNames.includes(column.name)) {
      return [...columnsNames, column.name];
    }

    return columnsNames;
  }, [] as string[]);
};

const getSelectInitialValue = (
  options: SelectOption[],
  initialValue?: string,
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
  initialValue?: string,
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

// Main mapping function that combine object for proper input format
const mapArtifactToField = (
  artifact: Artifact,
  required: boolean = false,
  maxLength?: number,
  initialValue?: string,
): InputFactoryProps<keyof Row> => {
  const commonAttributes: CommonInputProps<keyof Row> = {
    id: artifact.artefact_id.toString(),
    name: artifact.artefact_tech_label,
    label: artifact.artefact_label,
    required,
    maxLength,
    disabled: artifact.is_edit_flg === '0',
    placeholder: artifact.artefact_desc ? artifact.artefact_desc : undefined,
  };

  switch (artifact.artefact_type_desc) {
    case ArtifactType.BOOLEAN: {
      const type = INPUT_TYPE.FLAG;

      return {
        ...commonAttributes,
        initialValue: { type, value: initialValue === '1' },
        type,
      };
    }
    case ArtifactType.DROPDOWN: {
      const type = INPUT_TYPE.SELECT;

      const options = getSelectOptions(artifact.values);

      return {
        ...commonAttributes,
        type,
        multiple: false,
        initialValue: getSelectInitialValue(options, initialValue),
        options: {
          type: SELECT_TYPE.STRING,
          options: getSelectOptions(artifact.values),
        },
      };
    }
    case ArtifactType.MULTI_DROPDOWN: {
      const type = INPUT_TYPE.MULTI_SELECT;

      const options = getSelectOptions(artifact.values);
      return {
        ...commonAttributes,
        type,
        multiple: true,
        initialValue: getMultiSelectInitialValue(options, initialValue),
        options: {
          type: SELECT_TYPE.STRING,
          options,
        },
      };
    }
    case ArtifactType.DATE:
    case ArtifactType.DATE_ISO8601:
    case ArtifactType.CASE_DATE: {
      const type = INPUT_TYPE.DATE;

      const validInitialValue = initialValue && isValid(initialValue);

      return {
        ...commonAttributes,
        type,
        initialValue: validInitialValue
          ? {
              type,
              value: new Date(initialValue),
            }
          : undefined,
      };
    }
    case ArtifactType.NUMBER: {
      const type = INPUT_TYPE.NUMBER;

      const validInitialValue = initialValue && !isNaN(Number(initialValue));

      return {
        ...commonAttributes,
        type: INPUT_TYPE.NUMBER,
        initialValue: validInitialValue ? { type, value: Number(initialValue) } : undefined,
      };
    }
    default: {
      const type = INPUT_TYPE.STRING;

      return {
        ...commonAttributes,
        type,
        initialValue: initialValue ? { type, value: initialValue } : undefined,
      };
    }
  }
};

const getEditModelFormFields = (
  artifacts: Artifact[],
  columnsFilters: Partial<ColumnsFilter>,
  initialValues?: Partial<Row>,
) => {
  const sortedColumnsNames = getSortedColumnsNames(columnsFilters);

  return sortedColumnsNames.reduce((fields, columnName) => {
    const artifact = artifacts.find(
      ({ artefact_tech_label }) => artefact_tech_label === columnName,
    );

    const additionalFieldParams = ADD_NEW_MODEL_SCHEMA.find(({ name }) => name === columnName);

    if (artifact) {
      const initialValue = initialValues?.[artifact?.artefact_tech_label];

      const field = mapArtifactToField(
        artifact,
        additionalFieldParams?.required,
        additionalFieldParams?.maxLength,
        initialValue,
      );

      return [...fields, field];
    }

    return fields;
  }, [] as FormFields);
};

const getAddModelFormFields = (artifacts: Artifact[], parentModel?: Partial<Row>) =>
  ADD_NEW_MODEL_SCHEMA.reduce((fields, item) => {
    const artifact = artifacts.find((artifact) => artifact.artefact_tech_label === item.name);

    if (artifact) {
      const parentValue = parentModel?.[artifact.artefact_tech_label];

      const field = mapArtifactToField(artifact, item.required, item.maxLength, parentValue);

      return [...fields, field];
    }

    return fields;
  }, [] as FormFields);

const getValuesFromParentModel = (fields: FormFields): FormValues =>
  fields.reduce((values, field) => {
    if (field.initialValue) {
      return {
        ...values,
        [field.name]: field.initialValue,
      };
    }

    return values;
  }, {} as FormValues);

const geInitialValues = (fields: FormFields) =>
  fields.reduce((prevValue, field) => {
    if (field?.initialValue) {
      return {
        ...prevValue,
        [field.name]: field.initialValue,
      };
    }

    return prevValue;
  }, {});

const getNotValidFields = (
  values: FormValues,
  initialValues?: Partial<Row>,
  mode?: TABLE_ACTION | null,
) =>
  ADD_NEW_MODEL_SCHEMA.filter(({ name, required }) => {
    if (!required) {
      return false;
    }

    const fieldInputValue = values[name];

    if (!fieldInputValue) {
      if (mode === TABLE_ACTION.EDIT) {
        const initialValue = initialValues?.[name];

        if (initialValue) {
          return false;
        }
      }

      return true;
    }

    if (fieldInputValue.type === INPUT_TYPE.SELECT) {
      return !fieldInputValue.value;
    }

    if (fieldInputValue.type === INPUT_TYPE.MULTI_SELECT) {
      return !fieldInputValue.value.length;
    }

    if (fieldInputValue.type === INPUT_TYPE.STRING) {
      return !fieldInputValue.value;
    }

    return fieldInputValue.value === undefined;
  }).map(({ name }) => name);

const getProperFormatValueForSubmit = (inputValue: InputValue) => {
  const { type, value } = inputValue;

  switch (type) {
    case INPUT_TYPE.DATE:
      return {
        artefact_string_value: format(value, 'dd.MM.YYYY'),
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

const getArtifactApiItems = (values: FormValues, parentModelId?: string) => {
  const artifactApiItems = Object.entries(values).reduce((bodyItems, [fieldName, value]) => {
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

export {
  geInitialValues,
  getEditModelFormFields,
  getAddModelFormFields,
  getNotValidFields,
  getArtifactApiItems,
  getParentModelOptions,
  getValuesFromParentModel,
};
