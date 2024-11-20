/* eslint-disable no-unneeded-ternary */
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button, CheckboxField, T } from '@admiral-ds/react-ui';
import { TabMenu } from '@admiral-ds/react-ui';
import styled from 'styled-components';

import { Row } from '@shared/types';
import { StatusScreen } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE, MODEL_FORM_MODE } from '@shared/constants';
import { INPUT_TYPE, InputFactory, InputValue, RightPanel } from '@shared/ui/organisms';
import { API_ROUTES, useFetch, ArtifactApi, ModelEditApi } from '@shared/api';
import { groupBy, omit } from 'lodash';
import { Flexbox, Spacer } from '@shared/ui/atoms';
import { Artifact, CustomError } from '@shared/api/types';

import { useAppInjectStore } from '@shared/stores/appInjectStore';
import { CUSTOMER_MAP } from '@shared/constants/customers';
import { useScrollTo } from '@src/shared/hooks/useScrollTo';
import { FormValues } from './types';
import {
  getFormMode,
  getArtifactApiItems,
  getInvalidFields,
  getInputValuesFromRow,
  getProperFormatValueForSubmit,
} from './helpers';
import { ButtonContainer, FormContainer } from './styles';
import { useActiveFormSchema } from './useActiveFormSchema';
import { useFormFields } from './useFormFields';
import {
  ACTIVE_MODEL_SCHEMA,
  ALLOCATION_FIELDS_NAMES,
  NOT_ACTIVE_MODEL_SCHEMA,
  SCHEMA_NAME_MAP,
} from './constants';
import { ModelFormDotMenu } from './ModelFormDotMenu';

const StyledTabMenu = styled(TabMenu)`
  display: flex;
  justify-content: space-around;
  background-color: rgb(237, 245, 255);

  button span {
    padding: 0 50px;
  }
`;

const tabs = [
  {
    id: '1',
    content: 'Инициатор',
  },
  {
    id: '2',
    content: 'Подверждение',
  },
];

type SubmitType = { checkOnly?: boolean };

export interface ModelFormProps {
  mode: RIGHT_PANEL_TYPE.ADD_MODEL | RIGHT_PANEL_TYPE.EDIT_MODEL | RIGHT_PANEL_TYPE.DELETE_MODEL;
  artifacts: Artifact[];
  editCellName?: keyof Row;
  rows: Partial<Row>[];
  activeRow?: Partial<Row>;
  // TODO: check this types
  onSubmit: (newRow: CustomError | Row | ArtifactApi[], formMode: MODEL_FORM_MODE) => void;
  onClose: () => void;
}

export const DeleteModelForm = ({
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
  const [cachedValues, setCachedValues] = useState<FormValues | undefined>();
  const [invalidFields, setInvalidFields] = useState<Array<keyof Row>>([]);
  const [dirtyFields, setDirtyFields] = useState<Array<keyof Row>>([]);
  const [parentModelId, setParentModelId] = useState<string>();
  const [selectedColSize, setSelectedColSize] = useState<string>('2');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [initialRow, setInitialRow] = useState(activeRow);
  const [expandedPanel, setExpandPanel] = useState(false);
  const [showAllFields, setShowAllFields] = useState(false);
  const [activeModelByDefault, setActiveModelByDefault] = useState<boolean | undefined>(undefined);
  const [selected, setSelected] = useState<string>('3');

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

  const onChangeTab = (id: string) => {
    // eslint-disable-next-line no-console
    console.log(`selected: ${id}`);
  };

  const handleChange = useCallback((name: keyof Row, value: InputValue) => {
    let newValues = { [name]: value };
    // TODO: move this logic to artifact
    if (name === 'model_type' && value.type === INPUT_TYPE.SELECT) {
      if (
        Array.isArray(value.value)
          ? value.value.some((item) => item.text === 'Бизнес-модели')
          : value.value?.text === 'Бизнес-модели'
      ) {
        newValues = {
          ...newValues,
          model_risk_type: {
            type: INPUT_TYPE.SELECT,
            value: {
              id: '479',
              text: 'Бизнес',
            },
          },
        };
      } else {
        newValues = {
          ...newValues,
          model_risk_type: {
            type: INPUT_TYPE.SELECT,
            value: undefined,
          },
        };
      }
    }

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
      const newInvalidFields = getInvalidFields(
        formSchema,
        valuesWithAddedOutsideControls,
        wasPreviouslyActiveModel,
      );
      setInvalidFields(newInvalidFields);
      scrollToActiveError();
      setDirtyFields((prevDirtyFields) => [...prevDirtyFields, fields[0].name]);

      if (newInvalidFields.length) {
        return;
      }

      if (newInvalidFields.length) {
        return;
      }

      const artifactApiItems = getArtifactApiItems(valuesWithAddedOutsideControls, parentModelId);
      // TODO: check this types
      let newRow: CustomError | Row | ArtifactApi[] | undefined;

      setSubmitLoading(checkOnly ? false : true);

      if (initialRow && !checkOnly) {
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

      if (newRow && formMode) {
        onSubmit(newRow, formMode);
        setSubmitLoading(false);
        setSubmitError('');
      }
    },
    [values, formSchema, formMode, activeModelByDefault],
  );

  const handleOnClose = useCallback(() => {
    setValues({});
    setInvalidFields([]);
    setParentModelId(undefined);

    onClose();
  }, [onClose]);

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
            activeTab={selected}
            onChange={(id) => {
              onChangeTab(id);
              setSelected(id);
            }}
            tabs={tabs}
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
              Да
            </Button>
            <Button
              dimension="s"
              onClick={handleOnClose}
              appearance="secondary"
              value="Submit"
              type="submit"
            >
              Нет
            </Button>
          </ButtonContainer>
        </>
      }
    />
  );
};

