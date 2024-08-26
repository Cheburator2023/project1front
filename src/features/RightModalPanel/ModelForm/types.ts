import { Row } from '@shared/types';
import { InputFactoryProps, InputValue } from '@shared/ui/organisms';

type FormFieldsSchema = Array<{ name: keyof Row; required: boolean; maxLength?: number }>;

type FormValues = Partial<Record<keyof Row, InputValue>>;

type FormFields = InputFactoryProps<keyof Row>[];

export { FormValues, FormFields, FormFieldsSchema };
