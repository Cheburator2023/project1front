import { Role } from '@shared/types';

export type CsvEditRoleFlags = {
  isValidatorLead?: boolean;
  isValidator?: boolean;
  isBusinessCustomer?: boolean;
  isDsLead?: boolean;
};

/**
 * Поля, которые по требованиям матрицы должны быть НЕдоступны роли на конкретном source,
 * даже если артефактная матрица на бэке вернула is_editable_by_role_* = 1. Проверяется
 * раньше allow-правил ниже. Ключ bucket совпадает с результатом getModelSourceAccessBucket.
 */
export const CSV_DENY_RULES_BY_ROLE_AND_BUCKET: Partial<
  Record<Role, Partial<Record<'sum' | 'sum_rm', string[]>>>
> = {
  [Role.BUSINESS_CUSTOMER]: {
    sum: ['developing_report'],
  },
  [Role.DS_LEAD]: {
    sum_rm: [
      'model_epic_12_date',
      'dev_team',
      'model_desc',
      'model_epic_12',
      'project_ref',
    ],
  },
};

/**
 * Поля, которые по требованиям матрицы должны быть доступны роли на конкретном source,
 * даже если API артефактной матрицы вернул is_editable_by_role_* = 0. Применяются после
 * deny-правил и до общих allow-правил ниже (CSV_EDIT_RULES_BY_ROLE). Полезны там, где
 * allow для bucket несимметричен (напр. разрешить только SUM, не трогая SUM-RM).
 */
export const CSV_ALLOW_RULES_BY_ROLE_AND_BUCKET: Partial<
  Record<Role, Partial<Record<'sum' | 'sum_rm', string[]>>>
> = {
  [Role.DS_LEAD]: {
    sum: [
      'operational_control_epic',
      'analytical_control_epic',
      'model_values_control_epic',
      'impact_assessment_epic',
    ],
  },
};

export const CSV_EDIT_RULES_BY_ROLE: Record<string, string[]> = {
  [Role.VALIDATOR_LEAD]: [
    'implementation_segment',
    'remove_decision',
    'segment_name',
    'validation_report_approve_date',
  ],
  [Role.VALIDATOR]: [
    'implementation_segment',
    'remove_decision',
    'segment_name',
    'validation_report_approve_date',
  ],
  [Role.BUSINESS_CUSTOMER]: ['implementation_segment', 'remove_decision', 'segment_name'],
  [Role.DS_LEAD]: [
    'model_epic_04_date',
    'model_epic_05a',
    'model_epic_07',
    'customer_model_id',
    'model_epic_09',
    'model_epic_11_date',
    'output_table',
    'allocation_assessment_parameters',
    'runtime_subsystem',
    'developing_end_date',
    'rs_model_decommiss_date',
    'developing_start_date',
    'model_epic_04',
    'model_epic_05',
    'data_completion_of_stage_05a',
    'model_epic_07_date',
    'release',
    'model_epic_11',
    'date_of_introduction_into_operation',
    'allocation_assessment_class',
    'deploy_team',
    'buiseness_process_name',
    'deploy_system',
  ],
};

export function csvMatchedRoles(flags: CsvEditRoleFlags): Role[] {
  const roleFlagsToRole: Array<{ enabled?: boolean; role: Role }> = [
    { enabled: flags.isValidatorLead, role: Role.VALIDATOR_LEAD },
    { enabled: flags.isValidator, role: Role.VALIDATOR },
    { enabled: flags.isBusinessCustomer, role: Role.BUSINESS_CUSTOMER },
    { enabled: flags.isDsLead, role: Role.DS_LEAD },
  ];

  return roleFlagsToRole.filter((i) => i.enabled).map((i) => i.role);
}
