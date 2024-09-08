import { useEffect, useState } from 'react';
import { FormFieldsSchema, FormValues } from './types';
import { MODEL_FORM_MODE } from '@shared/constants';
import { Row } from '@src/shared/types';
import { BASE_MODEL_SCHEMA, ACTIVE_MODEL_SCHEMA } from './constants';

interface UseActiveFormSchemaProps {
  values?: FormValues;
  activeRow?: Partial<Row>;
  mode: MODEL_FORM_MODE;
}

// TODO: Convert data (activeRow and values) to a single format and remove unnecessary conditions
const getSchema = (activeRow?: Partial<Row>, values?: FormValues) => {
  let formSchema = BASE_MODEL_SCHEMA;

  if (values) {
    if (values.active_model?.value) {
      formSchema = [...BASE_MODEL_SCHEMA, ...ACTIVE_MODEL_SCHEMA];

      if (values.rating_system_name?.value) {
        formSchema = [...formSchema, ...[]]; // for future logic
      }
    }

    return formSchema;
  }

  if (activeRow) {
    if (activeRow.active_model === '1') {
      formSchema = [...BASE_MODEL_SCHEMA, ...ACTIVE_MODEL_SCHEMA];
    }

    return formSchema;
  }

  return formSchema;
};

export const useFormSchema = ({ activeRow, values, mode }: UseActiveFormSchemaProps) => {
  const [formSchema, setFormSchema] = useState<FormFieldsSchema>(BASE_MODEL_SCHEMA);

  useEffect(() => {
    if (mode === MODEL_FORM_MODE.EDIT) {
      const newFormSchema = getSchema(activeRow, values);

      setFormSchema(newFormSchema);
    }
  }, [activeRow, values?.active_model?.value, mode]);

  return {
    formSchema,
  };
};
