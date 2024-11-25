/* eslint-disable array-callback-return */
/* eslint-disable no-unneeded-ternary */
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button, CheckboxField, T } from '@admiral-ds/react-ui';
import { format } from 'date-fns';

import { Row } from '@shared/types';
import { StatusScreen } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE, MODEL_FORM_MODE } from '@shared/constants';
import { INPUT_TYPE, InputFactory, InputValue, RightPanel } from '@shared/ui/organisms';
import { API_ROUTES, useFetch, ArtifactApi, ModelEditApi } from '@shared/api';

import { filter, groupBy, isEqual, omit, pick } from 'lodash';
import { Flexbox, Spacer } from '@shared/ui/atoms';
import { Artifact, CustomError } from '@shared/api/types';

import { useAppInjectStore } from '@shared/stores/appInjectStore';
import { CUSTOMER_MAP } from '@shared/constants/customers';
import { useScrollTo } from '@src/shared/hooks/useScrollTo';
import { useDeepEffect } from '@src/shared/hooks/useDeepEffect';
import { FormFieldConditions, FormValues } from './types';
import {
  getFormMode,
  getArtifactApiItems,
  getInvalidFields,
  getInputValuesFromRow,
  getProperFormatValueForSubmit,
  checkRequireValueStatus,
} from './helpers';
import { ButtonContainer, FormContainer } from './styles';
import { ParentModelSelect } from './ParentModelSelect';
import { useActiveFormSchema } from './useActiveFormSchema';
import { useFormFields } from './useFormFields';
import { ACTIVE_MODEL_SCHEMA, ALLOCATION_FIELDS_NAMES, SCHEMA_NAME_MAP } from './constants';
import { ModelFormDotMenu } from './ModelFormDotMenu';

type SubmitType = { checkOnly?: boolean };

export interface ModelFormProps {
  mode: RIGHT_PANEL_TYPE.ADD_MODEL | RIGHT_PANEL_TYPE.EDIT_MODEL;
  artifacts: Artifact[];
  editCellName?: keyof Row;
  rows: Partial<Row>[];
  activeRow?: Partial<Row>;
  // TODO: check this types
  onSubmit: (newRow: CustomError | Row | ArtifactApi[], formMode: MODEL_FORM_MODE) => void;
  onClose: () => void;
}

