import { Row } from '../../TableModels/types';
import { InputFactoryProps, InputValue } from '../../../../components/InputFactory/types';

type FormFieldsSchema = Array<{ name: keyof Row; required: boolean; maxLength?: number }>;

type FormValues = Partial<Record<keyof Row, InputValue>>;

type FormFields = InputFactoryProps<keyof Row>[];

enum FORM_MODE {
  ADD = 'ADD',
  EDIT = 'EDIT',
}

export { FormValues, FormFields, FormFieldsSchema, FORM_MODE };
