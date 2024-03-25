import { Row } from '../../TableModels/types';
import { InputFactoryProps, InputValue } from '../InputFactory/types';

type FormValues = Partial<Record<keyof Row, InputValue>>;

type FormFields = InputFactoryProps<keyof Row>[];

export { FormValues, FormFields };
