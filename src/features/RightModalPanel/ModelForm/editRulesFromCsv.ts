import { Role } from '@shared/types';

export type CsvEditRoleFlags = {
  isValidatorLead?: boolean;
  isValidator?: boolean;
  isBusinessCustomer?: boolean;
  isDsLead?: boolean;
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
