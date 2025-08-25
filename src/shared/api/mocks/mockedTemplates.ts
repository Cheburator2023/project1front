import { Template } from '../types';

const mockedTemplates: Template[] = [
  {
    user_id: null,
    isOwner: false,
    public: true,
    template_id: 1,
    template_name: 'Реестр рейтинговых систем в соответствии с ПУРС',
    filterModel: {
      system_model_id: {
        values: [
          '000f3c2a-7cc3-11ef-b049-8215a604741b',
          '006dd4c7-8ae0-11ef-b049-8215a604741b',
          '017f21a1-dbb0-11ee-a34a-0a580107025e',
          '01030e39-d206-4dd1-8812-1d0e34f2036e',
          '02c2e00e-ba6f-4512-a19a-80242cb8d80d',
        ],
        filterType: 'set',
      },
      update_date: {
        dateFrom: '2025-01-01 00:00:00',
        dateTo: '2025-08-31 00:00:00',
        filterType: 'date',
        type: 'inRange',
      },
    },
    sortState: [],
    selectedIds: [],
  },
  {
    user_id: null,
    isOwner: false,
    public: true,
    template_id: 2,
    template_name: 'Реестр действующих моделей в соответствии с ПУМР',
    filterModel: {
      active_model: {
        values: ['1'],
        filterType: 'set',
      },
    },
    sortState: [],
    selectedIds: [],
  },
  {
    user_id: null,
    isOwner: false,
    public: true,
    template_id: 3,
    template_name: 'Реестр моделей используемых для расчета RWA',
    filterModel: {
      pvr: {
        values: ['1'],
        filterType: 'set',
      },
    },
    sortState: [],
    selectedIds: [],
  },
  {
    user_id: null,
    isOwner: false,
    public: true,
    template_id: 4,
    template_name: 'Реестр моделей ДАДМ',
    filterModel: {
      ds_stream: {
        values: ['not-null'],
        filterType: 'set',
      },
    },
    sortState: [],
    selectedIds: [],
  },
  {
    user_id: 'test_ds_lead',
    isOwner: true,
    public: false,
    template_id: 29,
    template_name: 'Тестовый шаблон',
    filterModel: {},
    sortState: [],
    selectedIds: [],
  },
  {
    user_id: 'test_ds_lead',
    isOwner: true,
    public: true,
    template_id: 30,
    template_name: 'Тестовый шаблон 27.01',
    filterModel: {
      ds_stream: {
        values: ['not-null'],
        filterType: 'set',
      },
    },
    sortState: [],
    selectedIds: [],
  },
  {
    user_id: 'test_ds_lead',
    isOwner: true,
    public: false,
    template_id: 34,
    template_name: 'Тест шаблон 0904',
    filterModel: {},
    sortState: [],
    selectedIds: [],
  },
  {
    user_id: 'test_ds_lead',
    isOwner: true,
    public: false,
    template_id: 46,
    template_name: 'Тест шаблон 0904 - копия',
    filterModel: {
      developing_end_date: {
        dateFrom: '1970-01-01',
        dateTo: '1970-01-01',
        filterType: 'date',
        type: 'inRange',
      },
    },
    sortState: [],
    selectedIds: [],
  },
  {
    user_id: 'test_validator',
    isOwner: false,
    public: true,
    template_id: 47,
    template_name: '666_not_blank',
    filterModel: {
      developing_end_date: {
        dateFrom: '1970-01-01',
        dateTo: '1970-01-01',
        filterType: 'date',
        type: 'inRange',
      },
    },
    sortState: [],
    selectedIds: [],
  },
  {
    user_id: 'test_validator',
    isOwner: false,
    public: true,
    template_id: 48,
    template_name: '666_blank',
    filterModel: {
      developing_end_date: {
        dateFrom: '1970-01-01',
        dateTo: '1970-01-01',
        filterType: 'date',
        type: 'inRange',
      },
    },
    sortState: [],
    selectedIds: [],
  },
  {
    user_id: 'test_validator',
    isOwner: false,
    public: true,
    template_id: 49,
    template_name: '666_before',
    filterModel: {
      developing_end_date: {
        dateFrom: '2025-07-10',
        dateTo: '2025-07-10',
        filterType: 'date',
        type: 'inRange',
      },
    },
    sortState: [],
    selectedIds: [],
  },
];

export const mockedTemplatesResponse: any[] = mockedTemplates;
export { mockedTemplates };

