import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Button, T } from '@admiral-ds/react-ui';

import { RightPanel } from 'src/components';

import { ArtifactApi, ArtifactResponse, ModelEditApi } from 'src/api/types';
import { API_ROUTES, useFetch } from 'src/api';

import { FORM_MODE, FormFields, FormValues } from './types';
import {
  getFormMode,
  getFormFields,
  getArtifactApiItems,
  getNotValidFields,
  getValuesFromParentModel,
} from './helpers';

import { StatusScreen } from 'src/components';
import InputFactory from 'src/components/InputFactory';
import { InputValue } from 'src/components/InputFactory/types';

import { ButtonContainer, FormContainer } from './styles';

import { Row } from '../../TableModels/types';
import { FiltersContext } from '../../FiltersContext';
import { ParentModelSelect } from './ParentModelSelect';
import { RIGHT_PANEL_TYPE } from '../../types';

interface ModelFormProps {
  mode: RIGHT_PANEL_TYPE.ADD_MODEL | RIGHT_PANEL_TYPE.EDIT_MODEL;
  artifactsApi: ArtifactResponse;
  editCellName?: keyof Row;
  rows: Partial<Row>[];
  activeRow?: Partial<Row>;
  onSubmit: (newRow: Row, formMode: FORM_MODE) => void;
  onClose: () => void;
}

export const ModelForm = ({
  mode,
  rows,
  artifactsApi,
  editCellName,
  activeRow,
  onSubmit,
  onClose,
}: ModelFormProps) => {
  const { columnsFilters } = useContext(FiltersContext);

  const { mutationProtectedFetch } = useFetch({});

  const [values, setValues] = useState<FormValues>({});
  const [fields, setFields] = useState<FormFields>([]);
  const [notValidFields, setNotValidFields] = useState<Array<keyof Row>>([]);
  const [parentModelId, setParentModelId] = useState<string>();

  const [submitLoading, setSubmitLoading] = useState(false);

  const formMode = getFormMode(mode);

  useEffect(() => {
    let newFields: FormFields = [];

    if (formMode === FORM_MODE.EDIT) {
      newFields = getFormFields({
        formMode,
        artifacts: artifactsApi.data,
        columnsFilters,
        initialRow: activeRow,
      });
    }

    if (formMode === FORM_MODE.ADD) {
      newFields = getFormFields({
        formMode,
        artifacts: artifactsApi.data,
      });
    }

    setFields(newFields);
  }, [artifactsApi, formMode, activeRow]);

  const handleChange = useCallback((name: keyof Row, value: InputValue) => {
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const newNotValidFields = getNotValidFields(values, activeRow, formMode);

    setNotValidFields(newNotValidFields);

    if (newNotValidFields.length) {
      return;
    }

    const artifactApiItems = getArtifactApiItems(values, parentModelId);
    let newRow: Row | undefined;

    setSubmitLoading(true);

    if (formMode === FORM_MODE.EDIT && activeRow) {
      const modelId = activeRow.system_model_id;

      if (modelId) {
        const res = await mutationProtectedFetch<ModelEditApi[], Row[]>({
          body: [
            {
              model_id: modelId,
              artefacts: artifactApiItems,
            },
          ],
          fetchApiRoute: API_ROUTES.MODELS_EDIT,
          fetchMethod: 'PUT',
        });

        if (!res || res.error) {
          return;
        }

        if (res.data.length) {
          newRow = res.data[0];
        }
      }
    }

    if (formMode === FORM_MODE.ADD) {
      const res = await mutationProtectedFetch<ArtifactApi[], Row>({
        body: artifactApiItems,
        fetchApiRoute: API_ROUTES.MODEL_ADD,
        fetchMethod: 'POST',
      });

      if (!res || res.error) {
        return;
      }

      newRow = res.data;
    }

    if (newRow && formMode) {
      onSubmit(newRow, formMode);
      setSubmitLoading(false);
    }
  }, [values, formMode]);

  const formRef = useRef<HTMLFormElement | null>(null);

  // Scroll to edit input field
  useEffect(() => {
    if (formRef.current?.children && editCellName && formMode === FORM_MODE.EDIT) {
      const editedFieldIndex = fields.findIndex((field) => field.name === editCellName);

      if (editedFieldIndex !== -1) {
        formRef.current.children[editedFieldIndex]?.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCellName, formRef.current, formMode]);

  const handleChangeParentModel = useCallback(
    (_, selectedValue: string[]) => {
      const selectedModelId = selectedValue[0];

      const parentModel = rows.find((row) => row.system_model_id === selectedModelId);

      if (parentModel) {
        const newFields = getFormFields({
          formMode: FORM_MODE.ADD,
          artifacts: artifactsApi.data,
          initialRow: parentModel,
        });
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

  const title = formMode === FORM_MODE.ADD ? 'Новая модель' : 'Редактирование модели';

  return (
    <RightPanel
      title={title}
      showPanel
      onClose={handleOnClose}
      header={
        formMode === FORM_MODE.ADD && (
          <ParentModelSelect
            rows={rows}
            selectedModel={parentModelId}
            onSelectParentModel={handleChangeParentModel}
          />
        )
      }
      body={
        <StatusScreen
          loadingLabel="Данные сохраняются..."
          successLabel="Успешно сохранено"
          apiLoading={submitLoading}
          onFinished={handleOnClose}
        >
          <FormContainer ref={formRef}>
            {fields.map((field) => (
              <InputFactory<keyof Row>
                key={field.id}
                values={values}
                autoFocus={editCellName === field.name}
                onChange={handleChange}
                inputFactory={field}
                editFieldName={editCellName}
                error={notValidFields.includes(field.name)}
              />
            ))}
          </FormContainer>
        </StatusScreen>
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
