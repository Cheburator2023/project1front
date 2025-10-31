/* eslint-disable array-callback-return */
/* eslint-disable no-unneeded-ternary */
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button, CheckboxField, T } from '@admiral-ds/react-ui';
import { format } from 'date-fns';

import { Row } from '@shared/types';
import { StatusScreen } from '@shared/ui/molecules';
import { MODEL_FORM_MODE, initialColumns } from '@shared/constants';
import { INPUT_TYPE, InputFactory, InputValue, RightPanel } from '@shared/ui/organisms';
import { ArtifactApi, ModelEditApi } from '@shared/api';
import {
  useModelsControllerUpdateModels,
  useModelsControllerCreateModel,
  useModelsControllerGetModels,
} from '@shared/api/generated/endpoints';
import { usePermissions, useRoles } from '@src/shared/hooks';

import { groupBy, isEqual, omit, sortBy, uniqBy } from 'lodash';
import { Flexbox, Spacer } from '@shared/ui/atoms';
import { Artifact, ModelsResponseType } from '@shared/api/types';

import { useGlobalStore } from '@shared/stores/globalStore';
import { useScrollTo } from '@src/shared/hooks/useScrollTo';
import { useDeepEffect } from '@src/shared/hooks/useDeepEffect';
import { useQueryClient } from '@tanstack/react-query';
import { FormValues } from '../types';
import {
  getFormMode,
  getArtifactApiItems,
  getInvalidFields,
  getInputValuesFromRow,
  getProperFormatValueForSubmit,
} from '../helpers';
import { ButtonContainer, FormContainer } from './styles';
import { ParentModelSelect } from './ParentModelSelect';
import { useActiveFormSchema } from './useActiveFormSchema';
import { useFormFields } from './useFormFields';
import { ALLOCATION_FIELDS_NAMES_USAGE, SCHEMA_NAME_MAP } from './constants';
import { ModelFormDotMenu } from './ModelFormDotMenu';
import { useModelsStore } from '../../../shared/stores';

type SubmitType = { checkOnly?: boolean };

export interface ModelFormProps {
  mode: 'add' | 'edit';
  artifacts: Artifact[];
  editCellName?: keyof Row;
  rows: Partial<Row>[];
  activeRow?: Partial<Row>;
  // TODO: check this types
  onSubmit: (newRow?: Row, formMode?: MODEL_FORM_MODE) => void;
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
  const { setRows, modelsParams, refetchModels } = useModelsStore();

  const updateModelsMutation: any = useModelsControllerUpdateModels();
  const createModelMutation: any = useModelsControllerCreateModel();
  const { data: _modelsData } = useModelsControllerGetModels(modelsParams, {
    query: { enabled: false },
  });

  const modelsData = _modelsData as ModelsResponseType | undefined;

  const isUpdateLoading = updateModelsMutation.isPending;
  const isCreateLoading = createModelMutation.isPending;
  const isUpdateError = updateModelsMutation.isError;
  const isCreateError = createModelMutation.isError;
  const isUpdateSuccess = updateModelsMutation.isSuccess;
  const isCreateSuccess = createModelMutation.isSuccess;
  const formMode = getFormMode(mode);
  const { currentCustomer } = useGlobalStore();
  const { isEditAllocationEnabled } = usePermissions();
  const queryClient = useQueryClient();

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
  const [completesConditionFields, setCompletesConditionField] = useState<
    { connectedName: string; connectedValue: string }[] | undefined
  >(undefined);

  const {
    isValidator,
    isValidatorLead,
    isBusinessCustomer,
    isDs,
    isDe,
    isDsLead,
    isBICCustomerBroker,
    isDeLead,
    isModelOps,
    isModelOpsLead,
    isMIPM,
  } = useRoles();

  const isEditByRatingModel = isValidator || isValidatorLead || isBusinessCustomer;
  const hasNoAccessToActiveModel =
    isValidator || isValidatorLead || isBusinessCustomer
      ? false
      : isDs ||
        isDsLead ||
        isModelOps ||
        isModelOpsLead ||
        isMIPM ||
        isDe ||
        isDeLead ||
        isBICCustomerBroker;

