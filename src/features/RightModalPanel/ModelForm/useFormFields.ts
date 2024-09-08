import { useEffect, useState } from 'react';
import { FormFields, FormFieldsSchema } from './types';
import { Row } from '@src/shared/types';
import { Artifact } from '@src/shared/api';
import { getFormFields } from './helpers';
import { MODEL_FORM_MODE } from '@src/shared/constants';

interface UseFormFieldsProps {
  formSchema: FormFieldsSchema;
  artifacts: Artifact[];
  mode: MODEL_FORM_MODE;
  initialRow?: Partial<Row>;
}

export const useFormFields = ({ formSchema, initialRow, mode, artifacts }: UseFormFieldsProps) => {
  const [fields, setFields] = useState<FormFields>([]);

  useEffect(() => {
    const newFields = getFormFields({
      artifacts,
      initialRow,
      mode,
      activeFormSchema: formSchema,
    });

    setFields(newFields);
  }, [artifacts, formSchema, initialRow, mode]);

  return {
    fields,
  };
};
