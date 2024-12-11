import { Row, UserRoles } from '@shared/types';
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
  maxLength?: number;
  customers?: CUSTOMER_TYPE[];
  order?: number;
  requireConditions?: FormFieldConditions | string[];
  optionConditions?: OptionConditionsType[];
  autoCompleteConditions?: FormFieldValueConditions;
  valueConditions?: FormFieldValueConditions;
  disabledConditions?: FormFieldConditions | string[];
  enabledByValueConditions?: FormFieldValueConditions;
  businessCustomerAllowed?: boolean;
  modelCreatorAllowed?: boolean;
  rolesAllowed?: UserRoles;
  alwaysDisabled?: boolean;
  schemaKey?: string;
  schemaOrder?: number;
}>;

type FormValues = Partial<Record<keyof Row, InputValue>>;

type FormFields = InputFactoryProps<keyof Row>[];

type OptionConditionsType = {
  connected_field: string;
  value: string;
  options: string[];
};

export {
  FormValues,
  FormFields,
  FormFieldsSchema,
  FormFieldConditions,
  FormFieldValueConditions,
  OptionConditionsType,
};

