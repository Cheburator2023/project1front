import { Row } from '@shared/types';
import { InputFactoryProps, InputValue } from '@shared/ui/organisms';

type FormFieldRequireConditions = Array<Partial<Record<keyof Row, string>>>;

type FormFieldsSchema = Array<{
  name: keyof Row;
  required?: boolean;
  maxLength?: number;
  requireConditions?: FormFieldRequireConditions;
  valueConditions?: Array<{
    value: string;
    conditions: FormFieldRequireConditions;
  }>;
}>;

type FormValues = Partial<Record<keyof Row, InputValue>>;

type FormFields = InputFactoryProps<keyof Row>[];

export { FormValues, FormFields, FormFieldsSchema, FormFieldRequireConditions };
