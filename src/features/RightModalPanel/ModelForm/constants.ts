import { Row } from '@src/shared/types';
import { CUSTOMER_MAP } from '@src/shared/constants/customers';
import { FormFieldsSchema } from '../types';

export const MONTHS_IN_QUARTER = 3;
export const ADDITIONAL_DAYS_OUT_QUARTER = 10;
export const ALLOCATION_FIELDS_NAMES: Array<keyof Row> = [
  'usage_confirm_date_q1',
  'usage_confirm_date_q2',
  'usage_confirm_date_q3',
  'usage_confirm_date_q4',
  'usage_confirm_flag_q1',
  'usage_confirm_flag_q2',
  'usage_confirm_flag_q3',
  'usage_confirm_flag_q4',
  'allocation_kib_usage',
  'allocation_smb_usage',
  'allocation_rb_usage',
  'allocation_kc_usage',
  'allocation_other_usage',
  'allocation_kib_comment',
  'allocation_smb_comment',
  'allocation_rb_comment',
  'allocation_kc_comment',
  'allocation_other_comment',
];
export const ALLOCATION_FIELDS_NAMES_USAGE: Array<keyof Row> = [
  'allocation_kib_usage',
  'allocation_smb_usage',
  'allocation_rb_usage',
  'allocation_kc_usage',
  'allocation_other_usage',
];

type SchemaNameMap = {
  [key: string]: {
    title: string;
    schemaOrder: number;
    key: string;
  };
};

export const SCHEMA_NAME_MAP: SchemaNameMap = {
  BASE_MODEL_SCHEMA: { key: 'BASE_MODEL_SCHEMA', title: 'Базовые атрибуты', schemaOrder: 2 },
  ACTIVE_MODEL_SCHEMA: {
    key: 'ACTIVE_MODEL_SCHEMA',
    title: 'Активные атрибуты',
    schemaOrder: 1,
  },
  NOT_ACTIVE_MODEL_SCHEMA: {
    key: 'NOT_ACTIVE_MODEL_SCHEMA',
    title: 'Атрибуты неактивной модели',
    schemaOrder: 3,
  },
  RATING_SYSTEM_MODEL_SCHEMA: {
    key: 'RATING_SYSTEM_MODEL_SCHEMA',
    title: 'Атрибуты рейтинговой системы',
    schemaOrder: 4,
  },
  RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA: {
    key: 'RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA',
    title: 'Атрибуты рейтинговой системы, подлежащей согласованию Регулятором',
    schemaOrder: 5,
  },
  REST_MODEL_SCHEMA: { key: 'REST_MODEL_SCHEMA', title: 'Прочие атрибуты', schemaOrder: 8 },
  VALIDATION_MODEL_SCHEMA: {
    key: 'VALIDATION_MODEL_SCHEMA',
    title: 'Атрибуты валидации',
    schemaOrder: 9,
  },
};

export const BASE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'model_name_validation',
    required: true,
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'model_desc',
    required: true,
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'business_customer',
    required: true,
    maxLength: 255,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'business_customer_departament',
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'group_company',
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'significance_validity',
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'model_name',
    required: false,
    maxLength: 250,
    customers: [CUSTOMER_MAP.DADM],
  },
  {
    name: 'ds_department',
    required: false,
    maxLength: 255,
    customers: [CUSTOMER_MAP.DADM, CUSTOMER_MAP.UMRV],
  },
  {
    name: 'ds_stream',
    customers: [CUSTOMER_MAP.DADM],
    required: false,
  },
  {
    name: 'product_name',
    customers: [CUSTOMER_MAP.DADM],
    required: false,
  },
  {
    name: 'developing_model_reason',
    customers: [CUSTOMER_MAP.DADM],
    required: false,
  },
  {
    name: 'model_algorithm',
    customers: [CUSTOMER_MAP.DADM],
    required: false,
  },
  {
    name: 'rfd',
    required: false,
    customers: [CUSTOMER_MAP.DADM],
    maxLength: 250,
  },
  {
    name: 'provides_piloting',
    customers: [CUSTOMER_MAP.DADM],
    required: false,
  },
  {
    name: 'operational_monitoring',
    customers: [CUSTOMER_MAP.DADM],
    required: false,
  },
  {
    name: 'analytical_monitoring',
    customers: [CUSTOMER_MAP.DADM],
    required: false,
  },
  {
    name: 'target',
    required: false,
    customers: [CUSTOMER_MAP.DADM],
    maxLength: 100,
  },
  {
    name: 'model_changes_info',
    required: false,
    customers: [CUSTOMER_MAP.DADM],
    maxLength: 250,
  },
];

