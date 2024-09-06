import { useEffect, useState } from 'react';
import { FormFieldsSchema, FormValues } from './types';
import { MODEL_FORM_MODE, RIGHT_PANEL_TYPE } from '@shared/constants';
import { Row } from '@src/shared/types';
import { BASE_MODEL_SCHEMA, ACTIVE_MODEL_SCHEMA, BASE_EDIT_MODEL_SCHEMA } from './constants';

interface UseActiveFormSchemaProps {
  values: FormValues;
  activeRow?: Partial<Row>;
  mode: RIGHT_PANEL_TYPE;
}

const getFormSchemaByRow = (activeRow?: Partial<Row>) => {
  let formSchema = BASE_MODEL_SCHEMA;

  if (activeRow?.active_model === '1') {
    formSchema = [...BASE_MODEL_SCHEMA, ...ACTIVE_MODEL_SCHEMA];
  }

  return formSchema;
};

const getFormSchemaByValues = (values?: FormValues) => {
  let formSchema = BASE_MODEL_SCHEMA;

  if (values?.active_model?.value) {
    formSchema = [...BASE_MODEL_SCHEMA, ...ACTIVE_MODEL_SCHEMA];

    if (values.rating_system_name?.value) {
      formSchema = [...formSchema, ...[]]; // for future logic
    }
  }

  return formSchema;
};

export const useFormSchema = ({ activeRow, values, mode }: UseActiveFormSchemaProps) => {
  console.log('test useFormSchema');

  const [formSchema, setFormSchema] = useState<FormFieldsSchema>(getFormSchemaByRow(activeRow));

  useEffect(() => {
    const newFormSchema = getFormSchemaByValues(values);

    setFormSchema(newFormSchema);
  }, [values.active_model?.value]);

  return {
    formSchema,
  };
};
