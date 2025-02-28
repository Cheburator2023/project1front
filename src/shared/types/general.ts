import { Column as ColumnAdmiral } from '@admiral-ds/react-ui';

type TopFilters = {
  templates: string[];
  tags: string[];
  objectTypeRegistry: string[];
  dates: string[];
  exploitation: string[];
};

enum COLUMN_TYPE {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  QUARTERLY_DATE = 'QUARTERLY_DATE',
  QUARTERLY_FLAG = 'QUARTERLY_FLAG',
  PERCENT_NUMBER = 'PERCENT_NUMBER',
  LINK = 'LINK',
  ACTION = 'ACTION',
}

type ArtificialRow = {
  relations: string | null;
  usage_confirm_date_group: string | null;
  is_rating_system: string | null;
};

type Row = ArtificialRow & {
  system_model_id: string;
  id: string;
  model_source: string;
  rating_model: string | null;
  create_date: string | null;
  date_of_introduction_into_operation: string | null;
  lead_validator_resolution_model_delete: string | null;
  lead_validator_comment_model_delete: string | null;
  model_creator: string | null;
  status: string | null;
  reason_model_delete: string | null;
  usage_confirm_date_q1: string | null;
  usage_confirm_date_q2: string | null;
  usage_confirm_date_q3: string | null;
  usage_confirm_date_q4: string | null;
  usage_confirm_flag_q1: string | null;
  usage_confirm_flag_q2: string | null;
  usage_confirm_flag_q3: string | null;
  usage_confirm_flag_q4: string | null;
  allocation_kib_comment: string | null;
  allocation_smb_comment: string | null;
  allocation_rb_comment: string | null;
  allocation_kc_comment: string | null;
  allocation_other_comment: string | null;
  artefacts_model_id: string | null;
  allocation_kib_usage: string | null;
  allocation_smb_usage: string | null;
  allocation_rb_usage: string | null;
  allocation_kc_usage: string | null;
  allocation_other_usage: string | null;
  root_model_id: string | null;
  model_version_id: string | null;
  auto_validation_result: string | null;
  uuid: string | null;
  model_status: string | null;
  model_status_assignee: string | null;
  pvr: string | null;
  group_company: string | null;
  update_date: string | null;
  model_alias: string | null;
  model_id: string | null;
  model_version: string | null;
  model_version_validation: string | null;
  model_name: string | null;
  model_name_validation: string | null;
  model_desc: string | null;
  model_type: string | null;
  model_risk_type: string | null;
  business_model_risk_subtype: string | null;
  business_customer: string | null;
  business_customer_departament: string | null;
  significance_validity: string | null;
  implementation_validity: string | null;
  model_changes_info: string | null;
  ds_department: string | null;
  developing_end_date: string | null;
  record_id: string | null;
  rating_system_name: string | null;
  regulatory_code_rs_pvr: string | null;
  description_rating_system: string | null;
  identifier_model_algorithm_for_rwa: string | null;
  regulatory_code_model_pvr: string | null;
  internal_model_number: string | null;
  active_model: string | null;
  model_indicator: string | null;
  calibration_version: string | null;
  calibration_date: string | null;
  regulatory_code_of_asset_class: string | null;
  model_id_from_model_owner: string | null;
  classification_rs_algorithm_by_asset_classes: string | null;
  degree_of_regulatory_supervision: string | null;
  materiality_rate: string | null;
  impact_coverage: string | null;
  responsible_for_significance_validity: string | null;
  classification_of_rs_by_order_of_application_within_pvr: string | null;
  credit_risk_component: string | null;
  method_calculation_model_parameter: string | null;
  segment_name: string | null;
  implementation_segment: string | null;
  regulatory_class: string | null;
  regulatory_subclass: string | null;
  goals_using_results_of_work_rs: string | null;
  validity_approve: string | null;
  validity_approve_date: string | null;
  bank_document: string | null;
  rs_model_decommiss_date: string | null;
  remove_decision: string | null;
  remove_date: string | null;
  remove_date_validation: string | null;
  assignment_contractor: string | null;
  developing_start_date: string | null;
  data_source_description: string | null;
  target: string | null;
  calibration_method: string | null;
  developing_report: string | null;
  name_and_version_rating_system: string | null;
  version_it_implementation: string | null;
  responsible_subdivision_and_project_lead_for_it_implementation: string | null;
  date_of_it_introduction_into_operation: string | null;
  psi_protocol: string | null;
  validation_department: string | null;
  plan_validation_type: string | null;
  validation_period: string | null;
  validation_report_approve_date: string | null;
  validation_result: string | null;
  model_name_dadm: string | null;
  validation_result_approve_date: string | null;
  importance_changes: string | null;
  approve_importance: string | null;
  approve_importance_changes: string | null;
  date_submission_to_regulator: string | null;
  decision_date_and_number_of_application_model_for_segment: string | null;
  decision_date_of_application_model_for_segment: string | null;
  decision_number_of_application_model_for_segment: string | null;
  notification_date_and_number_of_application_model_for_segment: string | null;
  notification_date_of_application_model_for_segment: string | null;
  notification_number_of_application_model_for_segment: string | null;
  decision_date_and_number_of_application_model: string | null;
  decision_date_of_application_model: string | null;
  decision_number_of_application_model: string | null;
  notification_date_and_number_of_application_model: string | null;
  notification_date_of_application_model: string | null;
  notification_number_of_application_model: string | null;
  date_and_number_regulator_notification: string | null;
  start_date_of_application_model_approved_regulator: string | null;
  model_crs_code: string | null;
  rfd: string | null;
  ds_stream: string | null;
  model_epic_04: string | null;
  model_epic_04_date: string | null;
  model_epic_05: string | null;
  model_epic_05_date: string | null;
  model_epic_05a: string | null;
  data_completion_of_stage_05a: string | null;
  solution_to_implement_model: string | null;
  business_status: string | null;
  model_epic_07: string | null;
  model_epic_07_date: string | null;
  custom_model_id: string | null;
  custom_model_type: string | null;
  customer_model_id: string | null;
  model_algorithm: string | null;
  release: string | null;
  model_epic_09: string | null;
  model_epic_11: string | null;
  model_epic_11_date: string | null;
  model_epic_12: string | null;
  model_epic_12_date: string | null;
  product_name: string | null;
  developing_model_reason: string | null;
  provides_piloting: string | null;
  operational_monitoring: string | null;
  analytical_monitoring: string | null;
};

type ColumnsFilter = Record<keyof Row, Array<string>>;

type Column = {
  type: COLUMN_TYPE;
  name: keyof Row;
  title: string;
  width?: string;
  sticky?: boolean;
  sortable?: boolean;
  renderCell?: ColumnAdmiral['renderCell'];
};

enum ModelStatus {
  NOT_IMPLEMENTED = 'Не внедряется',
  DEVELOPED_NOT_IMPLEMENTED = 'Разработана, не внедрена',
  IMPLEMENTED_IN_PIM = 'Внедрена в ПИМ',
  IMPLEMENTED_OUTSIDE_PIM = 'Внедрена вне ПИМ',
  NOT_EFFECTIVE = 'Модель не эффективна в БП заказчика',
  DECOMMISSIONED = 'Вывод модели из эксплуатации',
  IN_IMPLEMENTATION = 'Внедряется',
}

enum ModelSource {
  SUM_RM = 'sum-rm',
  SUM = 'sum',
}

export {
  COLUMN_TYPE,
  Row,
  ArtificialRow,
  Column,
  ColumnsFilter,
  TopFilters,
  ModelSource,
  ModelStatus,
};

