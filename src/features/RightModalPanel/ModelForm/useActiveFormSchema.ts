import { useEffect, useState } from 'react';
import { FormFieldsSchema, FormValues } from './types';
import { MODEL_FORM_MODE } from '@shared/constants';
import { Row } from '@src/shared/types';
import {
  BASE_MODEL_SCHEMA,
  ACTIVE_MODEL_SCHEMA,
  RATING_SYSTEM_MODEL_SCHEMA,
  RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA,
} from './constants';
import { INPUT_TYPE } from '@src/shared/ui/organisms';

interface UseActiveFormSchemaProps {
  values?: FormValues;
  initialRow?: Partial<Row>;
  mode: MODEL_FORM_MODE;
}

const getUnionSchema = (firstSchema: FormFieldsSchema, secondSchema: FormFieldsSchema) => {
  const unionSchema = [...firstSchema];

  secondSchema.forEach((secondSchemaItem) => {
    const indexUnionSchemaItem = unionSchema.findIndex(
      ({ name }) => name === secondSchemaItem.name,
    );

    if (indexUnionSchemaItem === -1) {
      unionSchema.push(secondSchemaItem);
    }

    unionSchema[indexUnionSchemaItem] = secondSchemaItem;
  });

  return unionSchema;
};

// TODO: Convert data (activeRow and values) to a single format and remove unnecessary conditions
const getSchema = (activeRow?: Partial<Row>, values?: FormValues) => {
  let formSchema = BASE_MODEL_SCHEMA;

  if (values) {
    if (values.active_model?.value) {
      formSchema = getUnionSchema(BASE_MODEL_SCHEMA, ACTIVE_MODEL_SCHEMA);

      //TODO: It is necessary to avoid using string values in conditionals, try to switch them to artifact values (prob need another approach)
      if (
        values.rating_model &&
        values.rating_model.type === INPUT_TYPE.SELECT &&
        values.rating_model?.value?.text === 'Да'
      ) {
        formSchema = getUnionSchema(formSchema, RATING_SYSTEM_MODEL_SCHEMA);

        if (
          values.classification_of_rs_by_order_of_application_within_pvr &&
          values.classification_of_rs_by_order_of_application_within_pvr.type ===
            INPUT_TYPE.SELECT &&
          values.classification_of_rs_by_order_of_application_within_pvr?.value?.text ===
            'Рейтинговые системы, подлежащие согласованию с Регулятором'
        ) {
          formSchema = getUnionSchema(formSchema, RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA);
        }
      }
    }

    return formSchema;
  }

  return formSchema;
};

export const useFormSchema = ({ initialRow, values, mode }: UseActiveFormSchemaProps) => {
  const [formSchema, setFormSchema] = useState<FormFieldsSchema>(BASE_MODEL_SCHEMA);

  useEffect(() => {
    if (mode === MODEL_FORM_MODE.EDIT) {
      const newFormSchema = getSchema(initialRow, values);

      setFormSchema(newFormSchema);
    }
  }, [initialRow, mode, values?.active_model?.value, values?.rating_model]);

  return {
    formSchema,
  };
};
