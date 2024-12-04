import { CUSTOMER_MAP } from '@src/shared/constants/customers';
import { Role } from '@src/shared/types';
import { FormFieldsSchema } from '../types';

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
    schemaOrder: 1,
  },
  DELETE_CONFIRM_MODEL_SCHEMA: {
    key: 'DELETE_CONFIRM_MODEL_SCHEMA',
    title: 'Атрибуты подверждения удаления модели',
    schemaOrder: 2,
  },
};

export const DELETE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'business_customer',
    required: false,
    maxLength: 255,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.EVERY_CUSTOMER],
    alwaysDisabled: true,
  },
  {
    name: 'model_name',
    required: false,
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.EVERY_CUSTOMER],
    alwaysDisabled: true,
  },
  {
    name: 'reason_model_delete',
    required: true,
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.EVERY_CUSTOMER],
    rolesAllowed: [Role.ADMIN_IT, Role.ADMIN_IT_LEAD],
    businessCustomerAllowed: true,
    modelCreatorAllowed: true,
  },
];

export const DELETE_CONFIRM_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'lead_validator_resolution_model_delete',
    required: true,
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    rolesAllowed: [Role.VALIDATOR_LEAD],
  },
  {
    name: 'lead_validator_comment_model_delete',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.EVERY_CUSTOMER],
    rolesAllowed: [Role.VALIDATOR_LEAD],
    requireConditions: [
      {
        lead_validator_resolution_model_delete: 'Отрицательно',
      },
    ],
  },
];

