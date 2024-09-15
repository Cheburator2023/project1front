import { FormFieldsSchema } from './types';

export const MONTHS_IN_QUARTER = 3;
export const ADDITIONAL_DAYS_OUT_QUARTER = 10;

export const BASE_MODEL_SCHEMA: FormFieldsSchema = [
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
    name: 'custom_model_type',
    required: false,
  },
  {
    name: 'significance_validity',
    required: true,
  },
  {
    name: 'provides_piloting',
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

export const ACTIVE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'model_type',
    requireConditions: [
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
      },
    ],
  },
  {
    name: 'model_desc',
    requireConditions: [
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
      },
    ],
  },
  {
    name: 'model_indicator',
    required: true,
  },
  {
    name: 'significance_validity',
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
    name: 'responsible_for_significance_validity',
    required: true,
    maxLength: 250,
  },
  {
    name: 'implementation_segment',
    required: true,
    maxLength: 250,
  },
  {
    name: 'business_customer',
    required: true,
    maxLength: 250,
  },
  {
    name: 'business_customer_departament',
    required: true,
  },
  {
    name: 'implementation_validity',
    required: true,
  },
  {
    name: 'validity_approve',
    required: true,
    maxLength: 250,
  },
  {
    name: 'ds_department',
    required: true,
    maxLength: 250,
  },
  {
    name: 'analize_text_about_developing',
    required: true,
    maxLength: 250,
  },
  {
    name: 'model_risk_type',
    required: true,
  },
  {
    name: 'rating_model',
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
    maxLength: 250,
  },
];

export const NOT_ACTIVE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'remove_date',
    required: true,
  },
  {
    name: 'remove_decision',
    required: true,
    maxLength: 250,
  },
];

export const RATING_SYSTEM_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'rating_system_name',
    maxLength: 250,
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
    name: 'description_rating_system',
    maxLength: 250,
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
    name: 'degree_of_regulatory_supervision',
    maxLength: 250,
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
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
      {
        value: 'Низкая',
        conditions: [
          {
            significance_validity: 'Средняя',
          },
          {
            significance_validity: 'Низкая',
          },
        ],
      },
    ],
  },
  {
    name: 'materiality_rate', // Проверить кейс
    maxLength: 250,
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
    maxLength: 250,
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
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        rating_model: 'Да',
      },
    ],
  },
];

// TODO: add transition to next schema
export const RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'regulatory_code_rs_pvr',
    maxLength: 250,
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
];
