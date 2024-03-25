import { Artifact, ArtifactResponse, ArtifactType } from '../types';

const mockedArtifacts: Artifact[] = [
  {
    artefact_id: 50,
    artefact_label: 'Калибровка/тип калибровки',
    artefact_desc: 'Укажите тип калибровки',
    artefact_tech_label: 'calibration_version',
    artefact_type_desc: ArtifactType.TEXT,
    artefact_type_id: 1,
    task_name: 'Разработка модели',
    is_main_info_flg: '0',
    is_class_flg: 0,
    bpmn_name: 'model',
    values: [],
  },
  {
    artefact_id: 51,
    artefact_label: 'Номер модели',
    artefact_desc: 'Укажите номер модели',
    artefact_tech_label: 'internal_model_number',
    artefact_type_desc: ArtifactType.NUMBER,
    artefact_type_id: 1,
    is_main_info_flg: '0',
    is_class_flg: 0,
    values: [],
  },
  {
    artefact_id: 63,
    artefact_label: 'Плановая дата внедрении',
    artefact_desc: 'Укажите плановую дату внедрения',
    artefact_tech_label: 'date_of_it_introduction_into_operation',
    artefact_type_desc: ArtifactType.DATE,
    artefact_type_id: 4,
    task_name: 'Заполнение информации',
    is_main_info_flg: '1',
    is_class_flg: 0,
    bpmn_name: 'initialization',
    values: [],
  },
  {
    artefact_id: 71,
    artefact_label: 'Действующая модель/ модуль',
    artefact_desc: 'Действующая модель?',
    artefact_tech_label: 'active_model',
    artefact_type_desc: ArtifactType.BOOLEAN,
    artefact_type_id: 6,
    task_name: 'Заполнение информации',
    is_main_info_flg: '0',
    is_class_flg: 0,
    bpmn_name: 'initialization',
    values: [],
  },
  {
    artefact_id: 6,
    artefact_tech_label: 'business_customer_departament',
    artefact_label: 'Подразделение бизнес-заказчика / Вадельца модели',
    artefact_desc: 'Выбрать Подразделение бизнес-заказчика / Вадельца модели',
    artefact_hint:
      'Выбирается одно из значений списка. Соответствует пункту «Подразделение-инициатор/заказчик модели» Заявки на разработку модели. <br />  <b>Важно!</b> Значение входит в первичный ключ карточки модели и не может быть изменено на следующих шагах.',
    is_class_flg: 1,
    is_multi_fill_flg: 0,
    artefact_type_desc: ArtifactType.MULTI_DROPDOWN,
    values: [
      {
        artefact_value_id: 237,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент брокерского обслуживания',
      },
      {
        artefact_value_id: 238,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент инвестиционных продуктов',
      },
      {
        artefact_value_id: 239,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент координации и анализа бизнеса',
      },
      {
        artefact_value_id: 240,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент операций на рынке акций',
      },
      {
        artefact_value_id: 241,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент по работе с клиентами базовых отраслей',
      },
      {
        artefact_value_id: 242,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент по работе с клиентами рыночных отраслей',
      },
      {
        artefact_value_id: 243,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент транзакционного бизнеса',
      },
      {
        artefact_value_id: 244,
        artefact_parent_value_id: null,
        artefact_value: 'Кредитный департамент',
      },
      {
        artefact_value_id: 245,
        artefact_parent_value_id: null,
        artefact_value: 'Управление координации строительных проектов',
      },
      {
        artefact_value_id: 246,
        artefact_parent_value_id: null,
        artefact_value: 'Управление обслуживания приоритетных клиентов',
      },
      {
        artefact_value_id: 247,
        artefact_parent_value_id: null,
        artefact_value: 'Управление структурных продуктов и структурирования',
      },
      {
        artefact_value_id: 248,
        artefact_parent_value_id: null,
        artefact_value: 'Депозитарий',
      },
      {
        artefact_value_id: 249,
        artefact_parent_value_id: null,
        artefact_value: 'Группа по развитию и координации международного бизнеса',
      },
      {
        artefact_value_id: 250,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент анализа, координации и продуктового развития',
      },
      {
        artefact_value_id: 251,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент корпоративного цифрового бизнеса',
      },
      {
        artefact_value_id: 252,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент кредитования регионального бизнеса',
      },
      {
        artefact_value_id: 253,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент регионального корпоративного бизнеса',
      },
      {
        artefact_value_id: 254,
        artefact_parent_value_id: null,
        artefact_value: 'Управление по работе с залоговыми активами и урегулирования задолженности',
      },
      {
        artefact_value_id: 255,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент администрирования региональной сети',
      },
      {
        artefact_value_id: 256,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент клиентского обслуживания',
      },
      {
        artefact_value_id: 257,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент по работе с обращениями клиентов',
      },
      {
        artefact_value_id: 258,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент по работе с премиальными клиентами',
      },
      {
        artefact_value_id: 259,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент по работе с состоятельными клиентами',
      },
      {
        artefact_value_id: 260,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент развития и координации розничного бизнеса',
      },
      {
        artefact_value_id: 261,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент розничного бизнеса',
      },
      {
        artefact_value_id: 262,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент финансового урегулирования',
      },
      {
        artefact_value_id: 263,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент розничного CRM',
      },
      {
        artefact_value_id: 264,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент розничных продуктов',
      },
      {
        artefact_value_id: 265,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент цифрового бизнеса',
      },
      {
        artefact_value_id: 266,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент эквайринга',
      },
      {
        artefact_value_id: 267,
        artefact_parent_value_id: null,
        artefact_value: 'Управление развития розничного бизнеса в дочерних компаниях',
      },
      {
        artefact_value_id: 268,
        artefact_parent_value_id: null,
        artefact_value: 'Управление «Автокредитование»',
      },
      {
        artefact_value_id: 269,
        artefact_parent_value_id: null,
        artefact_value: 'Управление «Дебетовые карты и счета»',
      },
      {
        artefact_value_id: 270,
        artefact_parent_value_id: null,
        artefact_value: 'Управление «Зарплатные проекты»',
      },
      {
        artefact_value_id: 271,
        artefact_parent_value_id: null,
        artefact_value: 'Управление «Ипотечное кредитование»',
      },
      {
        artefact_value_id: 272,
        artefact_parent_value_id: null,
        artefact_value: 'Управление «Кредитные карты»',
      },
      {
        artefact_value_id: 273,
        artefact_parent_value_id: null,
        artefact_value: 'Управление «Потребительское кредитование»',
      },
      {
        artefact_value_id: 274,
        artefact_parent_value_id: null,
        artefact_value: 'Управление «Сбережения»',
      },
      {
        artefact_value_id: 275,
        artefact_parent_value_id: null,
        artefact_value: 'Аппарат президента - председателя правления',
      },
      {
        artefact_value_id: 276,
        artefact_parent_value_id: null,
        artefact_value: 'Административный департамент',
      },
      {
        artefact_value_id: 277,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент по обеспечению безопасности',
      },
      {
        artefact_value_id: 278,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент внутреннего аудита',
      },
      {
        artefact_value_id: 279,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент залогов',
      },
      {
        artefact_value_id: 280,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент комплаенс-контроля и финансового мониторинга',
      },
      {
        artefact_value_id: 281,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент маркетинга и рекламы',
      },
      {
        artefact_value_id: 282,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент непрофильных и проблемных активов',
      },
      {
        artefact_value_id: 283,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент операционной поддержки бизнеса',
      },
      {
        artefact_value_id: 284,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент по работе с персоналом',
      },
      {
        artefact_value_id: 285,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент по работе со СМИ',
      },
      {
        artefact_value_id: 286,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент корпоративных кредитных рисков',
      },
      {
        artefact_value_id: 287,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент розничных кредитных рисков',
      },
      {
        artefact_value_id: 288,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент интегрированного управления рисками',
      },
      {
        artefact_value_id: 289,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент стратегии и корпоративного развития',
      },
      {
        artefact_value_id: 290,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент учета и отчетности',
      },
      {
        artefact_value_id: 291,
        artefact_parent_value_id: null,
        artefact_value: 'Управление сопровождения маркетинга и коммуникаций',
      },
      {
        artefact_value_id: 292,
        artefact_parent_value_id: null,
        artefact_value: 'Управление специального информационного обеспечения',
      },
      {
        artefact_value_id: 293,
        artefact_parent_value_id: null,
        artefact_value: 'Финансовый департамент',
      },
      {
        artefact_value_id: 294,
        artefact_parent_value_id: null,
        artefact_value: 'Юридический департамент',
      },
      {
        artefact_value_id: 295,
        artefact_parent_value_id: null,
        artefact_value: 'Группа контролера профессионального участника рынка ценных бумаг',
      },
      {
        artefact_value_id: 296,
        artefact_parent_value_id: null,
        artefact_value:
          'Управление корпоративной социальной ответственности и событийного маркетинга',
      },
      {
        artefact_value_id: 297,
        artefact_parent_value_id: null,
        artefact_value: 'Управление «Центр качества клиентского опыта»',
      },
      {
        artefact_value_id: 298,
        artefact_parent_value_id: null,
        artefact_value: 'Специальный отдел',
      },
      {
        artefact_value_id: 299,
        artefact_parent_value_id: null,
        artefact_value: 'Управление «Центр инноваций»',
      },
      {
        artefact_value_id: 300,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент анализа данных и моделирования',
      },
      {
        artefact_value_id: 301,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент технологического развития корпоративного бизнеса',
      },
      {
        artefact_value_id: 302,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент технологического развития общебанковских систем',
      },
      {
        artefact_value_id: 303,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент технологического развития розничного бизнеса',
      },
      {
        artefact_value_id: 304,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент технологического развития систем поддержки бизнеса',
      },
      {
        artefact_value_id: 305,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент управления и координации технологических изменений',
      },
      {
        artefact_value_id: 306,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент поддержки прикладных систем и сервисов',
      },
      {
        artefact_value_id: 307,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент развития инфраструктуры',
      },
      {
        artefact_value_id: 308,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент ИТ-архитектуры',
      },
      {
        artefact_value_id: 571,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент по работе с массовым сегментом',
      },
      {
        artefact_value_id: 572,
        artefact_parent_value_id: null,
        artefact_value: 'Департамент операционной модели цифрового развития',
      },
    ],
  },
  {
    artefact_id: 7,
    artefact_tech_label: 'ds_department',
    artefact_label: 'Стрим-исполнитель',
    artefact_desc: 'Выберите стрим-исполнитель',
    artefact_hint: 'Выбирается управление DS, отвечающее за разработку модели.',
    is_class_flg: 1,
    is_multi_fill_flg: 0,
    artefact_type_desc: ArtifactType.MULTI_DROPDOWN,
    values: [
      {
        artefact_value_id: 1,
        artefact_parent_value_id: null,
        artefact_value: 'Управление моделирования РБ',
      },
      {
        artefact_value_id: 2,
        artefact_parent_value_id: null,
        artefact_value: 'Управление моделирования КИБ и СМБ',
      },
      {
        artefact_value_id: 3,
        artefact_parent_value_id: null,
        artefact_value: 'Управление перспективных алгоритмов машинного обучения',
      },
      {
        artefact_value_id: 4,
        artefact_parent_value_id: null,
        artefact_value: 'Управление процессных и финансовых моделей',
      },
      {
        artefact_value_id: 566,
        artefact_parent_value_id: null,
        artefact_value: 'Управление моделирования партнерств и ИТ-процессов',
      },
    ],
  },
  {
    artefact_id: 57,
    artefact_tech_label: 'name_and_version_rating_system',
    artefact_label: 'Продукт и область применения модели',
    artefact_desc: 'Выберите продукт и область применения модели',
    artefact_hint:
      'Выбирается значение из выпадающего списка. Соответствует пункту «Продукт» из «Заявки на разработку модели».',
    is_class_flg: 1,
    is_multi_fill_flg: 1,
    artefact_type_desc: ArtifactType.MULTI_DROPDOWN,
    values: [
      {
        artefact_value_id: 144,
        artefact_parent_value_id: null,
        artefact_value: 'Розница',
      },
      {
        artefact_value_id: 145,
        artefact_parent_value_id: null,
        artefact_value: 'СМБ',
      },
      {
        artefact_value_id: 146,
        artefact_parent_value_id: null,
        artefact_value: 'КИБ',
      },
      {
        artefact_value_id: 147,
        artefact_parent_value_id: null,
        artefact_value: 'Иное',
      },
      {
        artefact_value_id: 148,
        artefact_parent_value_id: 144,
        artefact_value: 'Кредиты наличными',
      },
      {
        artefact_value_id: 149,
        artefact_parent_value_id: 144,
        artefact_value: 'Кредитные карты',
      },
      {
        artefact_value_id: 150,
        artefact_parent_value_id: 144,
        artefact_value: 'Ипотека',
      },
      {
        artefact_value_id: 151,
        artefact_parent_value_id: 144,
        artefact_value: 'Авто',
      },
      {
        artefact_value_id: 152,
        artefact_parent_value_id: 144,
        artefact_value: 'Иное',
      },
      {
        artefact_value_id: 153,
        artefact_parent_value_id: 148,
        artefact_value: 'Корпоративный канал',
      },
      {
        artefact_value_id: 154,
        artefact_parent_value_id: 148,
        artefact_value: 'Открытый канал',
      },
      {
        artefact_value_id: 155,
        artefact_parent_value_id: 148,
        artefact_value: 'Предодобренные',
      },
      {
        artefact_value_id: 156,
        artefact_parent_value_id: 148,
        artefact_value: 'Рефинансирование',
      },
      {
        artefact_value_id: 157,
        artefact_parent_value_id: 148,
        artefact_value: 'Реструктуризация',
      },
      {
        artefact_value_id: 158,
        artefact_parent_value_id: 148,
        artefact_value: 'Зарплатный проект',
      },
      {
        artefact_value_id: 159,
        artefact_parent_value_id: 148,
        artefact_value: 'Иное',
      },
      {
        artefact_value_id: 160,
        artefact_parent_value_id: 151,
        artefact_value: 'Стандарт',
      },
      {
        artefact_value_id: 161,
        artefact_parent_value_id: 151,
        artefact_value: 'Лайт',
      },
      {
        artefact_value_id: 162,
        artefact_parent_value_id: 151,
        artefact_value: 'Экспресс',
      },
      {
        artefact_value_id: 163,
        artefact_parent_value_id: 151,
        artefact_value: 'Предодобренные',
      },
      {
        artefact_value_id: 164,
        artefact_parent_value_id: 151,
        artefact_value: 'Цессия',
      },
      {
        artefact_value_id: 165,
        artefact_parent_value_id: 151,
        artefact_value: 'Реструктуризация',
      },
      {
        artefact_value_id: 167,
        artefact_parent_value_id: 151,
        artefact_value: 'Иное',
      },
      {
        artefact_value_id: 168,
        artefact_parent_value_id: 150,
        artefact_value: 'Стандарт',
      },
      {
        artefact_value_id: 169,
        artefact_parent_value_id: 150,
        artefact_value: 'Победа над формальностями',
      },
      {
        artefact_value_id: 170,
        artefact_parent_value_id: 150,
        artefact_value: 'Цессия',
      },
      {
        artefact_value_id: 171,
        artefact_parent_value_id: 150,
        artefact_value: 'Ипотека для военных',
      },
      {
        artefact_value_id: 172,
        artefact_parent_value_id: 150,
        artefact_value: 'Реструктуризация',
      },
      {
        artefact_value_id: 173,
        artefact_parent_value_id: 150,
        artefact_value: 'Иное',
      },
    ],
  },
  {
    artefact_id: 69,
    artefact_tech_label: 'model_risk_type',
    artefact_label: 'Основание для разработки модели',
    artefact_desc: 'Причина разработки модели',
    artefact_hint:
      'Выбирается одно из значений списка, соответствующее основанию для разработки модели из «Заявки на разработку модели».',
    is_class_flg: 1,
    is_multi_fill_flg: 0,
    artefact_type_desc: ArtifactType.DROPDOWN,
    values: [
      {
        artefact_value_id: 139,
        artefact_parent_value_id: null,
        artefact_value: 'Новая модель',
      },
      {
        artefact_value_id: 140,
        artefact_parent_value_id: null,
        artefact_value: 'Переработка по инициативе заказчика/DS',
      },
      {
        artefact_value_id: 141,
        artefact_parent_value_id: null,
        artefact_value: 'Переработка для устранения замечаний валидации/ДВА',
      },
      {
        artefact_value_id: 142,
        artefact_parent_value_id: null,
        artefact_value: 'Переработка для устранения замечаний регулятора',
      },
      {
        artefact_value_id: 143,
        artefact_parent_value_id: null,
        artefact_value: 'Рекалибровка',
      },
    ],
  },
  {
    artefact_id: 73,
    artefact_tech_label: 'group_company',
    artefact_label: 'Компания группы',
    artefact_desc: 'Укажите компанию группы',
    artefact_hint: 'Выбирается значения ЮЛ группы ВТБ.',
    is_class_flg: 1,
    is_multi_fill_flg: 1,
    artefact_type_desc: ArtifactType.DROPDOWN,
    values: [
      {
        artefact_value_id: 309,
        artefact_parent_value_id: null,
        artefact_value: 'Дочерние компании в России',
      },
      {
        artefact_value_id: 310,
        artefact_parent_value_id: 313,
        artefact_value: 'АО «БМ-банк»',
      },
      {
        artefact_value_id: 311,
        artefact_parent_value_id: 313,
        artefact_value: 'АО «СитиБайк»',
      },
      {
        artefact_value_id: 312,
        artefact_parent_value_id: null,
        artefact_value: 'Банк ВТБ(ПАО)',
      },
      {
        artefact_value_id: 316,
        artefact_parent_value_id: 313,
        artefact_value: 'АО «Управляющая компания «Динамо»',
      },
      {
        artefact_value_id: 318,
        artefact_parent_value_id: 313,
        artefact_value: 'АО ВТБ Регистратор',
      },
      {
        artefact_value_id: 319,
        artefact_parent_value_id: 313,
        artefact_value: 'АО ВТБ Специализированный депозитарий',
      },
      {
        artefact_value_id: 320,
        artefact_parent_value_id: 313,
        artefact_value: 'АО Негосударственный пенсионный фонд ВТБ Пенсионный фонд',
      },
      {
        artefact_value_id: 321,
        artefact_parent_value_id: 313,
        artefact_value: 'АО Холдинг ВТБ Капитал',
      },
      {
        artefact_value_id: 322,
        artefact_parent_value_id: 313,
        artefact_value: 'АО «Почта Банк»',
      },
      {
        artefact_value_id: 323,
        artefact_parent_value_id: 313,
        artefact_value: 'АО ВТБ Девелопмент',
      },
      {
        artefact_value_id: 324,
        artefact_parent_value_id: 313,
        artefact_value: 'ВТБ Лизинг (АО)',
      },
      {
        artefact_value_id: 325,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО «ВБ-Сервис»',
      },
      {
        artefact_value_id: 326,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО «МультиКарта»',
      },
      {
        artefact_value_id: 327,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО «РиэлтСити»',
      },
      {
        artefact_value_id: 328,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО «Эстейт Менеджмент»',
      },
      {
        artefact_value_id: 329,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО ВТБ ДЦ',
      },
      {
        artefact_value_id: 330,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО ВТБ Медицинское страхование',
      },
      {
        artefact_value_id: 331,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО ВТБ Недвижимость»',
      },
      {
        artefact_value_id: 332,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО ВТБ Пенсионный администратор',
      },
      {
        artefact_value_id: 333,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО ВТБ Проект',
      },
      {
        artefact_value_id: 334,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО ВТБ Факторинг',
      },
      {
        artefact_value_id: 335,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО «ФинансБизнесГрупп»',
      },
      {
        artefact_value_id: 336,
        artefact_parent_value_id: 313,
        artefact_value: 'ООО ВТБ «Форекс»',
      },
      {
        artefact_value_id: 337,
        artefact_parent_value_id: 313,
        artefact_value: 'Открытое акционерное страховое и перестраховочное общество «Москва Ре»',
      },
      {
        artefact_value_id: 338,
        artefact_parent_value_id: 313,
        artefact_value: 'Публичное АО «СГ-Девелопмент»',
      },
      {
        artefact_value_id: 339,
        artefact_parent_value_id: 313,
        artefact_value: 'Система Лизинг 24 (АО)',
      },
      {
        artefact_value_id: 340,
        artefact_parent_value_id: null,
        artefact_value: 'Дочерние компании за рубежом',
      },
      {
        artefact_value_id: 341,
        artefact_parent_value_id: 340,
        artefact_value: 'Vietnam-Russia Joint Venture Bank',
      },
      {
        artefact_value_id: 342,
        artefact_parent_value_id: 340,
        artefact_value: 'АО «Банк ВТБ(Грузия)»',
      },
      {
        artefact_value_id: 343,
        artefact_parent_value_id: 340,
        artefact_value: 'Банко ВТБ Африка, С.А.',
      },
      {
        artefact_value_id: 344,
        artefact_parent_value_id: 340,
        artefact_value: 'ВТБ Банк (Европа) СЕ',
      },
      {
        artefact_value_id: 345,
        artefact_parent_value_id: 340,
        artefact_value: 'Дочерняя организация АО Банк ВТБ (Казахстан)',
      },
      {
        artefact_value_id: 346,
        artefact_parent_value_id: 340,
        artefact_value: 'ЗАО «Банк ВТБ (Армения)»',
      },
      {
        artefact_value_id: 347,
        artefact_parent_value_id: 340,
        artefact_value: 'ЗАО Банк ВТБ (Беларусь)',
      },
      {
        artefact_value_id: 348,
        artefact_parent_value_id: 340,
        artefact_value: 'ИТС Консултантс (Кипрус) Лимитед',
      },
      {
        artefact_value_id: 349,
        artefact_parent_value_id: 340,
        artefact_value: 'ООО «Компания Сити Лэнд Групп',
      },
      {
        artefact_value_id: 350,
        artefact_parent_value_id: 340,
        artefact_value: 'ОАО «Банк ВТБ (Азербайджан)»',
      },
    ],
  },
  {
    artefact_id: 173,
    artefact_tech_label: 'model_version',
    artefact_label: 'Тип / классификация Модели',
    artefact_desc: 'Выберите тип / классификацию модели',
    artefact_hint: 'Выбирается значение из списка, в зависимости от задачи, решаемой моделью.',
    is_class_flg: 1,
    is_multi_fill_flg: 0,
    artefact_type_desc: ArtifactType.DROPDOWN,
    values: [
      {
        artefact_value_id: 36,
        artefact_parent_value_id: null,
        artefact_value: 'Бизнес-модели',
      },
      {
        artefact_value_id: 37,
        artefact_parent_value_id: null,
        artefact_value: 'ВПОДК - не ПВР',
      },
      {
        artefact_value_id: 38,
        artefact_parent_value_id: null,
        artefact_value: 'ПВР',
      },
      {
        artefact_value_id: 39,
        artefact_parent_value_id: null,
        artefact_value: 'Риск-модели (не ПВР - не ВПОДК)',
      },
      {
        artefact_value_id: 40,
        artefact_parent_value_id: 38,
        artefact_value: 'Не розничные',
      },
      {
        artefact_value_id: 41,
        artefact_parent_value_id: 38,
        artefact_value: 'Розничные',
      },
      {
        artefact_value_id: 42,
        artefact_parent_value_id: 39,
        artefact_value: 'Не розничные',
      },
      {
        artefact_value_id: 43,
        artefact_parent_value_id: 39,
        artefact_value: 'Розничные',
      },
      {
        artefact_value_id: 44,
        artefact_parent_value_id: 36,
        artefact_value: 'CRM',
      },
      {
        artefact_value_id: 45,
        artefact_parent_value_id: 36,
        artefact_value: 'HR-модели',
      },
      {
        artefact_value_id: 46,
        artefact_parent_value_id: 36,
        artefact_value: 'Бухучет',
      },
      {
        artefact_value_id: 47,
        artefact_parent_value_id: 36,
        artefact_value: 'Оптимизация',
      },
      {
        artefact_value_id: 48,
        artefact_parent_value_id: 36,
        artefact_value: 'Прочие модели',
      },
      {
        artefact_value_id: 49,
        artefact_parent_value_id: 36,
        artefact_value: 'Распознавание',
      },
      {
        artefact_value_id: 50,
        artefact_parent_value_id: 37,
        artefact_value: 'Контрагентский риск',
      },
      {
        artefact_value_id: 51,
        artefact_parent_value_id: 37,
        artefact_value: 'Ликвидность',
      },
      {
        artefact_value_id: 52,
        artefact_parent_value_id: 37,
        artefact_value: 'Недвижимость',
      },
      {
        artefact_value_id: 53,
        artefact_parent_value_id: 37,
        artefact_value: 'Операционный риск',
      },
      {
        artefact_value_id: 54,
        artefact_parent_value_id: 37,
        artefact_value: 'Оценка TTC',
      },
      {
        artefact_value_id: 55,
        artefact_parent_value_id: 37,
        artefact_value: 'Процентный риск',
      },
      {
        artefact_value_id: 56,
        artefact_parent_value_id: 37,
        artefact_value: 'Рыночные риски',
      },
      {
        artefact_value_id: 57,
        artefact_parent_value_id: 44,
        artefact_value: 'CRM-отток',
      },
      {
        artefact_value_id: 58,
        artefact_parent_value_id: 44,
        artefact_value: 'Cross-Sell',
      },
      {
        artefact_value_id: 59,
        artefact_parent_value_id: 44,
        artefact_value: 'Sell-Up',
      },
      {
        artefact_value_id: 60,
        artefact_parent_value_id: 45,
        artefact_value: 'Задачи управления персоналом',
      },
      {
        artefact_value_id: 61,
        artefact_parent_value_id: 46,
        artefact_value: 'Выявление аномалий в бухгалтерском учете',
      },
      {
        artefact_value_id: 62,
        artefact_parent_value_id: 46,
        artefact_value: 'Улучшение бухгалтерского учета',
      },
      {
        artefact_value_id: 63,
        artefact_parent_value_id: 47,
        artefact_value: 'Прогнозирование загрузки банкоматов',
      },
      {
        artefact_value_id: 64,
        artefact_parent_value_id: 48,
        artefact_value: 'Анализ Геолокации',
      },
      {
        artefact_value_id: 65,
        artefact_parent_value_id: 48,
        artefact_value: 'Выявление аномального поведения участников торгов',
      },
      {
        artefact_value_id: 66,
        artefact_parent_value_id: 48,
        artefact_value: 'Голосовая биометрия в банке',
      },
      {
        artefact_value_id: 67,
        artefact_parent_value_id: 48,
        artefact_value: 'Прогноз цен на подержанный автомобиль - как параметр LGD модели',
      },
      {
        artefact_value_id: 68,
        artefact_parent_value_id: 48,
        artefact_value: 'Проект кластеризации отраслей по финансовым признакам',
      },
      {
        artefact_value_id: 69,
        artefact_parent_value_id: 49,
        artefact_value: 'Распознавание документации',
      },
      {
        artefact_value_id: 70,
        artefact_parent_value_id: 50,
        artefact_value: 'Сравнение EEPE и рассчитанного на основе MtM (фактический EAD)',
      },
      {
        artefact_value_id: 71,
        artefact_parent_value_id: 51,
        artefact_value: 'Модели гэпа ликвидности на все временные интервалы',
      },
      {
        artefact_value_id: 72,
        artefact_parent_value_id: 51,
        artefact_value:
          'Модели досрочного возврата срочных депозитов ФЛ и ЮЛ во временных бакетах свыше 3 месяцев от портфеля',
      },
      {
        artefact_value_id: 73,
        artefact_parent_value_id: 51,
        artefact_value: 'Модели досрочного погашения кредитов ЮЛ',
      },
      {
        artefact_value_id: 74,
        artefact_parent_value_id: 51,
        artefact_value:
          'Модели непогашений в контрактный срок кредитов ФЛ и ЮЛ в бакете до 3 месяцев',
      },
      {
        artefact_value_id: 75,
        artefact_parent_value_id: 51,
        artefact_value:
          'Модели пролонгаций депозитных портфелей ФЛ и ЮЛ (за исключением досрочно востребованных) с учетом стрессовых корректировок',
      },
      {
        artefact_value_id: 76,
        artefact_parent_value_id: 51,
        artefact_value: 'Модель досрочных погашений кредитов ФЛ (препеймент)',
      },
      {
        artefact_value_id: 77,
        artefact_parent_value_id: 51,
        artefact_value:
          "Модель расчета нестабильных долей и коэффициентов пролонгации для срочных клиентских ресурсов и денежных средств 'до востребования' для целей расчета краткосрочной ликвидности",
      },
      {
        artefact_value_id: 78,
        artefact_parent_value_id: 51,
        artefact_value: "Модель расчета нестабильных долей пассивов 'до востребования'",
      },
      {
        artefact_value_id: 79,
        artefact_parent_value_id: 51,
        artefact_value:
          'Модель учета встроенной опциональности в будущих потоках платежей для депозитов ЮЛ с возможностью досрочного погашения',
      },
      {
        artefact_value_id: 80,
        artefact_parent_value_id: 52,
        artefact_value: 'Дисконтирующие коэффициенты под риск недвижимости',
      },
      {
        artefact_value_id: 81,
        artefact_parent_value_id: 54,
        artefact_value: 'Approximate Markov Functional',
      },
      {
        artefact_value_id: 82,
        artefact_parent_value_id: 54,
        artefact_value: 'Attenuated Futures Correlation',
      },
      {
        artefact_value_id: 83,
        artefact_parent_value_id: 54,
        artefact_value: 'Black Scholes Merton',
      },
      {
        artefact_value_id: 84,
        artefact_parent_value_id: 54,
        artefact_value: 'CapFloor',
      },
      {
        artefact_value_id: 85,
        artefact_parent_value_id: 54,
        artefact_value: 'CapFloorBpVol',
      },
      {
        artefact_value_id: 86,
        artefact_parent_value_id: 54,
        artefact_value: 'Credit Piece-wise Constant Hazard Rate',
      },
      {
        artefact_value_id: 87,
        artefact_parent_value_id: 54,
        artefact_value: 'Credit Valuation Adjustment',
      },
      {
        artefact_value_id: 88,
        artefact_parent_value_id: 54,
        artefact_value: 'Defaultl Table Asset with Stated Dependent Hazard',
      },
      {
        artefact_value_id: 89,
        artefact_parent_value_id: 54,
        artefact_value: 'Discounted cash flows',
      },
      {
        artefact_value_id: 90,
        artefact_parent_value_id: 54,
        artefact_value: 'FXForward',
      },
      {
        artefact_value_id: 91,
        artefact_parent_value_id: 54,
        artefact_value: 'FXSwap',
      },
      {
        artefact_value_id: 92,
        artefact_parent_value_id: 54,
        artefact_value: 'Gamma Hazard Model',
      },
      {
        artefact_value_id: 93,
        artefact_parent_value_id: 54,
        artefact_value: 'Linear Gauss Markov',
      },
      {
        artefact_value_id: 94,
        artefact_parent_value_id: 54,
        artefact_value: 'Local Volatility Model',
      },
      {
        artefact_value_id: 95,
        artefact_parent_value_id: 54,
        artefact_value: 'Model Credit Default Times Copula',
      },
      {
        artefact_value_id: 96,
        artefact_parent_value_id: 54,
        artefact_value: 'Static Inflation',
      },
      {
        artefact_value_id: 97,
        artefact_parent_value_id: 54,
        artefact_value: 'Swap',
      },
      {
        artefact_value_id: 98,
        artefact_parent_value_id: 54,
        artefact_value: 'VTBCommoditySwap2_GD',
      },
      {
        artefact_value_id: 99,
        artefact_parent_value_id: 54,
        artefact_value: 'VTBFXNDF',
      },
      {
        artefact_value_id: 100,
        artefact_parent_value_id: 54,
        artefact_value: 'VTBSwaptionSABR',
      },
      {
        artefact_value_id: 101,
        artefact_parent_value_id: 54,
        artefact_value: 'VTBXXCCySwap',
      },
      {
        artefact_value_id: 102,
        artefact_parent_value_id: 55,
        artefact_value: 'Параметры стресс-тестирования (moderate stress)',
      },
      {
        artefact_value_id: 103,
        artefact_parent_value_id: 55,
        artefact_value: 'Параметры стресс-тестирования (severe stress)',
      },
      {
        artefact_value_id: 104,
        artefact_parent_value_id: 56,
        artefact_value: 'VAR методика оценки рыночного риска торговой книги',
      },
      {
        artefact_value_id: 105,
        artefact_parent_value_id: 56,
        artefact_value: 'Параметры стресс-тестирования (moderate stress)',
      },
      {
        artefact_value_id: 106,
        artefact_parent_value_id: 56,
        artefact_value: 'Параметры стресс-тестирования (severe stress)',
      },
      {
        artefact_value_id: 107,
        artefact_parent_value_id: 40,
        artefact_value: 'CCF',
      },
      {
        artefact_value_id: 108,
        artefact_parent_value_id: 40,
        artefact_value: 'EAD',
      },
      {
        artefact_value_id: 109,
        artefact_parent_value_id: 40,
        artefact_value: 'LGD',
      },
      {
        artefact_value_id: 110,
        artefact_parent_value_id: 40,
        artefact_value: 'PD',
      },
      {
        artefact_value_id: 111,
        artefact_parent_value_id: 41,
        artefact_value: 'CCF',
      },
      {
        artefact_value_id: 112,
        artefact_parent_value_id: 41,
        artefact_value: 'EAD',
      },
      {
        artefact_value_id: 113,
        artefact_parent_value_id: 41,
        artefact_value: 'LGD',
      },
      {
        artefact_value_id: 114,
        artefact_parent_value_id: 41,
        artefact_value: 'PD app',
      },
      {
        artefact_value_id: 115,
        artefact_parent_value_id: 41,
        artefact_value: 'PD beh',
      },
      {
        artefact_value_id: 116,
        artefact_parent_value_id: 42,
        artefact_value: 'Collection',
      },
      {
        artefact_value_id: 117,
        artefact_parent_value_id: 42,
        artefact_value: 'Анти-фрод',
      },
      {
        artefact_value_id: 118,
        artefact_parent_value_id: 42,
        artefact_value: 'Бизнес LGD',
      },
      {
        artefact_value_id: 119,
        artefact_parent_value_id: 42,
        artefact_value: 'Бизнес PD',
      },
      {
        artefact_value_id: 120,
        artefact_parent_value_id: 42,
        artefact_value: 'Бизнес-планирование резервов МСФО',
      },
      {
        artefact_value_id: 121,
        artefact_parent_value_id: 42,
        artefact_value: 'Делегирование полномочий ',
      },
      {
        artefact_value_id: 122,
        artefact_parent_value_id: 42,
        artefact_value: 'Идентификация клиентов ЮЛ',
      },
      {
        artefact_value_id: 123,
        artefact_parent_value_id: 42,
        artefact_value: 'Казначейство',
      },
      {
        artefact_value_id: 124,
        artefact_parent_value_id: 42,
        artefact_value: 'Моделий выявления ФКР',
      },
      {
        artefact_value_id: 125,
        artefact_parent_value_id: 42,
        artefact_value: 'Резервы МСФО',
      },
      {
        artefact_value_id: 126,
        artefact_parent_value_id: 42,
        artefact_value: 'Ценообразование корпоративных продуктов',
      },
      {
        artefact_value_id: 127,
        artefact_parent_value_id: 43,
        artefact_value: 'Collection (hard)',
      },
      {
        artefact_value_id: 128,
        artefact_parent_value_id: 43,
        artefact_value: 'Collection (soft)',
      },
      {
        artefact_value_id: 129,
        artefact_parent_value_id: 43,
        artefact_value: 'Анти-фрод',
      },
      {
        artefact_value_id: 130,
        artefact_parent_value_id: 43,
        artefact_value: 'Бизнес LGD',
      },
      {
        artefact_value_id: 131,
        artefact_parent_value_id: 43,
        artefact_value: 'Бизнес PD',
      },
      {
        artefact_value_id: 132,
        artefact_parent_value_id: 43,
        artefact_value: 'Бизнес-планирование резервов МСФО',
      },
      {
        artefact_value_id: 133,
        artefact_parent_value_id: 43,
        artefact_value: 'Делегирование полномочий',
      },
      {
        artefact_value_id: 134,
        artefact_parent_value_id: 43,
        artefact_value: 'Идентификация клиентов ФЛ',
      },
      {
        artefact_value_id: 135,
        artefact_parent_value_id: 43,
        artefact_value: 'Казначейство',
      },
      {
        artefact_value_id: 136,
        artefact_parent_value_id: 43,
        artefact_value: 'Модели выявления ФКР',
      },
      {
        artefact_value_id: 137,
        artefact_parent_value_id: 43,
        artefact_value: 'Резервы МСФО',
      },
      {
        artefact_value_id: 138,
        artefact_parent_value_id: 43,
        artefact_value: 'Ценообразование розничных продуктов',
      },
    ],
  },
  {
    artefact_id: 781,
    artefact_tech_label: 'model_type',
    artefact_label: 'Тип алгоритма',
    artefact_desc: 'Выберите тип алгоритма',
    artefact_hint: 'Выбирается значение из списка, в зависимости от алгоритма модели.',
    is_class_flg: 1,
    is_multi_fill_flg: 0,
    artefact_type_desc: ArtifactType.DROPDOWN,
    values: [
      {
        artefact_value_id: 573,
        artefact_parent_value_id: null,
        artefact_value: 'Рекомендательные системы и анализ схожести',
      },
      {
        artefact_value_id: 574,
        artefact_parent_value_id: null,
        artefact_value: 'Анализ временных рядов',
      },
      {
        artefact_value_id: 575,
        artefact_parent_value_id: null,
        artefact_value: 'Бустинг',
      },
      {
        artefact_value_id: 576,
        artefact_parent_value_id: null,
        artefact_value: 'Ансамбль моделей',
      },
      {
        artefact_value_id: 577,
        artefact_parent_value_id: null,
        artefact_value: 'Расчетный фактор/Анализ временных рядов',
      },
      {
        artefact_value_id: 578,
        artefact_parent_value_id: null,
        artefact_value: 'Нейронная сеть',
      },
      {
        artefact_value_id: 579,
        artefact_parent_value_id: null,
        artefact_value: 'Нейронная сеть/NLP',
      },
      {
        artefact_value_id: 580,
        artefact_parent_value_id: null,
        artefact_value: 'Бустинг + Линейная (Линейная/Логистическая регрессия)',
      },
      {
        artefact_value_id: 581,
        artefact_parent_value_id: null,
        artefact_value: 'Дерево',
      },
      {
        artefact_value_id: 582,
        artefact_parent_value_id: null,
        artefact_value: 'Расчетный фактор',
      },
      {
        artefact_value_id: 583,
        artefact_parent_value_id: null,
        artefact_value: 'Ансамбль моделей + Линейная (Линейная/Логистическая регрессия) + РСА',
      },
      {
        artefact_value_id: 584,
        artefact_parent_value_id: null,
        artefact_value: 'Кластеризация',
      },
      {
        artefact_value_id: 585,
        artefact_parent_value_id: null,
        artefact_value: 'Линейная',
      },
      {
        artefact_value_id: 586,
        artefact_parent_value_id: null,
        artefact_value:
          'Ансамбль моделей + Линейная (Линейная/Логистическая регрессия) + Расчетный фактор',
      },
      {
        artefact_value_id: 587,
        artefact_parent_value_id: null,
        artefact_value: 'Линейная (Линейная/Логистическая регрессия)',
      },
      {
        artefact_value_id: 588,
        artefact_parent_value_id: null,
        artefact_value: 'Линейная (Линейная/Логистическая регрессия) + NLP',
      },
      {
        artefact_value_id: 589,
        artefact_parent_value_id: null,
        artefact_value: 'Нейронная сеть + Бустинг + Линейная (Линейная/Логистическая регрессия)',
      },
      {
        artefact_value_id: 590,
        artefact_parent_value_id: null,
        artefact_value: 'Оптимизационный алгоритм + нейронная сеть',
      },
      {
        artefact_value_id: 591,
        artefact_parent_value_id: null,
        artefact_value: 'NLP',
      },
      {
        artefact_value_id: 592,
        artefact_parent_value_id: null,
        artefact_value: 'Оптимизационный алгоритм',
      },
      {
        artefact_value_id: 593,
        artefact_parent_value_id: null,
        artefact_value: 'Оптимизационный алгоритм + Линейная (Линейная/Логистическая регрессия)',
      },
      {
        artefact_value_id: 594,
        artefact_parent_value_id: null,
        artefact_value: 'Регрессия, модель Холта-Винтерся',
      },
      {
        artefact_value_id: 595,
        artefact_parent_value_id: null,
        artefact_value:
          'Симуляционная модель Монте-Карло + Классификация + стохастические модели короткой ставки',
      },
      {
        artefact_value_id: 596,
        artefact_parent_value_id: null,
        artefact_value: 'BERT for token classification, SESTM',
      },
    ],
  },
];

export const mockedModelsArtifacts: ArtifactResponse = {
  data: mockedArtifacts,
};
