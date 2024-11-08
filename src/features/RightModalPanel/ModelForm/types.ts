import { Row } from '@shared/types';
import { InputFactoryProps, InputValue } from '@shared/ui/organisms';
import { CUSTOMER_TYPE } from '@src/shared/constants/customers';

type FormFieldConditions = Array<Partial<Record<keyof Row, string>>>;
type FormFieldValueConditions = Array<{
  value: string;
  conditions: FormFieldConditions;
}>;

type FormFieldsSchema = Array<{
  name: keyof Row;
  required?: boolean;
  disabled?: {
    forCustomer?: CUSTOMER_TYPE;
  };
  maxLength?: number;
  customers?: CUSTOMER_TYPE[];
  order?: number;
  requireConditions?: FormFieldConditions;
  valueConditions?: FormFieldValueConditions;
  schemaKey?: string;
  schemaOrder?: number;
}>;

type FormValues = Partial<Record<keyof Row, InputValue>>;

type FormFields = InputFactoryProps<keyof Row>[];

export { FormValues, FormFields, FormFieldsSchema, FormFieldConditions, FormFieldValueConditions };

