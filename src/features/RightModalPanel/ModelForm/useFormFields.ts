import { useState } from 'react';
import { Row } from '@src/shared/types';
import { Artifact } from '@src/shared/api';
import { MODEL_FORM_MODE } from '@src/shared/constants';
import { sortBy } from 'lodash';
import { useDeepEffect } from '@shared/hooks/useDeepEffect';
import { CUSTOMER_TYPE } from '@shared/constants/customers';
import { getFormFields } from '../helpers';
import { FormFields, FormFieldsSchema, FormValues } from '../types';
import { useRoles } from '../../../shared/hooks';

interface UseFormFieldsProps {
  formSchema: FormFieldsSchema;
  values?: FormValues;
  artifacts: Artifact[];
  mode: MODEL_FORM_MODE;
  initialRow?: Partial<Row>;
  showAllFields?: boolean;
  currentCustomer: CUSTOMER_TYPE;
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
  const { isValidator, isValidatorLead, isBusinessCustomer, isDsLead } = useRoles();
  const canEditModelRiskByRole = isValidator || isValidatorLead || isBusinessCustomer;

  useDeepEffect(() => {
    const newFields = getFormFields({
      artifacts,
      values,
      initialRow,
      mode,
      currentFormSchema: formSchema,
      showAllFields,
      currentCustomer,
      canEditModelRiskByRole,
      isBusinessCustomer,
      isValidatorLead,
      isValidator,
      isDsLead,
    });

    setFields(newFields);
  }, [
    artifacts,
    formSchema,
    initialRow,
    mode,
    showAllFields,
    currentCustomer,
    values,
    canEditModelRiskByRole,
    isBusinessCustomer,
    isValidatorLead,
    isValidator,
    isDsLead,
  ]);

  // order field by schema order prop
  // and filterout active_model checkbox
  const orderedFields = sortBy(fields, 'schemaOrder').filter(({ name }) => name !== 'active_model');

  return {
    fields: orderedFields,
  };
};

