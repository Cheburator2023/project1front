/* eslint-disable no-unneeded-ternary */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, T, TabMenu } from '@admiral-ds/react-ui';
import styled from 'styled-components';
import { ReactComponent as ErrorTriangleSolid } from '@admiral-ds/icons/build/service/ErrorTriangleSolid.svg';
import { ReactComponent as TimeSolid } from '@admiral-ds/icons/build/system/TimeSolid.svg';

import { Row } from '@shared/types';
import { StatusScreen } from '@shared/ui/molecules';
import { MODEL_FORM_MODE } from '@shared/constants';
import { INPUT_TYPE, InputFactory, InputValue, RightPanel } from '@shared/ui/organisms';
import { API_ROUTES, ArtifactApi, useFetch } from '@shared/api';
import { groupBy } from 'lodash';
import { Flexbox, Spacer } from '@shared/ui/atoms';
import { Artifact, CustomError, ModelEditApi } from '@shared/api/types';

import { useAppInjectStore } from '@shared/stores/appInjectStore';
import { useDeleteRightModelPanelStore } from '@src/shared/stores';
import { useScrollTo } from '@src/shared/hooks/useScrollTo';
import { useRoles } from '@src/shared/hooks';
import { FormValues } from '../types';
import { getArtifactApiItems, getInputValuesFromRow, getInvalidFields } from '../helpers';
import { ButtonContainer, FormContainer } from '../ModelForm/styles';
import { useFormFields } from '../ModelForm/useFormFields';
import { DELETE_CONFIRM_MODEL_SCHEMA, DELETE_MODEL_SCHEMA, SCHEMA_NAME_MAP } from './constants';
import { useActiveDeleteFormSchema } from './useActiveDeleteFormSchema';

const StyledTabMenu = styled(TabMenu)`
  display: flex;
  justify-content: space-around;
  background-color: rgb(237, 245, 255);

  button span {
    padding: 0 38px;
  }
`;

const CustomErrorTriangleSolid = styled(ErrorTriangleSolid)`
  & path {
    fill: ${(p) => p.theme.color['Error/Error 60 Main']} !important;
  }
`;

export enum ResolutionText {
  APPROVE = 'Утвердительно',
  REJECT = 'Отрицательно',
}

export enum ModelStatus {
  ERROR_REGISTRATION = 'Ошибка заведения',
  AWAITING_DELETION = 'Ожидает удаления',
  EMPTY = '',
}

export type ResolutionValue = {
  id: string;
  text: ResolutionText;
};

export type SubmitType = { checkOnly?: boolean };

export interface DeleteModelFormProps {
  artifacts: Artifact[];
  editCellName?: keyof Row;
  activeRow?: Partial<Row>;
  onSubmit: (newRow: CustomError | Row | ArtifactApi[], formMode: MODEL_FORM_MODE) => void;
  onClose: () => void;
}

export const resolveModelStatusForDeletion = ({
  isValidatorLead,
  resolutionValue,
  currentModelStatus,
}) => {
  if (isValidatorLead) {
    const resolutionText = resolutionValue?.text;

    if (resolutionText === ResolutionText.APPROVE) {
      return ModelStatus.ERROR_REGISTRATION;
    }
    if (resolutionText === ResolutionText.REJECT) {
      return ModelStatus.EMPTY;
    }
  }

  return currentModelStatus || ModelStatus.AWAITING_DELETION;
};

const isSubmitButtonEnabled = (
  activeTab: string,
  isValidatorLead: boolean,
  modelStatus: ModelStatus,
): boolean => {
  if (!isValidatorLead && modelStatus === ModelStatus.AWAITING_DELETION && activeTab === '1') {
    return false;
  }

  if (modelStatus === ModelStatus.ERROR_REGISTRATION) {
    return false;
  }

  const conditions = {
    '1': !isValidatorLead,
    '2': isValidatorLead,
  };

  return conditions[activeTab] ?? false;
};

