import { ColumnsFilter, Row } from '@shared/types';

export type CompareModelsResponseType = {
  data: {
    cards: { [key: string]: [Partial<Row>, Partial<Row>] };
  };
};

export type CustomError = {
  statusCode: number;
  message: string;
};

export type SuccessResponse<T> = {
  error: false;
  data: T;
};

export type ErrorResponse = {
  error: true;
  data: CustomError;
};

export type ModelsResponseType = {
  data: {
    cards: Array<Partial<Row>>;
  };
};

export type ModelEditResponseType = ErrorResponse | SuccessResponse<ModelsResponseType>;

export type Relations = {
  [key: string]: (Partial<Row> & string) | null; // TODO: add interface for new attributes
};

type RelationsModel = {
  modules?: Relations[];
  calibrations?: Relations[];
} & Partial<Row>;

export type RelationsModelResponseType = {
  data: {
    card: RelationsModel;
  };
};

export type MetricsResponseType = {
  distributionByLifecycleStageModels: Array<[string, number]>;
  developedModels: {
    count: number;
    delta: number;
  };
  implementedModels: {
    count: number;
    delta: number;
  };
  finalStatusModels: {
    count: number;
    delta: number;
  };
  sumRmModels: {
    count: number;
    delta: number;
  };
  totalModels: {
    count: number;
    delta: number;
  };
  riskCoverageFinalStatusModels: {
    countPercent: number;
    deltaPercent: number;
  };
  registryCoverageModels: {
    countPercent: number;
    deltaPercent: number;
  };
  pilots: {
    stage05A: number;
    stage05B: number;
  };
  takenOutOfOperationModels: {
    count: number;
    deltaPercent: number;
  };
  onMonitoringModels: {
    count: number;
    deltaPercent: number;
  };
  stalledModelsByMonth: number[];
  finalStatusByMonthModels: number[];
  tasks: {
    validation: number;
    datasources: number;
  };
};

export type Template = {
  template_id: number;
  user_id: string | null;
  group_id?: number;
  template_name: string;
  group_label?: string;
  template_value?: Partial<ColumnsFilter>;
  isOwner?: boolean;
  public?: boolean;
};

export type TemplateAddApi = {
  template_name: string;
  public: boolean;
  template_value: Partial<ColumnsFilter>;
};

export type TemplateUpdateApi = TemplateAddApi & {
  template_id: number;
};

export enum ArtifactType {
  DROPDOWN = 'dropdown',
  MULTI_DROPDOWN = 'multi-dropdown',
  BOOLEAN = 'boolean',
  DATE_ISO8601 = 'date_iso8601',
  CASE_DATE = 'case_date',
  DATE = 'date',
  QUARTERLY_DATE = 'quarterly_date',
  QUARTERLY_DROPDOWN = 'quarterly_dropdown',
  PERCENTAGE = 'percentage',
  FILE_OBJECT_STORAGE = 'file_object_storage',
  FILE_GIT = 'file_git',
  FILE_NEXUS = 'file_nexus',
  FILE = 'file',
  FILE_LINK = 'file_link',
  LINK = 'link',
  TEXT = 'text',
  NUMBER = 'number',
  USER = 'user',
}

export type ArtifactTypeUnion = `${ArtifactType}`;

export type ArtifactValue = {
  artefact_id?: number;
  artefact_value_id: number;
  artefact_parent_value_id: number | null;
  artefact_value: string;
  is_active_flag?: string;
};

// TODO: need to review
export enum ArtifactGroup {
  CUSTOMER_USAGE = 'Модель используется заказчиком',
  CONFIRMATION_DATE = 'Дата подтверждения использования',
  ALLOCATION_COMMENT = 'Комментарий к аллокации применения',
  ALLOCATION_USAGE = 'Аллокация применения',
}

export type ArtifactGroupUnion = `${ArtifactGroup}`;

type ArtifactFlag = undefined | null | '0' | '1';

export type Artifact = {
  artefact_id: number;
  artefact_tech_label: keyof Row;
  artefact_context?: null | string;
  artefact_parent_id?: null | string | number;
  artefact_parent_value?: null | string;
  artefact_parent_value_id?: null | string;
  artefact_default_value?: null | string;
  is_default_value_flg?: ArtifactFlag;
  artefact_value_id?: null | number;
  artefact_value?: null | string;
  artefact_value_label?: null | string;
  artefact_regular_expression?: null | string;
  is_edit_sum_flg?: ArtifactFlag;
  artefact_business_group_id?: number;
  artefact_label: string;
  artefact_desc?: string | null;
  artefact_hint?: string | null;
  artefact_type_id?: string | number;
  task_name?: string;
  bpmn_name?: string;
  is_edit_flg: ArtifactFlag;
  is_active_flg?: ArtifactFlag;
  is_class_flg?: ArtifactFlag;
  is_main_info_flg?: ArtifactFlag;
  is_multi_fill_flg?: ArtifactFlag;
  artefact_type_desc: ArtifactTypeUnion;
  can_add_new_option?: ArtifactFlag;
  values: Array<ArtifactValue>;
  start_date_depend_artefact?: keyof Row;
  group?: ArtifactGroupUnion;
  is_editable_by_role_sum_rm?: string | null;
  is_editable_by_role_sum?: string | null;
};

export type ArtifactResponse = {
  data?: Array<Artifact>;
};

export type ArtifactApi = {
  artefact_tech_label: string;
  artefact_string_value: string;
  artefact_value_id: null | number;
};

export type ArtifactEditApi = ArtifactApi & {
  model_id: string;
};

export type ArtifactEditResponse = {
  data: [];
};

export type ModelEditApi = {
  model_id: string;
  artefacts: ArtifactApi[];
  model_source: string;
};

export type ModelHistoryChangesParams = {
  model_id: string;
  artefact_tech_label: string;
  model_source: string;
};

export type ModelHistoryChangesResponse = {
  artefact_id: number;
  artefact_label: string;
  artefact_value: string;
  effective_from: {
    timestamp: string;
    timestamp_formatted: string;
  };
  editor: {
    username: string;
  };
}[];

export type ReportApi = {
  filters: Partial<ColumnsFilter>;
};

