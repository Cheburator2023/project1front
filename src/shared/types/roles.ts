export enum Role {
  ADMIN_IT = 'admin_it',
  ADMIN_IT_LEAD = 'admin_it_lead',
  VALIDATOR_LEAD = 'validator_lead',
  VALIDATOR = 'validator',
  BUSINESS_CUSTOMER = 'business_customer',
  BI_CUSTOMER_BROKER = 'bi_business_customer_broker',
  DS = 'ds',
  DE = 'de',
  DS_LEAD = 'ds_lead',
  DE_LEAD = 'de_lead',

  MODEL_OPS = 'modelops',
  MODEL_OPS_LEAD = 'modelops_lead',
  MIPM = 'mipm',
}

export type UserRoles = Role[];

