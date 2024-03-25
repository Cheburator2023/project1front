import { Column as ColumnAdmiral } from '@admiral-ds/react-ui';

enum COLUMN_TYPE {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  LINK = 'LINK',
}

type Row = {
  id: string;
  root_model_id: string;
  model_source: string;
  auto_validation_result: string;
  uuid: string;
  model_status: string;
  model_status_assignee: string;
  pvr: string;
  system_model_id: string;
  group_company: string;
  update_date: string;
  model_alias: string;
  model_id: string;
  model_version: string;
  model_name: string;
  model_desc: string;
  model_type: string;
  model_risk_type: string;
  business_customer: string;
  business_customer_departament: string;
  significance_validity: string;
  implementation_validity: string;
  model_changes_info: string;
  ds_department: string;
  developing_end_date: string;
  record_id: string;
  rating_system_name: string;
  regulatory_code_rs_pvr: string;
  description_rating_system: string;
  identifier_model_algorithm_for_rwa: string;
  regulatory_code_model_pvr: string;
  internal_model_number: string;
  active_model: string;
  model_indicator: string;
  calibration_version: string;
  calibration_date: string;
  regulatory_code_of_asset_class: string;
  model_id_from_model_owner: string;
  classification_rs_algorithm_by_asset_classes: string;
  degree_of_regulatory_supervision: string;
  materiality_rate: string;
  impact_coverage: string;
  responsible_for_significance_validity: string;
  classification_of_rs_by_order_of_application_within_pvr: string;
  credit_risk_component: string;
  method_calculation_model_parameter: string;
  segment_name: string;
  implementation_segment: string;
  regulatory_class: string;
  regulatory_subclass: string;
  goals_using_results_of_work_rs: string;
  validity_approve: string;
  validity_approve_date: string;
  bank_document: string;
  remove_date: string;
  remove_decision: string;
  assignment_contractor: string;
  developing_start_date: string;
  data_source_description: string;
  target: string;
  calibration_method: string;
  analize_text_about_developing: string;
  name_and_version_rating_system: string;
  version_it_implementation: string;
  responsible_subdivision_and_project_lead_for_it_implementation: string;
  date_of_it_introduction_into_operation: string;
  psi_protocol: string;
  validation_department: string;
  plan_validation_type: string;
  validation_period: string;
  validation_report_approve_date: string;
  validation_result: string;
  validation_result_approve_date: string;
  importance_changes: string;
  approve_importance: string;
  approve_importance_changes: string;
  date_submission_to_regulator: string;
  decision_date_and_number_of_application_model_for_segment: string;
  decision_date_of_application_model_for_segment: string;
  decision_number_of_application_model_for_segment: string;
  notification_date_and_number_of_application_model_for_segment: string;
  notification_date_of_application_model_for_segment: string;
  notification_number_of_application_model_for_segment: string;
  decision_date_and_number_of_application_model: string;
  decision_date_of_application_model: string;
  decision_number_of_application_model: string;
  notification_date_and_number_of_application_model: string;
  notification_date_of_application_model: string;
  notification_number_of_application_model: string;
  date_and_number_regulator_notification: string;
  start_date_of_application_model_approved_regulator: string;
  model_crs_code: string;
  rfd: string;
  model_name_dadm: string;
  ds_stream: string;
  model_epic_04: string;
  model_epic_04_date: string;
  model_epic_05: string;
  model_epic_05a: string;
  data_completion_of_stage_05a: string;
  solution_to_implement_model: string;
  model_epic_07: string;
  model_epic_07_date: string;
  custom_model_id: string;
  custom_model_type: string;
  release: string;
  model_epic_09: string;
  model_epic_11: string;
  model_epic_11_date: string;
  model_epic_12: string;
  model_epic_12_date: string;
  product_name: string;
  developing_model_reason: string;
  provides_piloting: string;
  operational_monitoring: string;
  analytical_monitoring: string;
};

type ColumnsFilter = Record<keyof Row, Array<string>>;

type Column = {
  type: COLUMN_TYPE;
  name: keyof Row;
  title: string;
  renderCell?: ColumnAdmiral['renderCell'];
};

export { COLUMN_TYPE, Row, Column, ColumnsFilter };