export const ModelForm = ({
  mode,
  rows,
  artifacts,
  editCellName,
  activeRow,
  onSubmit,
  onClose,
}: ModelFormProps) => {
  const { mutationProtectedFetch } = useFetch({});
  const formMode = getFormMode(mode);
  const { setCurrentCustomer, currentCustomer } = useAppInjectStore();

  const [values, setValues] = useState<FormValues | undefined>();
  const [invalidFields, setInvalidFields] = useState<Array<keyof Row>>([]);
  const [dirtyFields, setDirtyFields] = useState<Array<keyof Row>>([]);
  const [parentModelId, setParentModelId] = useState<string>();
  const [selectedColSize, setSelectedColSize] = useState<string>('2');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [initialRow, setInitialRow] = useState(activeRow);
  const [expandedPanel, setExpandPanel] = useState(true);
  const [showAllFields, setShowAllFields] = useState(false);
  const [activeModelByDefault, setActiveModelByDefault] = useState<boolean | undefined>(undefined);
  const [completesConditionField, setCompletesConditionField] = useState<
    { connectedName: string; connectedValue: string } | undefined
  >(undefined);

  const errorElemRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const scrollToActiveError = useScrollTo(errorElemRef, formRef);

  const wasPreviouslyActiveModel = activeRow?.active_model === '1';

  const { formSchema } = useActiveFormSchema({
    values,
    initialRow,
    mode: formMode,
    activeModelByDefault,
  });

  const { fields } = useFormFields({
    formSchema,
    values,
    mode: formMode,
    initialRow,
    artifacts,
    showAllFields,
    currentCustomer,
    activeModelByDefault,
    wasPreviouslyActiveModel,
  });

  const IS_FORM_MODE_ADD = formMode === MODEL_FORM_MODE.ADD;
  const title = IS_FORM_MODE_ADD ? 'Новая модель' : 'Редактирование модели';
  const groupedBySchemaName = groupBy(fields, 'schemaKey');

  const handleChange = (name: keyof Row, value: InputValue) => {
    const newValues = { [name]: value };
    const connectedValues: any = {};
    const connectedValuesToContitions: any = {};

    formSchema.map(({ valueConditions, name: connectedName }) => {
      if (valueConditions?.length === 1) {
        const conditions = valueConditions[0].conditions;
        const connectedValue = valueConditions[0].value;
        conditions?.map((condition) => {
          Object.keys(condition).map((fieldName) => {
            // @ts-ignore
            const formFieldValue = values?.[fieldName as any]?.value?.text;

            if (fieldName === name || formFieldValue) {
              // @ts-ignore
              connectedValues[fieldName] =
                // @ts-ignore
                fieldName === name ? value : values?.[fieldName as any];

              connectedValuesToContitions[fieldName] =
                // @ts-ignore
                fieldName === name ? value?.value?.text : formFieldValue;
            }
          });
        });

        const completesCondition = isEqual([connectedValuesToContitions], conditions);

        if (completesCondition && connectedName !== name) {
          setCompletesConditionField({ connectedName, connectedValue });
        } else {
          const fieldToReset = formSchema.find((_field) => {
            return JSON.stringify(_field.valueConditions?.[0].conditions)?.includes(name);
          });

          setValues((prevValues) => ({
            ...omit(prevValues, fieldToReset?.name as any),
          }));

          setCompletesConditionField(undefined);
        }
      }
      return false;
    });

    setDirtyFields((prevDirtyFields) => [...prevDirtyFields, name]);

    setValues((prevValues) => ({ ...prevValues, ...newValues }));
  };

  useDeepEffect(() => {
    setTimeout(() => {
      if (completesConditionField?.connectedName) {
        let autoCompletedField = {};

        const connectedField = fields.find((_field) => {
          return _field.name === completesConditionField?.connectedName;
        });

        const artifact = artifacts.find(
          (_artifact) => _artifact.artefact_tech_label === completesConditionField?.connectedName,
        );
        const connectedArtifactOption = artifact?.values?.find(
          (option) => option.artefact_value === completesConditionField?.connectedValue,
        );

        if (
          !connectedField?.disabled &&
          connectedArtifactOption?.artefact_value === completesConditionField?.connectedValue
        ) {
          autoCompletedField = {
            [completesConditionField.connectedName]: {
              type: connectedField?.type,
              value: {
                id: `${connectedArtifactOption?.artefact_value_id}`,
                text: `${connectedArtifactOption?.artefact_value}`,
              },
            },
          };
          setValues((prevValues) => ({ ...prevValues, ...autoCompletedField }));
        }
        if (connectedField?.disabled) {
          setValues((prevValues) => ({
            ...omit(prevValues, completesConditionField?.connectedName),
          }));
        }
      }
    }, 300);
  }, [completesConditionField, fields]);

  // TODO: Temporary solution to solve the problem of editing allocations in models that do not have all required fields. This is a technical debt that needs to be fixed.
  /**
   * Check if any of the allocation fields have been changed.
   * @returns {boolean} true if any allocation field has been changed, false otherwise.
   */
  const checkForAllocationFieldsChanged = () =>
    ALLOCATION_FIELDS_NAMES.some((fieldName) => {
      const initialValue = initialRow?.[fieldName] ?? '';
      const newInputValue = values?.[fieldName];

      if (!newInputValue) {
        return false;
      }

      let newStringValue = '';

      if (
        newInputValue.type === INPUT_TYPE.DATE ||
        newInputValue.type === INPUT_TYPE.QUARTERLY_DATE
      ) {
        if (!newInputValue.value) {
          return false;
        }

        newStringValue = format(newInputValue.value, 'yyyy-MM-dd');
      } else {
        const formattedValue = getProperFormatValueForSubmit(newInputValue);

        if (!Array.isArray(formattedValue) && formattedValue.artefact_string_value) {
          newStringValue = formattedValue.artefact_string_value;
        }
      }

      return initialValue !== newStringValue;
    });

  const handleSubmit = useCallback(
    async ({ checkOnly = false }: SubmitType) => {
      const valuesWithAddedOutsideControls: FormValues = {
        ...values,
        active_model: {
          type: INPUT_TYPE.FLAG,
          value: activeModelByDefault || false,
        },
      };
      const newInvalidFields = getInvalidFields(
        formSchema,
        valuesWithAddedOutsideControls,
        wasPreviouslyActiveModel,
      );
      const isAllocationFieldsChanged = checkForAllocationFieldsChanged();
      setInvalidFields(isAllocationFieldsChanged ? [] : newInvalidFields);
      scrollToActiveError();
      setDirtyFields((prevDirtyFields) => [...prevDirtyFields, fields[0].name]);

      if (newInvalidFields.length && !isAllocationFieldsChanged) {
        return;
      }

      const artifactApiItems = getArtifactApiItems(valuesWithAddedOutsideControls, parentModelId);
      // TODO: check this types
      let newRow: CustomError | Row | ArtifactApi[] | undefined;

      setSubmitLoading(checkOnly ? false : true);

      if (!IS_FORM_MODE_ADD && initialRow && !checkOnly) {
        const { system_model_id, model_source } = initialRow;

        if (system_model_id && model_source) {
          // TODO: fix response type and structure and input type ModelEditApi[]
          const res: any = await mutationProtectedFetch<ModelEditApi[], { data: { cards: Row[] } }>(
            {
              body: [
                {
                  model_id: system_model_id,
                  artefacts: artifactApiItems,
                  model_source,
                },
              ],
              fetchApiRoute: API_ROUTES.MODELS_EDIT,
              fetchMethod: 'PUT',
            },
          );

          if (!res || res.error) {
            setSubmitError('Произошла ошибка при обновлении модели');
            return;
          }

          if (res?.data?.data?.cards && res.data.data.cards[0]) {
            newRow = res.data.data.cards[0];
          }
        }
      }

      if (IS_FORM_MODE_ADD && !checkOnly) {
        const res = await mutationProtectedFetch<ArtifactApi[], Row>({
          body: artifactApiItems,
          fetchApiRoute: API_ROUTES.MODEL_ADD,
          fetchMethod: 'POST',
        });

        if (!res || res.error) {
          setSubmitError('Произошла ошибка при добавлении модели');
          return;
        }

        newRow = res.data;
      }

      if (newRow && formMode) {
        onSubmit(newRow, formMode);
        setSubmitLoading(false);
        setSubmitError('');
      }
    },
    [values, formSchema, formMode, activeModelByDefault],
  );

  const handleChangeParentModel = useCallback(
    (_, selectedValue: string[]) => {
      const selectedModelId = selectedValue[0];

      const parentModel = rows.find((row) => row.system_model_id === selectedModelId);

      if (parentModel) {
        setInitialRow(parentModel);
        setParentModelId(selectedModelId);
      }
    },
    [rows, artifacts],
  );

  const setSelectedColSizeHandler = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedColSize(e.target.value);
  };

  const handleOnClose = useCallback(() => {
    setValues({});
    setInvalidFields([]);
    setParentModelId(undefined);

    onClose();
  }, [onClose]);

  const activeModelCheckboxHandler = async (e: any) => {
    setActiveModelByDefault(e?.target?.checked);
    setCurrentCustomer(CUSTOMER_MAP.UMRV);

    await handleSubmit({ checkOnly: true });
  };

  useEffect(() => {
    const initialValues = getInputValuesFromRow(artifacts, initialRow);

    setValues(initialValues);
  }, [initialRow, artifacts]);

  useEffect(() => {
    if (activeRow?.active_model === '1') {
      setActiveModelByDefault(true);
    }
  }, [activeRow?.active_model]);

  // Scroll to edit input field
  useEffect(() => {
    if (formRef.current?.children && editCellName) {
      const editedFieldIndex = fields.findIndex((field) => field.name === editCellName);

      if (editedFieldIndex !== -1) {
        formRef.current.children[editedFieldIndex]?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCellName, formRef.current]);

  useEffect(() => {
    if (dirtyFields.length) {
      const newInvalidFields = getInvalidFields(formSchema, values, wasPreviouslyActiveModel);
      setInvalidFields(newInvalidFields);
    }
  }, [values, dirtyFields, formSchema, wasPreviouslyActiveModel]);

  return (
    <RightPanel
      title={title}
      showPanel
      headerRightTitleContent={
        <ModelFormDotMenu
          expandedPanel={expandedPanel}
          selectedColSize={selectedColSize}
          setSelectedColSizeHandler={setSelectedColSizeHandler}
          showAllFields={showAllFields}
          setShowAllFields={setShowAllFields}
        />
      }
      onClose={handleOnClose}
      expanded={expandedPanel}
      onExpanded={() => setExpandPanel(!expandedPanel)}
      header={
        <Flexbox flexDirection="column">
          <Flexbox width="100%" justifyContent="space-between" alignItems="center">
            {IS_FORM_MODE_ADD && (
              <ParentModelSelect
                rows={rows}
                selectedModel={parentModelId}
                onSelectParentModel={handleChangeParentModel}
              />
            )}
          </Flexbox>
          <Spacer />
          <Flexbox width="100%" justifyContent="space-between" alignItems="center">
            <CheckboxField
              id="activeModelByDefault_checkbox"
              dimension="s"
              checked={activeModelByDefault}
              onChange={activeModelCheckboxHandler}
            >
              Действующая Модель/Модуль
            </CheckboxField>
          </Flexbox>
        </Flexbox>
      }
      body={
        <StatusScreen
          loadingLabel="Данные сохраняются..."
          successLabel="Успешно сохранено"
          error={submitError}
          apiLoading={submitLoading}
          onFinished={handleOnClose}
        >
          <FormContainer ref={formRef}>
            {Object.keys(groupedBySchemaName).map((schemaKey) => {
              const fieldsByGroup = groupedBySchemaName[schemaKey || 'Аллокация'];
              const schemaTitle = SCHEMA_NAME_MAP[schemaKey]?.title;

              return (
                <div key={schemaKey}>
                  <T font="Subtitle/Subtitle 2">{schemaTitle || 'Аллокация'}</T>
                  <Spacer />
                  <Flexbox wrap="wrap" gap={20}>
                    {fieldsByGroup.map((field) => {
                      return (
                        <Flexbox
                          flexBasis={
                            expandedPanel
                              ? `calc(${100 / Number(selectedColSize)}% - 20px)`
                              : '100%'
                          }
                          width={
                            expandedPanel
                              ? `calc(${100 / Number(selectedColSize)}% - 20px)`
                              : '100%'
                          }
                          fillChild
                          key={field.name}
                          ref={errorElemRef}
                        >
                          <InputFactory<keyof Row>
                            values={values}
                            onChange={handleChange}
                            inputFactory={field as any}
                            editFieldName={editCellName}
                            error={invalidFields.includes(field.name)}
                            artifacts={artifacts}
                          />
                        </Flexbox>
                      );
                    })}
                  </Flexbox>
                </div>
              );
            })}
          </FormContainer>
        </StatusScreen>
      }
      footer={
        <>
          <T font="Caption/Caption 1" color="Neutral/Neutral 50" as="div">
            <span style={{ color: '#D92020' }}>*</span> Поля обязательные для сохранения
          </T>
          <ButtonContainer>
            <Button
              dimension="s"
              onClick={() => handleSubmit({ checkOnly: false })}
              value="Submit"
              type="submit"
            >
              Сохранить
            </Button>
            <Button
              dimension="s"
              onClick={handleOnClose}
              appearance="secondary"
              value="Submit"
              type="submit"
            >
              Отменить
            </Button>
          </ButtonContainer>
        </>
      }
    />
  );
};
