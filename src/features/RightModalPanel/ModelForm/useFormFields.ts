import { useState } from 'react';
import { Row } from '@src/shared/types';
import { Artifact } from '@src/shared/api';
import { MODEL_FORM_MODE } from '@src/shared/constants';
import { sortBy } from 'lodash';
import { useDeepEffect } from '@shared/hooks/useDeepEffect';
import { CUSTOMER_TYPE } from '@shared/constants/customers';
import { getFormFields } from './helpers';
import { FormFields, FormFieldsSchema, FormValues } from './types';

interface UseFormFieldsProps {
  formSchema: FormFieldsSchema;
  values?: FormValues;
  artifacts: Artifact[];
  mode: MODEL_FORM_MODE;
  initialRow?: Partial<Row>;
  showAllFields?: boolean;
  currentCustomer: CUSTOMER_TYPE;
  activeModelByDefault?: boolean;
  wasPreviouslyActiveModel?: boolean;
}

export const useFormFields = ({
  formSchema,
  initialRow,
  mode,
  artifacts,
  showAllFields,
  currentCustomer,
  values,
}: UseFormFieldsProps) => {
  const [fields, setFields] = useState<FormFields>([]);

  useDeepEffect(() => {
    const newFields = getFormFields({
      artifacts,
      values,
      initialRow,
      mode,
      currentFormSchema: formSchema,
      showAllFields,
      currentCustomer,
    });

    debugger;

    setFields(newFields);
  }, [artifacts, formSchema, initialRow, mode, showAllFields, currentCustomer, values]);

  // order field by schema order prop
  // and filterout active_model checkbox
  const orderedFields = sortBy(fields, 'schemaOrder').filter(({ name }) => name !== 'active_model');

  return {
    fields: orderedFields,
  };
};