  const errorElemRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const scrollToActiveError = useScrollTo(errorElemRef, formRef);

  const wasPreviouslyActiveModel = activeRow?.active_model === '1';

  const { formSchema } = useActiveFormSchema({
    values,
    initialRow,
    mode: formMode,
    activeModelByDefault:
      hasNoAccessToActiveModel && formMode === MODEL_FORM_MODE.EDIT
        ? wasPreviouslyActiveModel
        : activeModelByDefault,
  });

  const { fields } = useFormFields({
    formSchema,
    values,
    mode: formMode,
    initialRow,
    artifacts,
    showAllFields,
    currentCustomer,
  });

  const IS_FORM_MODE_ADD = formMode === MODEL_FORM_MODE.ADD;
  const title = IS_FORM_MODE_ADD ? 'Новая модель' : 'Редактирование модели';

  const groupedFieldsBySchemaName = groupBy(fields, 'schemaKey');

  const handleChange = (name: keyof Row, value: InputValue) => {
    const newValues = { [name]: value };
    const connectedValues: any = {};
    const connectedValuesToContitions: any = {};

    // TODO: refactor this
    formSchema.map(({ valueConditions, name: connectedName }) => {
      valueConditions?.map((valueCondition) => {
        const conditions = valueCondition.conditions;
        const connectedValue = valueCondition.value;

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
          setCompletesConditionField(
            uniqBy(
              [...(completesConditionFields || []), { connectedName, connectedValue }],
              'connectedName',
            ),
          );
        } else {
          formSchema.find((_field) => {
            _field.valueConditions?.map((_valueCondition) => {
              const isFieldResetable = JSON.stringify(_valueCondition.conditions)?.includes(name);

              if (isFieldResetable) {
                setValues((prevValues) => ({
                  ...omit(prevValues, _field?.name as any),
                }));
              }
            });
          });

          setCompletesConditionField(undefined);
        }
      });

      return false;
    });

    // TODO: refactor this
    formSchema.find((_field) => {
      if (_field.name === name) {
        const autoCompleteConditions = _field.autoCompleteConditions;

        autoCompleteConditions?.map((autoCompleteCondition) => {
          // @ts-ignore
          if (value?.value?.text === autoCompleteCondition.value) {
            autoCompleteCondition.conditions?.map((condition) => {
              Object.keys(condition).map((fieldName) => {
                // setValues((prevValues) => ({ ...prevValues, ...newValues }));

                setCompletesConditionField(
                  uniqBy(
                    [
                      ...(completesConditionFields || []),
                      { connectedName: fieldName, connectedValue: condition[fieldName] },
                    ],
                    'connectedName',
                  ),
                );
              });
            });
          }
        });
      }
    });

    setDirtyFields((prevDirtyFields) => [...prevDirtyFields, name]);

