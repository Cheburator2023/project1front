export enum Permission {
  ADD_MODEL = 'add_model_sumrm',
  EDIT_MODEL = 'edit_model_sumrm',
  ADD_PUBLIC_TEMPLATE = 'add_public_template_sumrm',
  EDIT_ALLOCATION = 'edit_allocation_sumrm',
}

export type UserPermissions = Permission[];