export const DeleteModelForm = ({
  artifacts,
  editCellName,
  activeRow,
  onSubmit,
  onClose,
}: DeleteModelFormProps) => {
  const { mutationProtectedFetch } = useFetch({});
  const { currentCustomer } = useAppInjectStore();

  const [values, setValues] = useState<FormValues | undefined>();
  const [invalidFields, setInvalidFields] = useState<Array<keyof Row>>([]);
  const [dirtyFields, setDirtyFields] = useState<Array<keyof Row>>([]);
  const [parentModelId, setParentModelId] = useState<string>();
  const [selectedColSize] = useState<string>('2');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [initialRow] = useState(activeRow);
  const [expandedPanel, setExpandPanel] = useState(false);
  const [showAllFields] = useState(false);
  const [activeModelByDefault, setActiveModelByDefault] = useState<boolean | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('1');
  const { formMode, setFormMode } = useDeleteRightModelPanelStore();
  const { isValidatorLead } = useRoles();

  const resolutionValue = values?.lead_validator_resolution_model_delete?.value as ResolutionValue;
  const modelStatusValue = values?.status?.value as ModelStatus;

  const tabs = useMemo(() => {
    const getIcon = () => {
      if (modelStatusValue === ModelStatus.AWAITING_DELETION) {
        return <TimeSolid />;
      }

      if (resolutionValue?.text === ResolutionText.REJECT) {
        return <CustomErrorTriangleSolid />;
      }

      return null;
    };

    const isSecondTabDisabled = !isValidatorLead && !resolutionValue?.text;

    return [
      {
        id: '1',
        content: 'Инициатор',
        schema: DELETE_MODEL_SCHEMA,
      },
      {
        id: '2',
        content: 'Подтверждение',
        schema: DELETE_CONFIRM_MODEL_SCHEMA,
        icon: getIcon(),
        disabled: isSecondTabDisabled,
      },
    ];
  }, [resolutionValue, modelStatusValue]);

  const wasPreviouslyActiveModel = activeRow?.active_model === '1';

  const errorElemRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const scrollToActiveError = useScrollTo(errorElemRef, formRef);

  const { deleteFormSchema } = useActiveDeleteFormSchema({
    initialRow,
    mode: formMode,
  });

  const { fields } = useFormFields({
    formSchema: deleteFormSchema,
    values,
    mode: formMode,
    initialRow,
    artifacts,
    showAllFields,
    currentCustomer,
    activeModelByDefault,
    wasPreviouslyActiveModel,
  });

  const title = 'Удаление модели';
  const groupedBySchemaName = groupBy(fields, 'schemaKey');

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    const selectedTab = tabs.find((tab) => tab.id === tabId);
    if (selectedTab) {
      const newFormMode =
        selectedTab.schema === DELETE_CONFIRM_MODEL_SCHEMA
          ? MODEL_FORM_MODE.DELETE_CONFIRM
          : MODEL_FORM_MODE.DELETE;

      setFormMode(newFormMode);
    }
  }, []);

  const handleChange = useCallback((name: keyof Row, value: InputValue) => {
    const newValues = { [name]: value };

    setDirtyFields((prevDirtyFields) => [...prevDirtyFields, name]);

    setValues((prevValues) => ({ ...prevValues, ...newValues }));
  }, []);

  const handleSubmit = useCallback(
    async ({ checkOnly = false }: SubmitType) => {
      const valuesWithAddedOutsideControls: FormValues = {
        ...values,
        active_model: {
          type: INPUT_TYPE.FLAG,
          value: activeModelByDefault || false,
        },
      };

      const newModelStatus = resolveModelStatusForDeletion({
        isValidatorLead,
        resolutionValue,
        currentModelStatus: valuesWithAddedOutsideControls.status?.value as ModelStatus,
      });

      if (!valuesWithAddedOutsideControls.status) {
        valuesWithAddedOutsideControls.status = {
          type: INPUT_TYPE.STRING,
          value: newModelStatus,
        };
      } else {
        valuesWithAddedOutsideControls.status.value = newModelStatus;
      }

      const newInvalidFields = getInvalidFields(
        deleteFormSchema,
        valuesWithAddedOutsideControls,
        wasPreviouslyActiveModel,
        fields,
      );

      setInvalidFields(newInvalidFields);
      scrollToActiveError();
      setDirtyFields((prevDirtyFields) => [...prevDirtyFields, fields[0].name]);

      if (newInvalidFields.length) {
        return;
      }

      const artifactApiItems = getArtifactApiItems(valuesWithAddedOutsideControls, parentModelId);

      let newRow: CustomError | Row | ArtifactApi[] | undefined;

      setSubmitLoading(checkOnly ? false : true);

      if (initialRow && !checkOnly) {
        const { system_model_id, model_source } = initialRow;

        if (system_model_id && model_source) {
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
            setSubmitError('Произошла ошибка при удалении модели');
            return;
          }

          if (res?.data?.data?.cards && res.data.data.cards[0]) {
            newRow = res.data.data.cards[0];
          }
        }
      }

      if (newRow && formMode) {
        onSubmit(newRow, formMode);
        setSubmitLoading(false);
        setSubmitError('');
      }
    },
    [values, deleteFormSchema, formMode, activeModelByDefault],
  );

  const handleOnClose = useCallback(() => {
    setValues({});
    setInvalidFields([]);
    setParentModelId(undefined);

    onClose();
  }, [onClose]);

  useEffect(() => {
    if (modelStatusValue === ModelStatus.AWAITING_DELETION) {
      setValues((prevValues) => ({
        ...prevValues,
        lead_validator_comment_model_delete: undefined,
      }));
    }

    if (resolutionValue?.text === ResolutionText.REJECT && !modelStatusValue) {
      setValues((prevValues) => ({
        ...prevValues,
        reason_model_delete: undefined,
      }));
    }
  }, [modelStatusValue, resolutionValue]);

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
      const newInvalidFields = getInvalidFields(
        deleteFormSchema,
        values,
        wasPreviouslyActiveModel,
        fields,
      );
      setInvalidFields(newInvalidFields);
    }
  }, [values, dirtyFields, deleteFormSchema, wasPreviouslyActiveModel, fields]);

  const renderFooter = useCallback(() => {
    const modelStatus = values?.status?.value || initialRow?.status;
    const isEnabled = isSubmitButtonEnabled(activeTab, isValidatorLead, modelStatus as ModelStatus);

    return (
      <>
        <T font="Caption/Caption 1" color="Neutral/Neutral 50" as="div">
          Вы действительно хотите удалить модель?
        </T>
        <ButtonContainer>
          <Button
            dimension="s"
            onClick={() => handleSubmit({ checkOnly: false })}
            value="Submit"
            type="submit"
            disabled={!isEnabled}
          >
            Да
          </Button>
          <Button
            dimension="s"
            onClick={handleOnClose}
            appearance="secondary"
            value="Submit"
            type="button"
          >
            Нет
          </Button>
        </ButtonContainer>
      </>
    );
  }, [activeTab, isValidatorLead, handleSubmit, handleOnClose]);

  return (
    <RightPanel
      title={title}
      showPanel
      onClose={handleOnClose}
      expanded={expandedPanel}
      onExpanded={() => setExpandPanel(!expandedPanel)}
      body={
        <StatusScreen
          loadingLabel="Данные сохраняются..."
          successLabel="Успешно сохранено"
          error={submitError}
          apiLoading={submitLoading}
          onFinished={handleOnClose}
        >
          <StyledTabMenu
            dimension="l"
            activeTab={activeTab}
            onChange={handleTabChange}
            tabs={tabs.map(({ id, content, icon, disabled }) => ({ id, content, icon, disabled }))}
          />
          <FormContainer ref={formRef}>
            {Object.keys(groupedBySchemaName).map((schemaKey) => {
              const fieldsByGroup = groupedBySchemaName[schemaKey];
              const schemaTitle = SCHEMA_NAME_MAP[schemaKey]?.title;

              return (
                <div key={schemaKey}>
                  <T font="Subtitle/Subtitle 2">{schemaTitle}</T>
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
      footer={renderFooter()}
    />
  );
};