    setValues((prevValues) => ({ ...prevValues, ...newValues }));
  };

  useDeepEffect(() => {
    setTimeout(() => {
      completesConditionFields?.map((completesConditionField) => {
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
      });
    }, 100);
  }, [completesConditionFields, fields]);

  const checkAllocationFieldsChanged = () => {
    const fieldsChanged = ALLOCATION_FIELDS_NAMES_USAGE.some((fieldName) => {
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

    const totalPercentage = ALLOCATION_FIELDS_NAMES_USAGE.reduce((acc, fieldName) => {
      const field = values?.[fieldName];
      const num = field ? parseFloat(String(field.value)) : 0;
      return acc + (Number.isNaN(num) ? 0 : num);
    }, 0);

    const hasFilled = ALLOCATION_FIELDS_NAMES_USAGE.some((fieldName) => {
      const field = values?.[fieldName];
      return field && field.value !== undefined && field.value !== '';
    });

    const sumValid = !hasFilled || totalPercentage === 100;

    return { fieldsChanged, sumValid };
  };

  const handleSubmit = useCallback(
    async ({ checkOnly = false }: SubmitType) => {
      const valuesWithAddedOutsideControls = {
        ...values,
        active_model: {
          type: INPUT_TYPE.FLAG,
          value: hasNoAccessToActiveModel
            ? wasPreviouslyActiveModel
            : activeModelByDefault || false,
        },
      };

      const newInvalidFields = getInvalidFields(
        formSchema,
        valuesWithAddedOutsideControls as any,
        wasPreviouslyActiveModel,
        fields,
      );

      const { fieldsChanged, sumValid } = checkAllocationFieldsChanged();

      if (fieldsChanged && !sumValid) {
        console.log(
          '📝 FORM LOGS: ~ sumValid: OUT 1 fieldsChanged / !sumValid',
          fieldsChanged,
          sumValid,
        );
        return;
      }

      setInvalidFields(fieldsChanged ? [] : newInvalidFields);
      scrollToActiveError();
      setDirtyFields((prevDirtyFields) => [...prevDirtyFields, fields[0].name]);

      console.log('📝 FORM LOGS: >> newInvalidFields:', newInvalidFields);

      if (newInvalidFields.length && !fieldsChanged) {
        console.log(
          '📝 FORM LOGS: ~ sumValid: OUT 2 !fieldsChanged / newInvalidFields > 0',
          fieldsChanged,
          newInvalidFields,
        );
        return;
      }

      const artifactApiItems = getArtifactApiItems(
        valuesWithAddedOutsideControls as any,
        parentModelId,
      );

      // TODO: check this type
      let newRow: Row | undefined;

      if (!checkOnly) {
        setSubmitLoading(true);
      }

      if (!IS_FORM_MODE_ADD && initialRow && !checkOnly) {
        const { system_model_id, model_source } = initialRow;
        console.log('📝 FORM LOGS: ~ system_model_id:', system_model_id);
        console.log('📝 FORM LOGS: ~ model_source:', model_source);
        console.log('📝 FORM LOGS: ~ sent artifacts:', artifactApiItems);
        console.log(
          '📝 FORM LOGS: ~ sent valuesWithAddedOutsideControls:',
          valuesWithAddedOutsideControls,
        );

        if (system_model_id && model_source) {
          updateModelsMutation.mutate({
            data: [
              {
                model_id: system_model_id,
                artefacts: artifactApiItems as any,
                model_source,
              } as any,
            ],
          });
        }
      }

      if (IS_FORM_MODE_ADD && !checkOnly) {
        createModelMutation.mutate({
          data: artifactApiItems as any,
        });
      }
    },
    [values, formSchema, formMode, activeModelByDefault, hasNoAccessToActiveModel, fields],
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

    await handleSubmit({ checkOnly: true });
  };

  useEffect(() => {
    const initialValues = getInputValuesFromRow(artifacts, initialRow);

    setValues(initialValues);
  }, [initialRow, artifacts]);

  useEffect(() => {
    setSubmitLoading(isUpdateLoading || isCreateLoading);
  }, [isUpdateLoading, isCreateLoading]);

  useEffect(() => {
    if (isUpdateError) {
      setSubmitError('Произошла ошибка при обновлении модели');
      setSubmitLoading(false);
    }
  }, [isUpdateError]);

  useEffect(() => {
    if (isCreateError) {
      setSubmitError('Произошла ошибка при добавлении модели');
      setSubmitLoading(false);
    }
  }, [isCreateError]);

  useEffect(() => {
    if (isUpdateSuccess && updateModelsMutation.data) {
      const newRow = updateModelsMutation.data as Row;
      console.log('📝 FORM LOGS: ~ newRow:', newRow);

      const getModelsAndSubmit = async () => {
        refetchModels?.();

        if (formMode) {
          onSubmit(newRow, formMode);
          setSubmitLoading(false);
          setSubmitError('');
        }
      };

      getModelsAndSubmit();
    }
  }, [isUpdateSuccess, updateModelsMutation.data, formMode, onSubmit]);

  useEffect(() => {
    const refetchModelsEffect = async () => {
      if (isCreateSuccess && createModelMutation.data) {
        const newRow = createModelMutation.data as Row;

        refetchModels?.();

        if (formMode) {
          onSubmit(newRow, formMode);
          setSubmitLoading(false);
          setSubmitError('');
        }
      }
    };
    refetchModelsEffect();
  }, [isCreateSuccess, createModelMutation.data, formMode, onSubmit]);

  useEffect(() => {
    if (!hasNoAccessToActiveModel) {
      if (!isEditByRatingModel) {
        setActiveModelByDefault(false);
        return;
      }

      if (activeRow?.active_model === '1') {
        setActiveModelByDefault(true);
      }
    }
  }, [activeRow?.active_model, isEditByRatingModel, hasNoAccessToActiveModel]);

  // Scroll to edit input field
  useEffect(() => {
    if (formRef.current?.children && editCellName) {
      const inputFieldsRefs = document.querySelectorAll(
        '#model_form_parent_container [data-form-input]',
      );

      const editedFieldIndex = Array.from(inputFieldsRefs).findIndex(
        (field) => field.getAttribute('data-form-input') === editCellName,
      );

      if (editedFieldIndex !== -1) {
        Array.from(inputFieldsRefs)[editedFieldIndex]?.scrollIntoView({
          block: 'start',
          behavior: 'smooth',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCellName, formRef.current]);

  useDeepEffect(() => {
    if (modelsData?.data?.cards) {
      setRows(modelsData.data.cards);
    }
  }, [modelsData?.data?.cards]);

  useDeepEffect(() => {
    if (dirtyFields.length) {
      const newInvalidFields = getInvalidFields(
        formSchema,
        values,
        wasPreviouslyActiveModel,
        fields,
      );
      setInvalidFields(newInvalidFields);
    }
  }, [values, dirtyFields, formSchema, wasPreviouslyActiveModel, fields]);

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
              checked={hasNoAccessToActiveModel ? wasPreviouslyActiveModel : activeModelByDefault}
              onChange={activeModelCheckboxHandler}
              disabled={!isEditByRatingModel}
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
          <FormContainer ref={formRef as any} id="model_form_parent_container">
            {Object.keys(groupedFieldsBySchemaName).map((schemaKey) => {
              const fieldsByGroup = groupedFieldsBySchemaName[schemaKey || 'Аллокация'];
              const fieldsByGroupSorted = sortBy(fieldsByGroup, (v) =>
                initialColumns.findIndex((c) => c.name === v.name),
              );
              const schemaTitle = SCHEMA_NAME_MAP[schemaKey]?.title;

              console.log('FORM LOGS / fieldsByGroup IS:', fieldsByGroupSorted, fieldsByGroup);

              // TODO: bad solution, need to refactor this logic
              // Determine if allocation fields should be hidden based on permissions
              // in the future should be determined by field "isEditAllocationEnabled" in the schema or server side
              const shouldHideAllocationFields = !schemaTitle && !isEditAllocationEnabled;
              if (shouldHideAllocationFields) {
                console.log('FORM LOGS / HIDDEN FIELD IS:', schemaKey);

                return null;
              }

              return (
                <div key={schemaKey}>
                  <T font="Subtitle/Subtitle 2">{schemaTitle || 'Аллокация'}</T>
                  <Spacer />
                  <Flexbox wrap="wrap" gap={20}>
                    {fieldsByGroupSorted.map((field) => {
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
                          data-form-input={field.name}
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
              disabled={submitLoading || invalidFields.length > 0}
            >
              Сохранить
            </Button>
            <Button
              dimension="s"
              onClick={handleOnClose}
              appearance="secondary"
              value="Submit"
              type="submit"
              disabled={submitLoading}
            >
              Отменить
            </Button>
          </ButtonContainer>
        </>
      }
    />
  );
};

