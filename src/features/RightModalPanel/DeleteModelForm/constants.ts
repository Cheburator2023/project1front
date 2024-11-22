import { CUSTOMER_MAP } from '@src/shared/constants/customers';
import { FormFieldsSchema } from '../ModelForm/types';

type SchemaNameMap = {
  [key: string]: {
    title: string;
    schemaOrder: number;
    key: string;
  };
};

export const SCHEMA_NAME_MAP: SchemaNameMap = {
  DELETE_MODEL_SCHEMA: {
    key: 'DELETE_MODEL_SCHEMA',
    title: 'Атрибуты удаления модели',
    schemaOrder: 6,
  },
  DELETE_CONFIRM_MODEL_SCHEMA: {
    key: 'DELETE_CONFIRM_MODEL_SCHEMA',
    title: 'Атрибуты подверждения удаления модели',
    schemaOrder: 7,
  },
};

export const DELETE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'business_customer',
    required: true,
    maxLength: 255,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.EVERY_CUSTOMER],
  },
  {
    name: 'model_name_dadm',
    required: false,
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.EVERY_CUSTOMER],
  },
  {
    name: 'reason_model_delete',
    required: false,
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.EVERY_CUSTOMER],
  },
];

export const DELETE_CONFIRM_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'lead_validator_resolution_model_delete',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'lead_validator_comment_model_delete',
    required: false,
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.EVERY_CUSTOMER],
  },
];

