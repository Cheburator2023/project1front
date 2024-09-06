import { useEffect, useState } from 'react';
import { FormFields, FormFieldsSchema } from './types';
import { Row } from '@src/shared/types';
import { Artifact } from '@src/shared/api';
import { getFormFields } from './helpers';

interface UseFormFieldsProps {
  formSchema: FormFieldsSchema;
  artifacts: Artifact[];
  initialRow?: Partial<Row>;
}

export const useFormFields = ({ formSchema, initialRow, artifacts }: UseFormFieldsProps) => {
  const [fields, setFields] = useState<FormFields>([]);

  useEffect(() => {
    const newFields = getFormFields({
      artifacts,
      initialRow,
      activeFormSchema: formSchema,
    });

    setFields(newFields);
  }, [artifacts, formSchema, initialRow]);

  return {
    fields,
  };
};
