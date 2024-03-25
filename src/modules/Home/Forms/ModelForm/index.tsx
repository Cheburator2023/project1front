import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, T } from '@admiral-ds/react-ui';

import { RightPanel } from 'src/components';

import { ArtifactApi, ArtifactResponse, ModelEditApi } from 'src/api/types';
import { API_ROUTES, useFetch } from 'src/api';

import { FormFields, FormValues } from './types';
import {
  getAddModelFormFields,
  getArtifactApiItems,
  getEditModelFormFields,
  getNotValidFields,
  getValuesFromParentModel,
} from './helpers';

import { ButtonContainer, FormContainer } from './styles';

import InputFactory from '../InputFactory';
import { InputValue } from '../InputFactory/types';
import { Row } from '../../TableModels/types';
import { FiltersContext } from '../../FiltersContext';
import { ParentModelSelect } from './ParentModelSelect';
import { TABLE_ACTION } from '../../types';
import { SuccessScreen } from 'src/components/SuccessScreen';

interface ModelFormProps {
  mode: TABLE_ACTION.ADD | TABLE_ACTION.EDIT;
  artifactsApi: ArtifactResponse;
  initialValues?: Partial<Row>;
  editCellName?: keyof Row;
  rows: Partial<Row>[];
  onSubmit: (newRow: Row, mode: TABLE_ACTION) => void;
  onClose: () => void;
}

export const ModelForm = ({
  mode,
  rows,
  artifactsApi,
  editCellName,
  initialValues,
  onSubmit,
  onClose,
}: ModelFormProps) => {
  const { columnsFilters } = useContext(FiltersContext);

  const { protectedFetch } = useFetch({});

  const [values, setValues] = useState<FormValues>({});
  const [fields, setFields] = useState<FormFields>([]);
  const [notValidFields, setNotValidFields] = useState<Array<keyof Row>>([]);
  const [parentModelId, setParentModelId] = useState<string>();

  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    let newFields: FormFields = [];

    if (mode === TABLE_ACTION.EDIT) {
      newFields = getEditModelFormFields(artifactsApi.data, columnsFilters, initialValues);
    }

    if (mode === TABLE_ACTION.ADD) {
      newFields = getAddModelFormFields(artifactsApi.data);
    }

    setFields(newFields);
  }, [artifactsApi, mode, initialValues]);

  const title = mode === TABLE_ACTION.ADD ? 'Новая модель' : 'Редактирование модели';

  const handleChange = useCallback((name: keyof Row, value: InputValue) => {
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const newNotValidFields = getNotValidFields(values, initialValues, mode);

    setNotValidFields(newNotValidFields);

    if (newNotValidFields.length) {
      return;
    }

    const artifactApiItems = getArtifactApiItems(values, parentModelId);
    let newRow: Row | undefined;

    setSubmitLoading(true);

    if (mode === TABLE_ACTION.EDIT && initialValues) {
      const modelId = initialValues.system_model_id;

      if (modelId) {
        const res = await protectedFetch<ModelEditApi[], Row[]>(
          [
            {
              model_id: modelId,
              artefacts: artifactApiItems,
            },
          ],
          API_ROUTES.MODELS_EDIT,
          'PUT',
        );

        if (res?.length) {
          newRow = res[0];
        }
      }
    }

    if (mode === TABLE_ACTION.ADD) {
      newRow = await protectedFetch<ArtifactApi[], Row>(
        artifactApiItems,
        API_ROUTES.MODEL_ADD,
        'POST',
      );
    }

    if (newRow && mode) {
      onSubmit(newRow, mode);
      setSubmitLoading(false);
    }
  }, [values]);

  const formRef = useRef<HTMLFormElement | null>(null);

  // Scroll to edit input field
  useEffect(() => {
    if (formRef.current?.children && editCellName && mode === TABLE_ACTION.EDIT) {
      const editedFieldIndex = fields.findIndex((field) => field.name === editCellName);

      if (editedFieldIndex !== -1) {
        formRef.current.children[editedFieldIndex]?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCellName, formRef.current, mode]);

  const handleChangeParentModel = useCallback(
    (_, selectedValue: string[]) => {
      const selectedModelId = selectedValue[0];

      const parentModel = rows.find((row) => row.system_model_id === selectedModelId);

      if (parentModel) {
        const newFields = getAddModelFormFields(artifactsApi.data, parentModel);
        const newValues = getValuesFromParentModel(newFields);

        setValues(newValues);
        setFields(newFields);
        setParentModelId(selectedModelId);
      }
    },
    [rows, artifactsApi],
  );

  const handleOnClose = useCallback(() => {
    setValues({});
    setNotValidFields([]);
    setParentModelId(undefined);

    onClose();
  }, [onClose]);

  return (
    <RightPanel
      title={title}
      showPanel
      onClose={handleOnClose}
      header={
        mode === TABLE_ACTION.ADD && (
          <ParentModelSelect
            rows={rows}
            selectedModel={parentModelId}
            onSelectParentModel={handleChangeParentModel}
          />
        )
      }
      body={
        <SuccessScreen
          loadingLabel="Данные сохраняются..."
          successLabel="Успешно сохранено"
          apiLoading={submitLoading}
          onFinished={handleOnClose}
        >
          <FormContainer ref={formRef}>
            {fields.map((field) => (
              <InputFactory<keyof Row>
                key={field.id}
                autoFocus={editCellName === field.name}
                value={values[field.name]}
                onChange={handleChange}
                inputFactory={field}
                error={notValidFields.includes(field.name)}
              />
            ))}
          </FormContainer>
        </SuccessScreen>
      }
      footer={
        <>
          <T font="Caption/Caption 1" color="Neutral/Neutral 50" as="div">
            * Поля обязательные для сохранения
          </T>
          <ButtonContainer>
            <Button dimension="s" onClick={handleSubmit} value="Submit" type="submit">
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
