import { FormFieldsSchema } from './types';

export const MONTHS_IN_QUARTER = 3;
export const ADDITIONAL_DAYS_OUT_QUARTER = 10;

export const BASE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'active_model',
    required: true,
    maxLength: 250,
  },
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
    name: 'model_name',
    required: true,
    maxLength: 250,
  },
  {
    name: 'model_desc',
    required: true,
    maxLength: 250,
  },
  {
    name: 'group_company',
    required: true,
  },
  {
    name: 'model_type',
    required: true,
    requireConditions: [
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
      },
    ],
  },
  {
    name: 'significance_validity',
    required: true,
    valueConditions: [
      {
        value: 'Высокая',
        conditions: [
          {
            classification_of_rs_by_order_of_application_within_pvr:
              'Рейтинговые системы, подлежащие согласованию с Регулятором',
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
    name: 'is_rating_system', // should be select with two options: 'yes'/'no'
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
    // autoValueOnSave: [
    //   {
    //     value: 'Да',
    //     conditions: [{ model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск' }],
    //   },
    // ],
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
        is_rating_system: '1',
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
        is_rating_system: '1',
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
        is_rating_system: '1',
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
        is_rating_system: '1',
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
        is_rating_system: '1',
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
        is_rating_system: '1',
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
              'Рейтинговые системы, подлежащие согласованию с Регулятором',
          },
          {
            model_type: 'Риск-модели',
            model_risk_type: 'Кредитный риск',
            is_rating_system: '1',
            classification_of_rs_by_order_of_application_within_pvr:
              'Рейтинговые системы, подлежащие согласованию с Регулятором',
          },
          { significance_validity: 'Высокая' },
        ],
      },
      {
        value: 'Средняя',
        conditions: [{ significance_validity: 'Высокая' }],
      },
    ],
  },
  {
    name: 'materiality_rate',
    maxLength: 250,
    requireConditions: [
      { model_type: 'Модели ВПОДК', model_risk_type: 'Кредитный риск', impact_coverage: '' },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        is_rating_system: '1',
        impact_coverage: '',
      },
    ],
    valueConditions: [
      {
        value: 'Высокая',
        conditions: [
          {
            significance_validity: 'Высокая',
            degree_of_regulatory_supervision: 'Средняя',
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
        is_rating_system: '1',
        materiality_rate: '',
      },
    ],
    valueConditions: [
      {
        value: 'Высокая',
        conditions: [
          {
            significance_validity: 'Высокая',
            degree_of_regulatory_supervision: 'Средняя',
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
        is_rating_system: '1',
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
        is_rating_system: '1',
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
        is_rating_system: '1',
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
        is_rating_system: '1',
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
        is_rating_system: '1',
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
        is_rating_system: '1',
      },
    ],
  },
];

export const RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA: FormFieldsSchema = [
  {
    name: 'regulatory_code_rs_pvr',
    maxLength: 250,
    requireConditions: [
      {
        model_type: 'Модели ВПОДК',
        model_risk_type: 'Кредитный риск',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию с Регулятором',
      },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        is_rating_system: '1',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию с Регулятором',
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
          'Рейтинговые системы, подлежащие согласованию с Регулятором',
      },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        is_rating_system: '1',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию с Регулятором',
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
          'Рейтинговые системы, подлежащие согласованию с Регулятором',
      },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        is_rating_system: '1',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию с Регулятором',
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
          'Рейтинговые системы, подлежащие согласованию с Регулятором',
      },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        is_rating_system: '1',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию с Регулятором',
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
          'Рейтинговые системы, подлежащие согласованию с Регулятором',
      },
      {
        model_type: 'Риск-модели',
        model_risk_type: 'Кредитный риск',
        is_rating_system: '1',
        classification_of_rs_by_order_of_application_within_pvr:
          'Рейтинговые системы, подлежащие согласованию с Регулятором',
      },
    ],
  },
];
