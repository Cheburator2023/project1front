import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, T } from '@admiral-ds/react-ui';

import { Row } from '@shared/types';
import { StatusScreen } from '@shared/ui/molecules';
import { RIGHT_PANEL_TYPE, MODEL_FORM_MODE } from '@shared/constants';
import { InputFactory, InputValue, RightPanel } from '@shared/ui/organisms';
import {
  API_ROUTES,
  useFetch,
  ArtifactApi,
  ArtifactResponse,
  ModelEditApi,
  FiltersContext,
} from '@shared/api';

import { FormValues } from './types';
import { getFormMode, getArtifactApiItems, getInvalidFields } from './helpers';
import { ButtonContainer, FormContainer } from './styles';
import { ParentModelSelect } from './ParentModelSelect';
import { useFormSchema } from './useActiveFormSchema';
import { useFormFields } from './useFormFields';

export interface ModelFormProps {
  mode: RIGHT_PANEL_TYPE.ADD_MODEL | RIGHT_PANEL_TYPE.EDIT_MODEL;
  artifactsApi: ArtifactResponse;
  editCellName?: keyof Row;
  rows: Partial<Row>[];
  activeRow?: Partial<Row>;
  onSubmit: (newRow: Row, formMode: MODEL_FORM_MODE) => void;
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
  const [invalidFields, setInvalidFields] = useState<Array<keyof Row>>([]);
  const [parentModelId, setParentModelId] = useState<string>();

  const [submitLoading, setSubmitLoading] = useState(false);

  const [initialRow, setInitialRow] = useState(activeRow);

  const formMode = getFormMode(mode);

  // TODO: add transformer from row to values
  const { formSchema } = useFormSchema({ values, activeRow: initialRow, mode });

  const { fields } = useFormFields({
    formSchema,
    initialRow,
    artifacts: artifactsApi.data,
  });

  const handleChange = useCallback((name: keyof Row, value: InputValue) => {
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const newInvalidFields = getInvalidFields(values, formSchema, activeRow, formMode);

    setInvalidFields(newInvalidFields);

    if (newInvalidFields.length) {
      return;
    }

    const artifactApiItems = getArtifactApiItems(values, parentModelId);
    let newRow: Row | undefined;

    setSubmitLoading(true);

    if (formMode === MODEL_FORM_MODE.EDIT && activeRow) {
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

        if (res.data.length && res.data[0]) {
          const a = res.data[0];
        }
      }
    }

    if (formMode === MODEL_FORM_MODE.ADD) {
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
  }, [values, formSchema, formMode]);

  const formRef = useRef<HTMLFormElement | null>(null);

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

  const handleChangeParentModel = useCallback(
    (_, selectedValue: string[]) => {
      const selectedModelId = selectedValue[0];

      const parentModel = rows.find((row) => row.system_model_id === selectedModelId);

      if (parentModel) {
        setInitialRow(parentModel);
        setParentModelId(selectedModelId);
      }
    },
    [rows, artifactsApi],
  );

  const handleOnClose = useCallback(() => {
    setValues({});
    setInvalidFields([]);
    setParentModelId(undefined);

    onClose();
  }, [onClose]);

  const title = formMode === MODEL_FORM_MODE.ADD ? 'Новая модель' : 'Редактирование модели';

  return (
    <RightPanel
      title={title}
      showPanel
      onClose={handleOnClose}
      header={
        formMode === MODEL_FORM_MODE.ADD && (
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
                onChange={handleChange}
                inputFactory={field}
                editFieldName={editCellName}
                error={invalidFields.includes(field.name)}
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