export const ACTIVE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'model_name_validation',
    required: true,
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'group_company',
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'model_type',
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'model_desc',
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'significance_validity',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: true,
    valueConditions: [
      {
        value: 'Высокая',
        conditions: [
          {
            classification_of_rs_by_order_of_application_within_pvr:
              'Рейтинговые системы, подлежащие согласованию Регулятором',
          },
        ],
      },
    ],
  },
  {
    name: 'business_model_risk_subtype',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: false,
    maxLength: 250,
  },
  {
    name: 'responsible_for_significance_validity',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: true,
    maxLength: 250,
  },
  {
    name: 'implementation_segment',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: true,
    maxLength: 250,
  },
  {
    name: 'business_customer',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: true,
    maxLength: 250,
  },
  {
    name: 'business_customer_departament',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: true,
  },
  {
    name: 'implementation_validity',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: true,
  },
  {
    name: 'validity_approve',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: true,
    maxLength: 250,
  },
  {
    name: 'ds_department',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: true,
    maxLength: 250,
  },
  {
    name: 'developing_report',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: true,
    maxLength: 250,
  },
  {
    name: 'model_risk_type',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    required: true,
    maxLength: 250,
  },
  ///
  {
    name: 'rating_model',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
      },
    ],
    valueConditions: [
      {
        value: 'Да',
        conditions: [{ model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' }],
      },
    ],
    disabledConditions: [
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
      },
    ],
    enabledByValueConditions: [
      {
        value: 'Да',
        conditions: [{ model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' }],
      },
    ],
    maxLength: 250,
  },
  {
    name: 'model_version',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'model_changes_info',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
    maxLength: 250,
  },
  {
    name: 'developing_end_date',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'model_id',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'update_date',
    required: false,
    alwaysDisabled: true,
    customers: [CUSTOMER_MAP.UMRV],
  },
];

export const NOT_ACTIVE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'remove_date_validation',
    requireConditions: ['wasPreviouslyActiveModel'],
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
  {
    name: 'remove_decision',
    requireConditions: ['wasPreviouslyActiveModel'],
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
];

export const RATING_SYSTEM_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'rating_system_name',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  {
    name: 'classification_of_rs_by_order_of_application_within_pvr',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  /// Степень регуляторного надзора
  {
    name: 'degree_of_regulatory_supervision',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
    optionConditions: [
      {
        // Уровень значимости Модели
        connected_field: 'significance_validity',
        value: 'Высокая',
        options: ['Высокая', 'Средняя'],
      },
    ],
    autoCompleteConditions: [
      {
        value: 'Высокая',
        conditions: [
          {
            significance_validity: 'Высокая',
          },
        ],
      },
    ],
    valueConditions: [
      {
        value: 'Высокая',
        conditions: [
          {
            model_type: 'Модели ВПОДК',
            model_risk_type: 'Кредитный риск',
            classification_of_rs_by_order_of_application_within_pvr:
              'Рейтинговые системы, подлежащие согласованию Регулятором',
          },
          {
            model_type: 'Риск-модели',
            model_risk_type: 'Кредитный риск',
            rating_model: 'Да',
            classification_of_rs_by_order_of_application_within_pvr:
              'Рейтинговые системы, подлежащие согласованию Регулятором',
          },
        ],
      },
    ],
  },
  {
    // уровень значимости
    name: 'significance_validity',
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    valueConditions: [
      {
        value: 'Высокая',
        conditions: [
          {
            classification_of_rs_by_order_of_application_within_pvr:
              'Рейтинговые системы, подлежащие согласованию Регулятором',
          },
        ],
      },
    ],
  },
  {
    name: 'description_rating_system',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  {
    name: 'model_indicator',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  {
    name: 'calibration_version',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  {
    name: 'calibration_date',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  {
    name: 'materiality_rate',
    // Уровень материальности
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск', impact_coverage: '' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
        impact_coverage: '',
      },
    ],
    valueConditions: [
      {
        value: 'Высокий',
        conditions: [
          {
            significance_validity: 'Высокая',
            degree_of_regulatory_supervision: 'Средняя',
            impact_coverage: '',
          },
        ],
      },
      {
        value: '',
        conditions: [
          {
            impact_coverage: 'Высокий',
          },
          {
            impact_coverage: 'Средний',
          },
          {
            impact_coverage: 'Низкий',
          },
        ],
      },
    ],
  },
  {
    name: 'impact_coverage',
    // охват последствий
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск', materiality_rate: '' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
        materiality_rate: '',
      },
    ],
    valueConditions: [
      {
        value: 'Высокий',
        conditions: [
          {
            significance_validity: 'Высокая',
            degree_of_regulatory_supervision: 'Средняя',
            materiality_rate: '',
          },
        ],
      },
      {
        value: '',
        conditions: [
          {
            materiality_rate: 'Высокий',
          },
          {
            materiality_rate: 'Средний',
          },
          {
            materiality_rate: 'Низкий',
          },
        ],
      },
    ],
  },
  {
    name: 'model_id_from_model_owner',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  {
    name: 'classification_rs_algorithm_by_asset_classes',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  {
    name: 'credit_risk_component',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  {
    name: 'goals_using_results_of_work_rs',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  {
    name: 'name_and_version_rating_system',
    maxLength: 250,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
  {
    name: 'identifier_model_algorithm_for_rwa',
    required: false,
    maxLength: 250,
  },
  {
    name: 'segment_name',
    required: false,
    maxLength: 250,
  },
  {
    name: 'bank_document',
    required: false,
    maxLength: 250,
  },
  {
    name: 'data_source_description',
    required: false,
    maxLength: 250,
  },
  {
    name: 'target',
    required: false,
    maxLength: 250,
  },
  {
    name: 'calibration_method',
    required: false,
    maxLength: 250,
  },
  {
    name: 'version_it_implementation',
    required: false,
    maxLength: 250,
  },
  {
    name: 'responsible_subdivision_and_project_lead_for_it_implementation',
    required: false,
    maxLength: 250,
  },
  {
    name: 'date_of_it_introduction_into_operation',
    required: false,
    maxLength: 250,
  },
  {
    name: 'psi_protocol',
    required: false,
    maxLength: 250,
  },
  {
    name: 'developing_start_date',
    required: false,
    maxLength: 250,
  },
  {
    name: 'developing_end_date',
    required: false,
    maxLength: 250,
  },
];

export const RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'regulatory_code_rs_pvr',
    maxLength: 250,
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      {
        model_type: 'Модели ВПОДК',
        model_risk_type: 'Кредитный риск',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию Регулятором',
      },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию Регулятором',
      },
    ],
  },
  {
    name: 'regulatory_code_model_pvr',
    maxLength: 250,
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      {
        model_type: 'Модели ВПОДК',
        model_risk_type: 'Кредитный риск',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию Регулятором',
      },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию Регулятором',
      },
    ],
  },
  {
    name: 'internal_model_number',
    maxLength: 250,
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      {
        model_type: 'Модели ВПОДК',
        model_risk_type: 'Кредитный риск',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию Регулятором',
      },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию Регулятором',
      },
    ],
  },
  {
    name: 'regulatory_class',
    maxLength: 250,
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      {
        model_type: 'Модели ВПОДК',
        model_risk_type: 'Кредитный риск',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию Регулятором',
      },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию Регулятором',
      },
    ],
  },
  {
    name: 'regulatory_subclass',
    maxLength: 250,
    required: true,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
    requireConditions: [
      {
        model_type: 'Модели ВПОДК',
        model_risk_type: 'Кредитный риск',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию Регулятором',
      },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию Регулятором',
      },
    ],
  },
  {
    name: 'regulatory_code_of_asset_class',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'method_calculation_model_parameter',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'importance_changes',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'approve_importance',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'approve_importance_changes',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'date_and_number_regulator_notification',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'date_submission_to_regulator',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'decision_date_and_number_of_application_model_for_segment',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'notification_date_and_number_of_application_model_for_segment',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },

  {
    name: 'decision_date_and_number_of_application_model',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'notification_date_and_number_of_application_model',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'start_date_of_application_model_approved_regulator',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
];

export const VALIDATION_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'validation_department',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },

  {
    name: 'plan_validation_type',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'validation_period',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'validation_report_approve_date',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'validation_result',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'auto_validation_result',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'validation_result_approve_date',
    required: false,
    customers: [CUSTOMER_MAP.UMRV],
  },
  {
    name: 'model_risk_coefficient',
    required: false,
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DIUR, CUSTOMER_MAP.DADM],
  },
];

const REST_MODEL_SCHEMA_BASE: FormFieldsSchema = [
  {
    name: 'rs_model_decommiss_date',
    customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
  },
];

export const REST_MODEL_SCHEMA: FormFieldsSchema = [
  ...ACTIVE_MODEL_SCHEMA,
  ...RATING_SYSTEM_MODEL_SCHEMA,
  ...RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA,
  ...REST_MODEL_SCHEMA_BASE,
].map((item) => ({
  name: item.name,
  maxLength: item.maxLength,
  required: false,
  alwaysDisabled: item.alwaysDisabled,
  customers: [CUSTOMER_MAP.UMRV, CUSTOMER_MAP.DADM],
}));

