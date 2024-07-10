import { Artifact, ArtifactApi, ArtifactEditApi, ArtifactType, ArtifactValue } from 'src/api/types';
import { SELECT_TYPE, SelectOption, SelectStringOptions } from 'src/components/SearchSelect/types';

import {
  CommonInputProps,
  INPUT_TYPE,
  InputFactoryProps,
  InputValue,
  MultiSelectInputValue,
  QuarterlyDateInput,
  SelectInputValue,
} from '../../../../components/InputFactory/types';

import { FORM_MODE, FormFields, FormFieldsSchema, FormValues } from './types';
import { ColumnsFilter, Row } from '../../TableModels/types';
import { initialColumns } from '../../constants';
import { ADDITIONAL_DAYS_OUT_QUARTER, ADD_NEW_MODEL_SCHEMA, MONTHS_IN_QUARTER } from './constants';
import { addMonths, format, isWithinInterval, subBusinessDays } from 'date-fns';
import { RIGHT_PANEL_TYPE } from '../../types';

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
const getEditFormFieldsSchema = (columnsFilters: Partial<ColumnsFilter>) => {
  const activeColumnsFiltersNames = Object.keys(columnsFilters);

  return initialColumns.reduce((columnsNames, column) => {
    if (activeColumnsFiltersNames.includes(column.name)) {
      const additionalFieldParams = ADD_NEW_MODEL_SCHEMA.find(({ name }) => name === column.name);

      return [
        ...columnsNames,
        {
          name: column.name,
          required: !!additionalFieldParams?.required,
          maxLength: additionalFieldParams?.maxLength,
        },
      ];
    }

    return columnsNames;
  }, [] as FormFieldsSchema);
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

const getDateLimits = (startDate: Date, quarter: number) => ({
  minDate: quarter ? addMonths(startDate, quarter * MONTHS_IN_QUARTER) : startDate,
  maxDate: addMonths(startDate, quarter * MONTHS_IN_QUARTER + MONTHS_IN_QUARTER),
});

const getDisabledStatus = (minDate: Date, maxDate: Date) =>
  !isWithinInterval(Date.now(), {
    start: minDate,
    end: subBusinessDays(maxDate, ADDITIONAL_DAYS_OUT_QUARTER),
  });

// Main mapping function that combine object for proper input format
const mapArtifactToField = (
  artifact: Artifact,
  required: boolean = false,
  maxLength?: number,
  activeRow?: Partial<Row>,
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

  const activeRowValue = activeRow?.[artifact?.artefact_tech_label];

  switch (artifact.artefact_type_desc) {
    case ArtifactType.BOOLEAN: {
      const type = INPUT_TYPE.FLAG;

      return {
        ...commonAttributes,
        initialValue: { type, value: activeRowValue === '1' },
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
        initialValue: getSelectInitialValue(options, activeRowValue),
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
        initialValue: getMultiSelectInitialValue(options, activeRowValue),
        options: {
          type: SELECT_TYPE.STRING,
          options,
        },
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
      const quarter = Number(artifact.artefact_tech_label[artifact.artefact_tech_label.length - 1]);
      // ****

      const { minDate, maxDate } = getDateLimits(startDate, quarter);
      const quarterDisabledStatus = getDisabledStatus(minDate, maxDate);

      return {
        ...commonAttributes,
        quarter,
        minDate,
        maxDate,
        disabled: quarterDisabledStatus,
        type,
        initialValue: formattedInitialValue
          ? {
              type,
              value: formattedInitialValue,
            }
          : undefined,
      };
    }
    case ArtifactType.DATE:
    case ArtifactType.DATE_ISO8601:
    case ArtifactType.CASE_DATE: {
      const type = INPUT_TYPE.DATE;

      let formattedInitialValue: Date | undefined;

      if (activeRowValue) {
        const date = new Date(activeRowValue);

        if (date.toString() !== 'Invalid Date') {
          formattedInitialValue = date;
        }
      }

      return {
        ...commonAttributes,
        type,
        initialValue: formattedInitialValue
          ? {
              type,
              value: formattedInitialValue,
            }
          : undefined,
      };
    }
    case ArtifactType.NUMBER: {
      const type = INPUT_TYPE.NUMBER;

      const validInitialValue = activeRowValue && !isNaN(Number(activeRowValue));

      return {
        ...commonAttributes,
        type: INPUT_TYPE.NUMBER,
        initialValue: validInitialValue ? { type, value: Number(activeRowValue) } : undefined,
      };
    }
    default: {
      const type = INPUT_TYPE.STRING;

      return {
        ...commonAttributes,
        type,
        initialValue: activeRowValue ? { type, value: activeRowValue } : undefined,
      };
    }
  }
};

const getFormSchema = ({
  formMode,
  columnsFilters,
}: {
  formMode: FORM_MODE;
  columnsFilters?: Partial<ColumnsFilter>;
}) => {
  if (formMode === FORM_MODE.ADD) {
    return ADD_NEW_MODEL_SCHEMA;
  }

  if (columnsFilters) {
    return getEditFormFieldsSchema(columnsFilters);
  }

  return [];
};

const getQuarterDateGroupField = (
  quarterDateFields: QuarterlyDateInput<keyof Row>[],
): InputFactoryProps<keyof Row> => {
  return {
    id: 'usage_confirm_date_group',
    name: 'usage_confirm_date_group',
    required: false,
    label: 'Модель используется заказчиком',
    type: INPUT_TYPE.QUARTERLY_DATE_GROUP,
    quartes: quarterDateFields,
  };
};

const getFormFields = ({
  formMode,
  artifacts,
  columnsFilters,
  initialRow,
}: {
  formMode: FORM_MODE;
  artifacts: Artifact[];
  columnsFilters?: Partial<ColumnsFilter>;
  initialRow?: Partial<Row>;
}) => {
  const formSchema = getFormSchema({ formMode, columnsFilters });

  const formFields = formSchema.reduce((fields, fieldSchema) => {
    const artifact = artifacts.find(
      ({ artefact_tech_label }) => artefact_tech_label === fieldSchema.name,
    );

    if (artifact) {
      let field = mapArtifactToField(
        artifact,
        fieldSchema?.required,
        fieldSchema?.maxLength,
        initialRow,
      );

      return [...fields, field];
    }

    return fields;
  }, [] as FormFields);

  // TODO: move it to prev reduce
  return formFields.reduce((fields, field) => {
    if (field.type === INPUT_TYPE.QUARTERLY_DATE) {
      // Skip prev quartes, wait for last one
      if (field.quarter === 4) {
        const quarterDateFields = formFields.filter(
          (field) => field.type === INPUT_TYPE.QUARTERLY_DATE,
        ) as QuarterlyDateInput<keyof Row>[];

        const newQuarterDateGroupField = getQuarterDateGroupField(quarterDateFields);

        return [...fields, newQuarterDateGroupField];
      }

      return fields;
    }

    return [...fields, field];
  }, [] as FormFields);
};

const getValuesFromParentModel = (fields: FormFields): FormValues =>
  fields.reduce((values, field) => {
    if (field.type !== INPUT_TYPE.QUARTERLY_DATE_GROUP && field.initialValue) {
      return {
        ...values,
        [field.name]: field.initialValue,
      };
    }

    return values;
  }, {} as FormValues);

const getNotValidFields = (
  values: FormValues,
  activeRow?: Partial<Row>,
  formMode?: FORM_MODE | null,
) =>
  ADD_NEW_MODEL_SCHEMA.filter(({ name, required }) => {
    if (!required) {
      return false;
    }

    const fieldInputValue = values[name];

    if (!fieldInputValue) {
      if (formMode === FORM_MODE.EDIT) {
        const initialValue = activeRow?.[name];

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

const getFormMode = (activePanelType: RIGHT_PANEL_TYPE) => {
  if (activePanelType === RIGHT_PANEL_TYPE.EDIT_MODEL) {
    return FORM_MODE.EDIT;
  }

  return FORM_MODE.ADD;
};

export {
  getFormMode,
  getFormFields,
  getNotValidFields,
  getArtifactApiItems,
  getParentModelOptions,
  getValuesFromParentModel,
};
