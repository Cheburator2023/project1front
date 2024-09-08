import { Row } from '@shared/types';
import { InputFactoryProps, InputValue } from '@shared/ui/organisms';

type FormFieldConditions = Array<Partial<Record<keyof Row, string>>>;

type FormFieldsSchema = Array<{
  name: keyof Row;
  required?: boolean;
  maxLength?: number;
  requireConditions?: FormFieldConditions;
  valueConditions?: Array<{
    value: string;
    conditions: FormFieldConditions;
  }>;
}>;

type FormValues = Partial<Record<keyof Row, InputValue>>;

type FormFields = InputFactoryProps<keyof Row>[];

export { FormValues, FormFields, FormFieldsSchema, FormFieldConditions };
