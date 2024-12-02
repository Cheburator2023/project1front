import { useState } from 'react';
import { MODEL_FORM_MODE } from '@shared/constants';
import { Row } from '@shared/types';
import { sortBy } from 'lodash';
import { useDeepEffect } from '@shared/hooks/useDeepEffect';
import { FormFieldsSchema } from '../types';
import { markSchema } from '../helpers';
import { DELETE_CONFIRM_MODEL_SCHEMA, DELETE_MODEL_SCHEMA, SCHEMA_NAME_MAP } from './constants';

interface UseActiveFormSchemaProps {
  initialRow?: Partial<Row>;
  mode: MODEL_FORM_MODE;
}

const getDeleteModelSchema = () => {
  let formSchema = markSchema(DELETE_MODEL_SCHEMA, SCHEMA_NAME_MAP.DELETE_MODEL_SCHEMA);

  return formSchema;
};

const getDeleteConfirmModelSchema = () => {
  let formSchema = markSchema(
    DELETE_CONFIRM_MODEL_SCHEMA,
    SCHEMA_NAME_MAP.DELETE_CONFIRM_MODEL_SCHEMA,
  );

  return formSchema;
};

export const useActiveDeleteFormSchema = ({ initialRow, mode }: UseActiveFormSchemaProps) => {
  const [deleteFormSchema, setDeleteFormSchema] = useState<FormFieldsSchema>([]);

  useDeepEffect(() => {
    if (mode === MODEL_FORM_MODE.DELETE) {
      const newFormSchema = getDeleteModelSchema();

      setDeleteFormSchema(sortBy(newFormSchema, 'required'));
    }

    if (mode === MODEL_FORM_MODE.DELETE_CONFIRM) {
      const newFormSchema = getDeleteConfirmModelSchema();

      setDeleteFormSchema(sortBy(newFormSchema, 'required'));
    }
  }, [initialRow, mode]);

  return {
    deleteFormSchema,
  };
};

