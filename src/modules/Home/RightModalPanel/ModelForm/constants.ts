import { FormFieldsSchema } from './types';

export const MONTHS_IN_QUARTER = 3;
export const ADDITIONAL_DAYS_OUT_QUARTER = 10;

export const ADD_NEW_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'model_name',
    required: true,
    maxLength: 250,
  },
  {
    name: 'model_name_dadm',
    required: false,
    maxLength: 250,
  },
  {
    name: 'model_desc',
    required: true,
    maxLength: 250,
  },
  {
    name: 'business_customer',
    required: true,
    maxLength: 255,
  },
  {
    name: 'business_customer_departament',
    required: true,
  },
  {
    name: 'ds_department',
    required: false,
    maxLength: 255,
  },
  {
    name: 'ds_stream',
    required: false,
  },
  {
    name: 'product_name',
    required: false,
  },
  {
    name: 'developing_model_reason',
    required: false,
  },
  {
    name: 'group_company',
    required: true,
  },
  {
    name: 'model_indicator',
    required: true,
  },
  {
    name: 'custom_model_type',
    required: false,
  },
  {
    name: 'significance_validity',
    required: true,
  },
  {
    name: 'provides_piloting',
    // required: true,
    required: false,
  },
  {
    name: 'operational_monitoring',
    required: false,
  },
  {
    name: 'analytical_monitoring',
    required: false,
  },
  {
    name: 'target',
    required: false,
    maxLength: 100,
  },
  {
    name: 'model_changes_info',
    required: false,
    maxLength: 250,
  },
  {
    name: 'rfd',
    required: false,
    maxLength: 250,
  },
];
