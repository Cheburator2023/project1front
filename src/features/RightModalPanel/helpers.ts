/* eslint-disable no-nested-ternary */
/* eslint-disable default-param-last */
/* eslint-disable no-use-before-define */
import {
  addDays,
  addMonths,
  addYears,
  differenceInYears,
  endOfMonth,
  endOfQuarter,
  format,
  isWithinInterval,
  startOfYear,
} from 'date-fns';

import {
  ArtifactType,
  getFrontendArtifactTypeDesc,
  type Artifact,
  type ArtifactApi,
  type ArtifactValue,
} from '@shared/api';
import { Column, COLUMN_TYPE, ModelSource, Role, Row } from '@shared/types';
import { initialColumns, MODEL_FORM_MODE } from '@shared/constants';
import {
  CommonInputProps,
  INPUT_TYPE,
  InputFactoryProps,
  InputValue,
  MultiSelectInputValue,
  SelectInputValue,
  SELECT_TYPE,
  SelectOption,
  SelectStringOptions,
} from '@shared/ui/organisms';

import { ArtifactGroup } from '@src/shared/api/types';
import { concat, uniqBy } from 'lodash';
import { CUSTOMER_MAP, CUSTOMER_TYPE } from '@src/shared/constants/customers';
import {
  FormFieldConditions,
  FormFieldValueConditions,
  FormFields,
  FormFieldsSchema,
  FormValues,
} from './types';

import {
  csvMatchedRoles,
  CSV_EDIT_RULES_BY_ROLE,
  CSV_DENY_RULES_BY_ROLE_AND_BUCKET,
  CSV_ALLOW_RULES_BY_ROLE_AND_BUCKET,
  type CsvEditRoleFlags,
} from './ModelForm/editRulesFromCsv';
import {
  ACTIVE_MODEL_SCHEMA,
  BASE_MODEL_SCHEMA,
  NOT_ACTIVE_MODEL_SCHEMA,
  RATING_SYSTEM_MODEL_SCHEMA,
  RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA,
  REST_MODEL_SCHEMA,
  SCHEMA_NAME_MAP,
  SUM_ARTEFACTS,
} from './ModelForm/constants';
import { DELETE_CONFIRM_MODEL_SCHEMA, DELETE_MODEL_SCHEMA } from './DeleteModelForm/constants';

export const markSchema = (
  schema: FormFieldsSchema,
  schemaFromNameMap: {
    key: string;
    title: string;
    schemaOrder: number;
  },
): FormFieldsSchema =>
  schema.map((item) => ({
    ...item,
    schemaKey: schemaFromNameMap.key,
    schemaOrder: schemaFromNameMap.schemaOrder,
  }));

/**
 * Источник модели для матрицы прав: без учёта регистра и пробелов.
 * Иначе `switch (row.model_source)` не попадал в `sum` и отдавал false для всех полей.
 */
export function getModelSourceAccessBucket(row?: Partial<Row>): 'sum' | 'sum_rm' | null {
  const r = row?.model_source;
  if (r == null || r === '') {
    return null;
  }
  const s = String(r).trim().toLowerCase();
  if (s === 'sum') {
    return 'sum';
  }
  if (s === 'sum-rm' || s === 'sum_rm' || s === 'rm') {
    return 'sum_rm';
  }
  return null;
}

function canEditArtefactByCsvRules(
  artifact: Artifact | undefined,
  row: Partial<Row> | undefined,
  flags: CsvEditRoleFlags,
): boolean | null {
  if (!artifact) {
    return null;
  }
  const bucket = getModelSourceAccessBucket(row);
  if (!bucket) {
    return null;
  }

  const matchedRoles = csvMatchedRoles(flags);
  if (matchedRoles.length === 0) {
    return null;
  }

  if (artifact.is_edit_flg === '0') {
    return false;
  }
  const tech = artifact.artefact_tech_label;

  // Deny-правила: даже если API сказал «редактируемо», для конкретной пары (роль, bucket)
  // поле принудительно disabled (матрица требований).
  for (const role of matchedRoles) {
    const denyLabels = CSV_DENY_RULES_BY_ROLE_AND_BUCKET[role]?.[bucket];
    if (denyLabels?.includes(tech)) {
      return false;
    }
  }

  // Allow-правила по bucket: поле доступно роли на указанном source даже если API вернул 0.
  for (const role of matchedRoles) {
    const allowLabels = CSV_ALLOW_RULES_BY_ROLE_AND_BUCKET[role]?.[bucket];
    if (allowLabels?.includes(tech)) {
      return true;
    }
  }

  // Явные allow-правила из CSV (ключевые конфликтные поля): для SUM/SUM-RM одинаковые, кроме DS Lead.
  // DS Lead: доступ только для моделей, созданных в SUM.
  for (const role of matchedRoles) {
    const labels = CSV_EDIT_RULES_BY_ROLE[role];
    if (!labels?.includes(tech)) {
      continue;
    }
    if (role === Role.DS_LEAD) {
      return bucket === 'sum';
    }
    return true;
  }

  return null;
}

/**
 * В БД иногда есть несколько строк `artefacts` с одним `artefact_tech_label` (разные artefact_id).
 * `find` брал первую попавшуюся — могли брать строку с is_edit_flg=0 или без матрицы, хотя для другого id всё ок.
 * Берём строку с лучшими правами для текущего model_source.
 */
export const pickArtifactForField = (
  artifacts: Artifact[],
  artefact_tech_label: string,
  row?: Partial<Row>,
): Artifact | undefined => {
  const matches = artifacts.filter((a) => a.artefact_tech_label === artefact_tech_label);
  if (matches.length === 0) return undefined;
  if (matches.length === 1) return matches[0];

  const bucket = getModelSourceAccessBucket(row);
  const isSum = bucket === 'sum';
  const isSumRm = bucket === 'sum_rm';

  const priority = (a: Artifact): number => {
    let p = 0;
    if (a.is_edit_flg === '1') p += 100;
    if (isSum && a.is_editable_by_role_sum === '1') p += 20;
    if (isSumRm && a.is_editable_by_role_sum_rm === '1') p += 20;
    if (isSumRm && a.is_editable_by_role_sum === '1') p += 5;
    // Нет model_source в строке / неизвестное значение — выбираем строку с лучшими флагами матрицы.
    if (!bucket) {
      if (a.is_editable_by_role_sum === '1') p += 12;
      if (a.is_editable_by_role_sum_rm === '1') p += 12;
    }
    return p;
  };

  return [...matches].sort((a, b) => priority(b) - priority(a))[0];
};

const getInputValuesFromRow = (artifacts: Artifact[], activeRow: Partial<Row> = {}): FormValues =>
  Object.entries(activeRow).reduce((inputValues, rowItem) => {
    const [name, rowValue] = rowItem as [keyof Row, string];

    const artifact = pickArtifactForField(artifacts, name, activeRow);

    if (artifact) {
      const inputValue = getInputValue(artifact, rowValue);

      return {
        ...inputValues,
        [name]: inputValue,
      };
    }

    return inputValues;
  }, {});

const getInputValue = (artifact: Artifact, rowValue: string) => {
  switch (getFrontendArtifactTypeDesc(artifact)) {
    case ArtifactType.BOOLEAN: {
      const type = INPUT_TYPE.FLAG;

      return { type, value: rowValue === '1' };
    }
    case ArtifactType.QUARTERLY_DROPDOWN:
    case ArtifactType.DROPDOWN: {
      const options = getSelectOptions(artifact.values);

      return getSelectInitialValue(options, rowValue);
    }
    case ArtifactType.MULTI_DROPDOWN: {
      const options = getSelectOptions(artifact.values);

      return getMultiSelectInitialValue(options, rowValue);
    }
    case ArtifactType.QUARTERLY_DATE: {
      const type = INPUT_TYPE.QUARTERLY_DATE;

      let formattedInitialValue: Date | undefined;

      if (rowValue) {
        const date = new Date(rowValue);

        if (date.toString() !== 'Invalid Date') {
          formattedInitialValue = date;
        }
      }

      return formattedInitialValue
        ? {
            type,
            value: formattedInitialValue,
          }
        : undefined;
    }
    case ArtifactType.DATE:
    case ArtifactType.DATE_ISO8601:
    case ArtifactType.CASE_DATE: {
      const type = INPUT_TYPE.DATE;

      let formattedInitialValue: Date | undefined;

      if (rowValue) {
        const date = new Date(rowValue);

        if (date.toString() !== 'Invalid Date') {
          formattedInitialValue = date;
        }
      }

      return formattedInitialValue
        ? {
            type,
            value: formattedInitialValue,
          }
        : undefined;
    }
    case ArtifactType.NUMBER: {
      const type = INPUT_TYPE.NUMBER;

      const validInitialValue = rowValue && !Number.isNaN(Number(rowValue));

      return validInitialValue ? { type, value: Number(rowValue) } : undefined;
    }
    case ArtifactType.PERCENTAGE: {
      const type = INPUT_TYPE.PERCENT;

      return rowValue ? { type, value: rowValue } : undefined;
    }
    case ArtifactType.RFD: {
      const type = INPUT_TYPE.RFD;

      return rowValue ? { type, value: rowValue } : undefined;
    }
    case ArtifactType.MODEL_RISK_COEFFICIENT: {
      const type = INPUT_TYPE.MODEL_RISK;

      return rowValue ? { type, value: rowValue } : undefined;
    }
    default: {
      const type = INPUT_TYPE.STRING;

      return rowValue ? { type, value: rowValue } : undefined;
    }
  }
};

// A set of functions that help with the conversion of artifacts values for selected options
const getArtifactValueByValueId = (
  artifactValues: ArtifactValue[],
  artifactParentValueId: number,
) => artifactValues.find(({ artefact_value_id }) => artefact_value_id === artifactParentValueId);

const getParentsChildrenIds = (artifactValues: ArtifactValue[]) =>
  artifactValues.reduce((parentsChildrenValues, currentArtifactValue) => {
    if (currentArtifactValue?.artefact_parent_value_id) {
      const currentParentValue = getArtifactValueByValueId(
        artifactValues,
        currentArtifactValue.artefact_parent_value_id,
      )?.artefact_value;

      if (currentParentValue) {
        const currentParentChildrenValues = parentsChildrenValues?.[currentParentValue] ?? [];

        return {
          ...parentsChildrenValues,
          [currentParentValue]: [
            ...currentParentChildrenValues,
            currentArtifactValue.artefact_value_id,
          ],
        };
      }
    }

    return parentsChildrenValues;
  }, {} as Record<string, number[]>);

const getParentsChildrenValues = (artifactValues: ArtifactValue[]) =>
  artifactValues.reduce((parentsChildrenValues, currentArtifactValue) => {
    if (currentArtifactValue?.artefact_parent_value_id) {
      const currentParentValue = getArtifactValueByValueId(
        artifactValues,
        currentArtifactValue.artefact_parent_value_id,
      )?.artefact_value;

      if (currentParentValue) {
        const currentParentChildrenValues = parentsChildrenValues?.[currentParentValue] ?? [];

        return {
          ...parentsChildrenValues,
          [currentParentValue]: [
            ...currentParentChildrenValues,
            currentArtifactValue.artefact_value,
          ],
        };
      }
    }

    return parentsChildrenValues;
  }, {} as Record<string, string[]>);

const getParentsValuesIds = (
  artifactValues: ArtifactValue[],
  artefactParentValueId?: number | null,
  parentValues: number[] = [],
): number[] => {
  if (artefactParentValueId) {
    const parent = getArtifactValueByValueId(artifactValues, artefactParentValueId);

    if (parent) {
      const result = getParentsValuesIds(artifactValues, parent?.artefact_parent_value_id, [
        parent.artefact_value_id,
        ...parentValues,
      ]);
      return result;
    }

    return parentValues;
  }

  return parentValues;
};

const getParentsValues = (
  artifactValues: ArtifactValue[],
  artefactParentValueId?: number | null,
  parentValues: string[] = [],
): string[] => {
  if (artefactParentValueId) {
    const parentValue = getArtifactValueByValueId(artifactValues, artefactParentValueId);

    if (parentValue) {
      return getParentsValues(artifactValues, parentValue?.artefact_parent_value_id, [
        parentValue.artefact_value,
        ...parentValues,
      ]);
    }

    return parentValues;
  }

  return parentValues;
};

const sortSelectOptions = (selectOptions: SelectOption[]) => {
  const sortedSelectOptions = selectOptions.sort(
    (a, b) => (a.parentsValues?.length || 0) - (b.parentsValues?.length || 0),
  );

  return sortedSelectOptions.reduce((prevValue, option) => {
    if (option.parentsValues?.length) {
      const parentOptionValueId = option.parentsValues[option.parentsValues.length - 1];

      const parentOptionIndex = prevValue.findIndex(({ text }) => text === parentOptionValueId);

      const newPrevValue = [...prevValue];
      newPrevValue.splice(parentOptionIndex + 1, 0, option);

      return newPrevValue;
    }

    return [...prevValue, option];
  }, [] as SelectOption[]);
};

const getSelectOptions = (artifactValues: ArtifactValue[]) => {
  const parentsChildrenValues = getParentsChildrenValues(artifactValues);
  const parentsChildrenIds = getParentsChildrenIds(artifactValues);

  const selectOptions = artifactValues.map(
    ({ artefact_value, artefact_value_id, artefact_parent_value_id }) => {
      const parentsValueIds = getParentsValuesIds(artifactValues, artefact_parent_value_id);

      return {
        text: artefact_value,
        value: artefact_value_id.toString(),
        parentsValues: getParentsValues(artifactValues, artefact_parent_value_id),
        parentsValueIds,
        nestedValues: parentsChildrenValues?.[artefact_value],
        nestedValueIds: parentsChildrenIds?.[artefact_value],
      };
    },
  );

  return sortSelectOptions(selectOptions);
};

const getSelectInitialValue = (
  options: SelectOption[],
  initialValue?: string | null,
): SelectInputValue | undefined => {
  if (!initialValue) {
    return;
  }

  const initialOption = options.find((option) => option.text === initialValue);

  if (!initialOption) {
    return;
  }

  return {
    type: INPUT_TYPE.SELECT,
    value: {
      id: initialOption.value,
      text: initialOption.text,
    },
  };
};

const getMultiSelectInitialValue = (
  options: SelectOption[],
  initialValue?: string | null,
): MultiSelectInputValue | undefined => {
  if (!initialValue) {
    return;
  }

  const initialTextsList = initialValue.split(',').map((text) => text.trim());
  const initialOptions = options.filter((option) => initialTextsList.includes(option.text));

  if (!initialOptions.length) {
    return;
  }

  return {
    type: INPUT_TYPE.MULTI_SELECT,
    value: initialOptions.map((option) => ({
      id: option.value,
      text: option.text,
    })),
  };
};

export const getStartDateInCurrentYear = (startDate: Date) => {
  const yearsFromStartDate = differenceInYears(Date.now(), startDate);

  if (yearsFromStartDate) {
    return addYears(startDate, yearsFromStartDate);
  }

  return startDate;
};

const ENABLE_FEBRUARY_EXTENSION = false;
const ENABLE_MARCH_EXTENSION = false;
const ENABLE_4Q_EXTENSION_UNTIL_APRIL_13 = true;
const ENABLE_2Q_EXTENSION_UNTIL_NOVEMBER_30 = false;
const QUARTER_EDIT_PERIOD_MONTHS = 2;
const QUARTER_EDIT_PERIOD_DAYS = 0;
/** Месяцев после конца квартала, доступных в календаре для выбора даты подтверждения. */
const QUARTER_PICKER_MONTHS_AFTER_QUARTER_END = 1;

/** Квартал 1–4 из последнего символа tech_label (как для QUARTERLY_DATE). */
const parseQuarterDigitFromTechLabel = (techLabel: string): number | undefined => {
  if (!techLabel?.length) return undefined;
  const d = Number(techLabel[techLabel.length - 1]);
  return Number.isFinite(d) && d >= 1 && d <= 4 ? d : undefined;
};

/** Первый день квартала и год (та же логика effectiveYear, что в getDateLimits). */
const getQuarterAnchorDates = (quarter: number) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3);

  const effectiveYear = quarter === 4 && currentQuarter <= 2 ? currentYear - 1 : currentYear;
  const firstDateOfEffectiveYear = startOfYear(new Date(effectiveYear, 0, 1));
  const quarterStart = addMonths(firstDateOfEffectiveYear, (quarter - 1) * 3);

  return { quarterStart, effectiveYear };
};

/**
 * Границы календаря: квартал + N полных месяцев после его окончания (заполнение).
 * Окно редактирования формы по-прежнему задаётся в getDateLimits (+2 мес и флаги для Q4 и т.д.).
 */
const getQuarterPickerDateLimits = (quarter: number) => {
  const { quarterStart } = getQuarterAnchorDates(quarter);
  const quarterEnd = endOfQuarter(quarterStart);
  const maxDate = endOfMonth(addMonths(quarterEnd, QUARTER_PICKER_MONTHS_AFTER_QUARTER_END));

  return { minDate: quarterStart, maxDate };
};

/** Окно, в течение которого разрешено редактирование полей квартала (расширенный maxDate). */
const getDateLimits = (quarter: number) => {
  const { quarterStart, effectiveYear } = getQuarterAnchorDates(quarter);
  const minDate = quarterStart;
  let maxDate = addDays(addMonths(endOfQuarter(minDate), QUARTER_EDIT_PERIOD_MONTHS), QUARTER_EDIT_PERIOD_DAYS); // TODO: По умолчанию — конец квартала + QUARTER_EDIT_PERIOD_MONTHS + QUARTER_EDIT_PERIOD_DAYS

  if (quarter === 2) {
    if (ENABLE_2Q_EXTENSION_UNTIL_NOVEMBER_30) {
      maxDate = new Date(`${effectiveYear}-11-30T23:59:59`);
    }
  }

  // TODO: Специальная логика продления срока редактирования для 4 квартала
  if (quarter === 4) {
    if (ENABLE_4Q_EXTENSION_UNTIL_APRIL_13) {
      maxDate = new Date(`${effectiveYear + 1}-04-13T23:59:59`);
      // TODO: Если включено продление — разрешаем редактирование до 13 апреля следующего года
    } else if (ENABLE_MARCH_EXTENSION) {
      maxDate = new Date(`${effectiveYear + 1}-03-31T23:59:59`);
      // TODO: Альтернативное продление — до конца марта
    } else if (ENABLE_FEBRUARY_EXTENSION) {
      maxDate = new Date(`${effectiveYear + 1}-02-28T23:59:59`);
      // TODO: Продление только до конца февраля
    } else {
      maxDate = new Date(`${effectiveYear + 1}-01-31T23:59:59`);
      // TODO: Без продления — редактирование доступно только до конца января
    }
  }

  return { minDate, maxDate };
};

const getDisabledStatus = (minDate: Date, maxDate: Date, quarter: number, canEdit?: boolean) => {
  if (!canEdit) return true; // TODO: Если редактирование отключено по правам — сразу запрещаем

  const currentDate = new Date();
  const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3); // TODO: Вычисляем текущий квартал

  if (quarter === 2) {
    // TODO: Для 2 квартала разрешаем редактирование до 30 ноября (в зависимости от флага)
    if (ENABLE_2Q_EXTENSION_UNTIL_NOVEMBER_30) {
      return !isWithinInterval(currentDate, { start: minDate, end: maxDate });
    }
  }

  if (quarter === 4) {
    // TODO: Для 4 квартала в Q1 и Q2 разрешаем редактирование до maxDate (в зависимости от флагов)
    if (currentQuarter === 1 || currentQuarter === 2) {
      return !isWithinInterval(currentDate, { start: minDate, end: maxDate });
    }

    // TODO: В остальных случаях редактирование запрещено
    // return true;
  }

  // TODO: Нельзя редактировать будущие кварталы
  if (quarter > currentQuarter) return true;

  // TODO: Нельзя редактировать кварталы старше чем на 1 назад
  if (quarter < currentQuarter - 1) return true;

  const startOfCurrentQuarter = new Date(currentDate.getFullYear(), (currentQuarter - 1) * 3, 1); // TODO: Получаем 1 число текущего квартала
  const monthAfterStartOfCurrentQuarter = addMonths(startOfCurrentQuarter, 1); // TODO: Один месяц после начала квартала

  // TODO: Если мы в первом месяце текущего квартала, можно редактировать предыдущий квартал
  if (currentDate < monthAfterStartOfCurrentQuarter && quarter === currentQuarter - 1) {
    return false;
  }

  // TODO: В остальных случаях проверяем, попадает ли дата в разрешённый интервал
  return !isWithinInterval(currentDate, { start: minDate, end: maxDate });
};

const canEditArtefact = (
  artifact?: Artifact,
  row?: Partial<Row>,
  roleFlags: CsvEditRoleFlags = {},
): boolean => {
  if (!artifact) return false;

  const isEditableBySum = artifact.is_editable_by_role_sum === '1';
  const isEditableBySumRm = artifact.is_editable_by_role_sum_rm === '1';

  if (!row) {
    return isEditableBySumRm || isEditableBySum;
  }

  const bucket = getModelSourceAccessBucket(row);
  const csvRuleDecision = canEditArtefactByCsvRules(artifact, row, roleFlags);
  if (csvRuleDecision !== null) {
    return csvRuleDecision;
  }
  if (bucket === 'sum') {
    return isEditableBySum;
  }
  if (bucket === 'sum_rm') {
    // Бэкенд считает флаги по bucket’ам sum vs sum_rm в artefact_source_roles.
    // На стендах часто есть только строка model_source=sum без rm/sum_rm — тогда sum_rm-флаг 0, хотя по смыслу поле доступно.
    return isEditableBySumRm || isEditableBySum;
  }
  // Нет model_source в строке формы / неизвестное значение — не обнуляем доступ по API.
  return isEditableBySum || isEditableBySumRm;
};

const debugFieldAccess = ({
  artifact,
  row,
  canEdit,
  isDisabled,
  fieldSchema,
  roleFlags,
}: {
  artifact: Artifact;
  row?: Partial<Row>;
  canEdit: boolean;
  isDisabled: boolean | undefined;
  fieldSchema?: FormFieldsSchema[number];
  roleFlags?: CsvEditRoleFlags;
}) => {
  if (typeof window === 'undefined') return;

  // Временный набор «всегда логируемых» полей: разбираем дизейбл при BC + SUM.
  // Убрать после того как причина disabled подтверждена.
  const alwaysWatched = new Set([
    'segment_name',
    'remove_decision',
    'implementation_segment',
  ]);
  const watchedFieldsRaw = window.localStorage.getItem('rightModalDebugFields');
  const watchedFields = (watchedFieldsRaw ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (
    !alwaysWatched.has(artifact.artefact_tech_label) &&
    !watchedFields.includes(artifact.artefact_tech_label)
  ) {
    return;
  }

  // eslint-disable-next-line no-console
  console.log('[RightModalPanel access debug]', {
    field: artifact.artefact_tech_label,
    model_source: row?.model_source,
    bucket: getModelSourceAccessBucket(row),
    is_edit_flg: artifact.is_edit_flg,
    is_editable_by_role_sum: artifact.is_editable_by_role_sum,
    is_editable_by_role_sum_rm: artifact.is_editable_by_role_sum_rm,
    canEdit,
    disabled: isDisabled,
    roleFlags,
    csvMatched: roleFlags ? csvMatchedRoles(roleFlags) : undefined,
    fieldSchema: fieldSchema
      ? {
          schemaKey: fieldSchema.schemaKey,
          alwaysDisabled: fieldSchema.alwaysDisabled,
          required: fieldSchema.required,
          hasEnabledByValueConditions: Array.isArray(fieldSchema.enabledByValueConditions)
            && fieldSchema.enabledByValueConditions.length > 0,
          hasDisabledConditions: Array.isArray(fieldSchema.disabledConditions)
            && fieldSchema.disabledConditions.length > 0,
        }
      : null,
  });
  // eslint-disable-next-line no-console
  console.log(
    `[RightModalPanel access debug compact] field=${artifact.artefact_tech_label} source=${
      row?.model_source || ''
    } canEdit=${String(canEdit)} disabled=${String(isDisabled)} NO_ROLES=${String(
      process.env.NO_ROLES,
    )}`,
  );
};

const isFieldDisabled = (
  values?: FormValues,
  fieldSchema?: FormFieldsSchema[number],
  artifact?: Artifact,
  row?: Partial<Row> | undefined,
  canEdit?: boolean,
): boolean | undefined => {
  // Reporting date is system-managed and should never be editable in the form.
  if (artifact?.artefact_tech_label === 'update_date') {
    return true;
  }

  if (fieldSchema?.alwaysDisabled) {
    return true;
  }

  const isGloballyDisabled = artifact?.is_edit_flg === '0';

  const isDisabledByConditions = !checkDisabledStatusByConditions(
    values,
    fieldSchema?.disabledConditions,
  );

  const isDisabledByValueConditions = !checkRequireValueStatus(
    values,
    fieldSchema?.enabledByValueConditions,
  );

  const isControlledByConditions =
    fieldSchema?.enabledByValueConditions && isDisabledByValueConditions && isDisabledByConditions;

  const isDisabledArtifactBySource = !canEdit;

  return isGloballyDisabled || isControlledByConditions || isDisabledArtifactBySource;
};

// Main mapping function that combine object for proper input format
const mapArtifactToField = (
  artifact: Artifact,
  currentFormSchema: FormFieldsSchema,
  fieldSchema?: FormFieldsSchema[number],
  activeRow?: Partial<Row>,
  values?: FormValues,
  canEditModelRiskByRole?: boolean,
  isBusinessCustomer?: boolean,
  isValidatorLead?: boolean,
  isValidator?: boolean,
  isDsLead?: boolean,
): InputFactoryProps<keyof Row> => {
  const roleFlags: CsvEditRoleFlags = {
    isValidatorLead,
    isValidator,
    isBusinessCustomer,
    isDsLead,
  };
  const canEdit =
    process.env.NO_ROLES === 'true' || canEditArtefact(artifact, activeRow, roleFlags);
  let isDisabled = isFieldDisabled(values, fieldSchema, artifact, activeRow, canEdit);
  debugFieldAccess({ artifact, row: activeRow, canEdit, isDisabled, fieldSchema, roleFlags });

  // Extra gating: only validators can edit model_risk_type in UI
  if (artifact.artefact_tech_label === 'model_risk_type' && canEditModelRiskByRole === false) {
    isDisabled = true;
  }

  // Матрица прав: business_customer + модель из SUM — дата окончания разработки только просмотр (не зависит от наличия значения).
  if (
    artifact.artefact_tech_label === 'developing_end_date' &&
    isBusinessCustomer &&
    getModelSourceAccessBucket(activeRow) === 'sum'
  ) {
    isDisabled = true;
  }

  // Железный финальный override: поля из CSV_ALLOW_RULES_BY_ROLE_AND_BUCKET должны быть
  // доступны для пары (роль, bucket) даже если выше по цепочке поле было заблокировано
  // (включая случаи, когда бек не вернул нужные флаги или ещё не применил миграцию).
  {
    const bucket = getModelSourceAccessBucket(activeRow);
    const matchedRoles = csvMatchedRoles(roleFlags);
    if (
      bucket &&
      matchedRoles.some((role) =>
        CSV_ALLOW_RULES_BY_ROLE_AND_BUCKET[role]?.[bucket]?.includes(
          artifact.artefact_tech_label,
        ),
      )
    ) {
      isDisabled = false;
    }
  }

  const commonAttributes: CommonInputProps<keyof Row> = {
    id: artifact.artefact_id.toString(),
    name: artifact.artefact_tech_label,
    label: artifact.artefact_label,
    disabled: isDisabled,
    required: isDisabled
      ? false
      : checkRequireStatus(values, !!fieldSchema?.required, fieldSchema?.requireConditions),
    addNewOptionEnabled: artifact.can_add_new_option === '1',
    maxLength: fieldSchema?.maxLength,
    requireConditions: fieldSchema?.requireConditions,
    optionConditions: fieldSchema?.optionConditions,
    autoCompleteConditions: fieldSchema?.autoCompleteConditions,
    enabledByValueConditions: fieldSchema?.enabledByValueConditions,
    disabledConditions: fieldSchema?.disabledConditions,
    valueConditions: fieldSchema?.valueConditions,
    placeholder: artifact.artefact_desc ? artifact.artefact_desc : undefined,
    group: artifact.group,
    schemaKey: fieldSchema?.schemaKey || SCHEMA_NAME_MAP.REST_MODEL_SCHEMA.key,
    schemaOrder: fieldSchema?.schemaOrder || SCHEMA_NAME_MAP.REST_MODEL_SCHEMA.schemaOrder,
  };

  const activeRowValue = activeRow?.[artifact?.artefact_tech_label];

  switch (getFrontendArtifactTypeDesc(artifact)) {
    case ArtifactType.BOOLEAN: {
      const type = INPUT_TYPE.FLAG;

      return {
        ...commonAttributes,
        type,
      };
    }
    case ArtifactType.DROPDOWN: {
      const type = INPUT_TYPE.SELECT;

      return {
        ...commonAttributes,
        type,
        multiple: false,
        options: {
          type: SELECT_TYPE.STRING,
          options: getSelectOptions(artifact.values),
        },
      };
    }

    case ArtifactType.QUARTERLY_DROPDOWN: {
      const type = INPUT_TYPE.QUARTERLY_DROPDOWN;

      let startDate = new Date();

      // Получение стартовой даты
      if (artifact?.start_date_depend_artefact && activeRow) {
        const artifactStartDateValue = activeRow[artifact.start_date_depend_artefact];

        if (artifactStartDateValue) {
          const date = new Date(artifactStartDateValue);

          if (date.toString() !== 'Invalid Date') {
            startDate = date;
          }
        }
      }

      // Получение номера квартала из tech_label
      const fields = Number(artifact.artefact_tech_label[artifact.artefact_tech_label.length - 1]);

      // Вычисление минимальной и максимальной даты для квартала
      const { minDate, maxDate } = getDateLimits(fields);
      const quarterDisabledStatus = getDisabledStatus(minDate, maxDate, fields, canEdit);

      return {
        ...commonAttributes,
        type,
        multiple: false,
        disabled: quarterDisabledStatus,
        options: {
          type: SELECT_TYPE.STRING,
          options: getSelectOptions(artifact.values),
        },
      };
    }

    case ArtifactType.MULTI_DROPDOWN: {
      const type = INPUT_TYPE.MULTI_SELECT;

      return {
        ...commonAttributes,
        type,
        multiple: true,
        options: {
          type: SELECT_TYPE.STRING,
          options: getSelectOptions(artifact.values),
        },
      };
    }

    case ArtifactType.PERCENTAGE: {
      const type = INPUT_TYPE.PERCENT;

      return {
        ...commonAttributes,
        type,
      };
    }

    case ArtifactType.QUARTERLY_DATE: {
      const type = INPUT_TYPE.QUARTERLY_DATE;

      let formattedInitialValue: Date | undefined;
      let startDate = new Date();

      // Get start date helper ****
      if (artifact?.start_date_depend_artefact && activeRow) {
        const artifactStartDateValue = activeRow[artifact.start_date_depend_artefact];

        if (artifactStartDateValue) {
          const date = new Date(artifactStartDateValue);

          if (date.toString() !== 'Invalid Date') {
            startDate = date;
          }
        }
      }
      // ****

      // Get formatted initial value helper ****
      if (activeRowValue) {
        const date = new Date(activeRowValue);

        if (date.toString() !== 'Invalid Date') {
          formattedInitialValue = date;
        }
      }
      // ****

      // Get quarter number by tech label helper ****
      const fields = Number(artifact.artefact_tech_label[artifact.artefact_tech_label.length - 1]);
      // ****

      const editWindow = getDateLimits(fields);
      const pickerLimits = getQuarterPickerDateLimits(fields);
      const quarterDisabledStatus = getDisabledStatus(
        editWindow.minDate,
        editWindow.maxDate,
        fields,
        canEdit,
      );

      return {
        ...commonAttributes,
        fields,
        minDate: pickerLimits.minDate,
        maxDate: pickerLimits.maxDate,
        disabled: quarterDisabledStatus,
        type,
      };
    }
    case ArtifactType.DATE:
    case ArtifactType.DATE_ISO8601:
    case ArtifactType.CASE_DATE: {
      const quarterFromLabel = parseQuarterDigitFromTechLabel(artifact.artefact_tech_label);
      const isConfirmationQuarterlyDate =
        artifact.group === ArtifactGroup.CONFIRMATION_DATE && quarterFromLabel !== undefined;

      if (isConfirmationQuarterlyDate) {
        const editWindow = getDateLimits(quarterFromLabel);
        const pickerLimits = getQuarterPickerDateLimits(quarterFromLabel);
        const quarterDisabledStatus = getDisabledStatus(
          editWindow.minDate,
          editWindow.maxDate,
          quarterFromLabel,
          canEdit,
        );

        return {
          ...commonAttributes,
          type: INPUT_TYPE.DATE,
          minDate: pickerLimits.minDate,
          maxDate: pickerLimits.maxDate,
          disabled: quarterDisabledStatus,
        };
      }

      return {
        ...commonAttributes,
        type: INPUT_TYPE.DATE,
      };
    }
    case ArtifactType.NUMBER: {
      return {
        ...commonAttributes,
        type: INPUT_TYPE.NUMBER,
      };
    }

    case ArtifactType.RFD: {
      return {
        ...commonAttributes,
        type: INPUT_TYPE.RFD,
      };
    }

    case ArtifactType.MODEL_RISK_COEFFICIENT: {
      return {
        ...commonAttributes,
        type: INPUT_TYPE.MODEL_RISK,
      };
    }

    default: {
      return {
        ...commonAttributes,
        type: INPUT_TYPE.STRING,
      };
    }
  }
};

const getGroupField = (
  fields: InputFactoryProps<keyof Row>[],
  groupLabel: string,
  groupType: INPUT_TYPE,
): any => {
  return {
    id: `${groupLabel}_group`,
    name: `${groupLabel}_group`,
    label: groupLabel,
    type: groupType,
    fields,
  };
};

// Функция для фильтрации полей по группе
const getGroupedFields = (fields: FormFields, groupLabel: string): FormFields => {
  return fields.filter((field) => field.group === groupLabel);
};

// Функция для получения типа группы
const getGroupType = (group: ArtifactGroup): INPUT_TYPE => {
  switch (group) {
    case ArtifactGroup.CONFIRMATION_DATE:
      return INPUT_TYPE.QUARTERLY_DATE_GROUP;
    case ArtifactGroup.CUSTOMER_USAGE:
      return INPUT_TYPE.QUARTERLY_DROPDOWN_GROUP;
    case ArtifactGroup.ALLOCATION_COMMENT:
      return INPUT_TYPE.STRING_GROUP;
    case ArtifactGroup.ALLOCATION_USAGE:
      return INPUT_TYPE.PERCENT_GROUP;
    default:
      return INPUT_TYPE.STRING;
  }
};

// Функция для создания нового группового поля
const createNewGroupField = (
  formFields: FormFields,
  groupLabel: string,
  groupType: INPUT_TYPE,
): InputFactoryProps<keyof Row> => {
  const groupedFields = getGroupedFields(formFields, groupLabel);
  return getGroupField(groupedFields, groupLabel, groupType);
};

// Функция для получения имени группы
const getGroupLabel = (field: InputFactoryProps<keyof Row>): string => {
  return field.group || '';
};

// Основная функция для генерации полей формы
const getFormFields = ({
  artifacts,
  values,
  initialRow,
  mode,
  currentFormSchema,
  showAllFields = false,
  currentCustomer = CUSTOMER_MAP.EVERY_CUSTOMER,
  canEditModelRiskByRole,
  isBusinessCustomer,
  isValidatorLead,
  isValidator,
  isDsLead,
}: {
  artifacts: Artifact[];
  values?: FormValues;
  currentFormSchema: FormFieldsSchema;
  mode: MODEL_FORM_MODE;
  initialRow?: Partial<Row>;
  showAllFields?: boolean;
  currentCustomer: CUSTOMER_TYPE;
  canEditModelRiskByRole?: boolean;
  isBusinessCustomer?: boolean;
  isValidatorLead?: boolean;
  isValidator?: boolean;
  isDsLead?: boolean;
}) => {
  const isActive = currentFormSchema.some(
    ({ schemaKey }) => schemaKey === SCHEMA_NAME_MAP.ACTIVE_MODEL_SCHEMA.key,
  );
  const isRatingSystem = currentFormSchema.some(
    ({ schemaKey }) => schemaKey === SCHEMA_NAME_MAP.RATING_SYSTEM_MODEL_SCHEMA.key,
  );
  const isRatingSystemRegulatorApprove = currentFormSchema.some(
    ({ schemaKey }) =>
      schemaKey === SCHEMA_NAME_MAP.RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA.key,
  );
  const isNotActive = currentFormSchema.some(
    ({ schemaKey }) => schemaKey === SCHEMA_NAME_MAP.NOT_ACTIVE_MODEL_SCHEMA.key,
  );

  // TODO: TESTING FOR UMRV
  const mergedUniqueArrayOfAllAttrsForDebug = uniqBy(
    concat(
      BASE_MODEL_SCHEMA,
      ACTIVE_MODEL_SCHEMA,
      RATING_SYSTEM_MODEL_SCHEMA,
      RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA,
      initialColumns,
    ),
    'name',
  );

  let mergedModelsForUmrv: any[] = [];

  if (currentCustomer.id === CUSTOMER_MAP.UMRV.id) {
    mergedModelsForUmrv = uniqBy(
      concat(
        BASE_MODEL_SCHEMA,
        REST_MODEL_SCHEMA,
        isActive ? ACTIVE_MODEL_SCHEMA : [],
        isNotActive ? NOT_ACTIVE_MODEL_SCHEMA : [],
        isRatingSystem ? RATING_SYSTEM_MODEL_SCHEMA : [],
        isRatingSystemRegulatorApprove ? RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA : [],
      ),
      'name',
    ).filter(({ customers }) => customers?.find((customer) => customer.id === currentCustomer?.id));

    if (mode === MODEL_FORM_MODE.EDIT) {
      const mergedModelSchemaForUmrv = concat(
        ACTIVE_MODEL_SCHEMA,
        REST_MODEL_SCHEMA,
        isNotActive ? NOT_ACTIVE_MODEL_SCHEMA : [],
        RATING_SYSTEM_MODEL_SCHEMA,
        RATING_SYSTEM_REGULATOR_APPROVE_MODEL_SCHEMA,
      );
      const initialColumnsForUmrv = initialColumns.filter(
        (col) => !mergedModelSchemaForUmrv.find(({ name }) => name === col.name)?.name,
      );

      mergedModelsForUmrv = uniqBy(
        concat(BASE_MODEL_SCHEMA, mergedModelSchemaForUmrv, initialColumnsForUmrv),
        'name',
      ).filter(
        ({ customers }) =>
          !customers || customers?.find((customer) => customer.id === currentCustomer?.id),
      );
    }
  }

  const EXCLUDED_FIELDS_BY_MODE: Record<string, string[]> = {
    [MODEL_FORM_MODE.EDIT]: ['reason_model_delete', 'status'],
  };

  const filterColumnsByMode = (mode: MODEL_FORM_MODE, columns: Array<Column>): Array<Column> => {
    const excludedFields = EXCLUDED_FIELDS_BY_MODE[mode] || [];
    const filteredColumns = columns.filter((column) => !excludedFields.includes(column.name));

    return filteredColumns;
  };

  const fieldsNamesToGenerate = (() => {
    if (showAllFields) {
      return mergedUniqueArrayOfAllAttrsForDebug.map(({ name }) => name);
    }

    if (mode === MODEL_FORM_MODE.DELETE) {
      return DELETE_MODEL_SCHEMA.map(({ name }) => name);
    }

    if (mode === MODEL_FORM_MODE.DELETE_CONFIRM) {
      return DELETE_CONFIRM_MODEL_SCHEMA.map(({ name }) => name);
    }

    if (currentCustomer.id === CUSTOMER_MAP.UMRV.id) {
      const columnsForUmrv: Column[] = mergedModelsForUmrv.map((model) => ({
        name: model.name,
        type: COLUMN_TYPE.STRING,
        title: model.name,
        required: model.required,
      }));

      return filterColumnsByMode(mode, columnsForUmrv).map(({ name }) => name);
    }

    if (mode === MODEL_FORM_MODE.ADD) {
      return BASE_MODEL_SCHEMA.map(({ name }) => name);
    }

    return filterColumnsByMode(mode, initialColumns).map(({ name }) => name);
  })();

  // Генерация полей
  const formFields = fieldsNamesToGenerate.reduce((fields, fieldName) => {
    const artifact = pickArtifactForField(artifacts, fieldName, initialRow);
    const fieldSchema = currentFormSchema.find(({ name }) => name === fieldName);

    if (artifact) {
      const field = mapArtifactToField(
        artifact,
        currentFormSchema,
        fieldSchema,
        initialRow,
        values,
        canEditModelRiskByRole,
        isBusinessCustomer,
        isValidatorLead,
        isValidator,
        isDsLead,
      );
      return [...fields, field];
    }

    return fields;
  }, [] as FormFields);

  // Используем Set для отслеживания созданных групп
  const createdGroups = new Set<string>();

  // Генерация финального списка полей с группами
  const finalFormFields = formFields.reduce((fields, field) => {
    const groupLabel = getGroupLabel(field);

    // Если поле принадлежит группе и эта группа еще не создана
    if (field.group && !createdGroups.has(groupLabel)) {
      const groupType = getGroupType(field.group as ArtifactGroup);
      const newGroupField = createNewGroupField(formFields, groupLabel, groupType);
      createdGroups.add(groupLabel);
      return [...fields, newGroupField];
    }

    // Если поле принадлежит группе, которая уже создана — пропускаем его
    if (field.group && createdGroups.has(groupLabel)) {
      return fields;
    }

    // Добавляем поле, если оно не принадлежит группе
    return [...fields, field];
  }, [] as FormFields);

  return finalFormFields;
};

const getFormValue = (value?: InputValue) => {
  switch (value?.type) {
    case INPUT_TYPE.SELECT: {
      return Array.isArray(value.value)
        ? value?.value?.map(({ text }) => text) || ''
        : value.value?.text || '';
    }
    case INPUT_TYPE.MULTI_SELECT: {
      return value?.value?.map(({ text }) => text) || '';
    }
    case INPUT_TYPE.FLAG: {
      return value?.value ? '1' : '0';
    }
    default: {
      return value?.value?.toString() || '';
    }
  }
};

const checkForEqualValues = (formValue: string | string[], conditionValue = '') => {
  if (Array.isArray(formValue)) {
    return formValue.includes(conditionValue);
  }

  return formValue === conditionValue;
};

const checkForSatisfyConditions = (conditionsList: FormFieldConditions, values?: FormValues) =>
  conditionsList.some((conditions) => {
    const conditionsList = Object.entries(conditions);

    const satisfyConditionsNumber = conditionsList.filter((condition) => {
      const [name, conditionValue] = condition as [keyof Row, string];

      const formValueToCheck = getFormValue(values?.[name]);

      return checkForEqualValues(formValueToCheck, conditionValue);
    }).length;

    return conditionsList.length === satisfyConditionsNumber;
  });

const checkRequireStatus = (
  values?: FormValues,
  required?: boolean,
  requireConditions?: FormFieldConditions | string[],
) => {
  if (required) {
    return true;
  }

  if (requireConditions) {
    if (requireConditions.every((i) => typeof i === 'string')) {
      return false;
    }
    return checkForSatisfyConditions(requireConditions, values);
  }

  return false;
};

const checkDisabledStatusByConditions = (
  values?: FormValues,
  disabledConditions?: FormFieldConditions | string[],
) => {
  if (disabledConditions) {
    if (disabledConditions.every((i) => typeof i === 'string')) {
      return false;
    }
    return checkForSatisfyConditions(disabledConditions, values);
  }

  return false;
};

// Check for require specific value
export const checkRequireValueStatus = (
  values?: FormValues,
  valueConditions?: FormFieldValueConditions,
) => {
  if (valueConditions) {
    for (let index = 0; index < valueConditions.length; index++) {
      const currentCondition = valueConditions[index];

      if (checkForSatisfyConditions(currentCondition.conditions, values)) {
        return currentCondition.value;
      }
    }
  }
};

const getInvalidFields = (
  activeFormSchema: FormFieldsSchema,
  values?: FormValues,
  wasPreviouslyActiveModel?: boolean,
  fields?: FormFields,
  initialRow?: Partial<Row>
) => {
  const isBeingMadeActive = getFormValue(values?.active_model) === '1';
  const notActiveSchemaFieldNames = new Set(NOT_ACTIVE_MODEL_SCHEMA.map(({ name }) => name));

  return activeFormSchema
    .filter((schemaField) => {
      const { name, required, requireConditions, valueConditions, schemaKey } = schemaField;

      const formValue = getFormValue(values?.[name]);
      const field = fields?.find((_field) => {
        return _field.name === name;
      });

      if (field?.disabled || field === undefined) {
        return false;
      }

      if (
        schemaKey === SCHEMA_NAME_MAP.NOT_ACTIVE_MODEL_SCHEMA.key &&
        requireConditions?.toString().includes('wasPreviouslyActiveModel')
      ) {
        if (isBeingMadeActive) {
          return false;
        }
        if (wasPreviouslyActiveModel) {
          if (!formValue) {
            return true;
          }
        }
        return false;
      }

      const requiredField = checkRequireStatus(values, required, requireConditions);

      if (requiredField) {
        if (!formValue) {
          return true;
        }
      }

      const valueToCompare = checkRequireValueStatus(values, valueConditions);

      if (valueToCompare !== undefined && !checkForEqualValues(formValue, valueToCompare)) {
        return true;
      }

      // Только для СУМ моделей, если значение артефакта из СУМ уже есть и оно не null, запрещаем менять на null
      if (
        initialRow?.model_source === ModelSource.SUM
        && initialRow[field.name]
        && SUM_ARTEFACTS.includes(field.name)
        && !formValue
        && !(isBeingMadeActive && notActiveSchemaFieldNames.has(name))
      ) {
        return true;
      }

      return false;
    })
    .map(({ name }) => name);
};

const getProperFormatValueForSubmit = (inputValue: InputValue) => {
  const { type, value } = inputValue;

  // Defensive fallback for auto-filled select values that can occasionally
  // lose explicit INPUT_TYPE.SELECT during derived form updates.
  if (
    type !== INPUT_TYPE.SELECT &&
    !Array.isArray(value) &&
    value &&
    typeof value === 'object' &&
    'id' in (value as any) &&
    'text' in (value as any)
  ) {
    const normalizedValue = value as { id?: string | number; text?: string };
    return {
      artefact_string_value: normalizedValue.text ?? '',
      artefact_value_id:
        normalizedValue.id === undefined || normalizedValue.id === null
          ? null
          : Number(normalizedValue.id),
    };
  }

  switch (type) {
    case INPUT_TYPE.DATE:
    case INPUT_TYPE.QUARTERLY_DATE:
      return {
        artefact_string_value: value ? format(value, 'dd.MM.yyyy') : '',
        artefact_value_id: null,
      };
    case INPUT_TYPE.FLAG:
      return {
        artefact_string_value: value ? '1' : '0',
        artefact_value_id: null,
      };
    case INPUT_TYPE.SELECT:
      // TODO: REFACTOR add new type for new type of select
      return Array.isArray(value)
        ? value.map(({ id, text }) => ({
            artefact_string_value: text,
            artefact_value_id: Number(id),
          }))
        : {
            artefact_string_value: value?.text,
            artefact_value_id: Number(value?.id),
          };
    case INPUT_TYPE.QUARTERLY_DROPDOWN:
      return {
        artefact_string_value: value.text,
        artefact_value_id: Number(value.id),
      };
    case INPUT_TYPE.MULTI_SELECT:
      return value.map(({ id, text }) => ({
        artefact_string_value: text,
        artefact_value_id: Number(id),
      }));
    case INPUT_TYPE.RFD:
      return {
        artefact_string_value: String(value),
        artefact_value_id: null,
      };
    case INPUT_TYPE.MODEL_RISK:
      return {
        artefact_string_value: value == null ? '' : String(value),
        artefact_value_id: null,
      };
    default:
      return {
        artefact_string_value: String(value),
        artefact_value_id: null,
      };
  }
};

/** Text used in form condition matching (SELECT uses value.text; plain fields use value). */
export const getFormFieldTextForConditions = (
  fieldValue: InputValue | undefined,
): string | undefined => {
  if (!fieldValue || fieldValue.value == null) {
    return undefined;
  }
  const v = fieldValue.value as { text?: string } | string | number;
  if (typeof v === 'object' && v !== null && 'text' in v) {
    return String((v as { text?: string }).text ?? '');
  }
  return String(v);
};

/**
 * True when current form values satisfy every key in each row of `conditions`
 * (same idea as valueConditions / handleChange + isEqual in ModelForm).
 */
const formValuesSatisfyConditionRows = (
  values: FormValues,
  conditions: FormFieldConditions,
): boolean =>
  conditions.every((row) =>
    (Object.keys(row) as (keyof Row)[]).every((key) => {
      const expected = row[key];
      if (expected === undefined) {
        return true;
      }
      return getFormFieldTextForConditions(values[key]) === expected;
    }),
  );

/**
 * When BASE_MODEL_SCHEMA `rating_model` valueConditions (e.g. auto «Да») are met but
 * `rating_model` is missing from state, merge the SELECT from artifacts before submit.
 * Rules are read from {@link BASE_MODEL_SCHEMA} — not duplicated here.
 */
export const mergeAutoRatingModelIfEligible = (
  values: FormValues | undefined,
  artifacts: Artifact[],
): FormValues | undefined => {
  if (!values) {
    return values;
  }

  const ratingField = BASE_MODEL_SCHEMA.find((f) => f.name === 'rating_model');
  const matchingRule = ratingField?.valueConditions?.find(
    (vc) => !!vc.conditions?.length && formValuesSatisfyConditionRows(values, vc.conditions),
  );
  if (!matchingRule) {
    return values;
  }

  const targetText = matchingRule.value;
  const artifact = artifacts.find((a) => a.artefact_tech_label === 'rating_model');
  const targetOption = artifact?.values?.find((o) => o.artefact_value === targetText);
  if (targetOption == null || targetOption.artefact_value_id == null) {
    return values;
  }

  const nextRating: InputValue = {
    type: INPUT_TYPE.SELECT,
    value: {
      id: String(targetOption.artefact_value_id),
      text: targetOption.artefact_value,
    },
  };

  const existing = values.rating_model;
  if (
    existing?.type === INPUT_TYPE.SELECT &&
    existing.value &&
    typeof existing.value === 'object' &&
    'text' in existing.value &&
    (existing.value as { text?: string }).text === targetText &&
    String((existing.value as { id?: string | number }).id) === String(targetOption.artefact_value_id)
  ) {
    return values;
  }

  return { ...values, rating_model: nextRating };
};

const getArtifactApiItems = (
  values?: FormValues, 
  parentModelId?: string, 
  changedFields?: Array<keyof Row>,
  forceIncludeFields: Array<keyof Row> = []
) => {
  const baseFieldsToProcess = changedFields?.length
    ? changedFields
    : (Object.keys(values ?? {}) as Array<keyof Row>);
  // active_model: в БД три состояния — '1', '0', пусто. Не отправляем, пока пользователь явно не менял
  // чекбокс (иначе пустое превращалось бы в '0' при любом сохранении).
  const fieldsToProcess = uniqBy([...baseFieldsToProcess, ...forceIncludeFields], String).filter(
    (fieldName) => {
      if (fieldName === 'active_model') {
        return Boolean(changedFields?.includes('active_model'));
      }
      return true;
    },
  );

  const artifactApiItems = fieldsToProcess.reduce(
    (bodyItems, fieldName): any => {
      const value = values?.[fieldName];
      
      if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
        return bodyItems;
      }

      const content = getProperFormatValueForSubmit(value);

      if (Array.isArray(content)) {
        return [
          ...bodyItems,
          ...content.map((item) => ({
            artefact_tech_label: fieldName,
            ...item,
          })),
        ];
      }

      return [
        ...bodyItems,
        {
          artefact_tech_label: fieldName,
          ...content,
        },
      ];
    },
    [] as ArtifactApi[],
  );

  if (parentModelId) {
    return [
      ...artifactApiItems,
      {
        artefact_tech_label: 'parent_model_id',
        artefact_string_value: parentModelId,
        artefact_value_id: null,
      },
    ];
  }

  return artifactApiItems;
};

const getParentModelOptions = (rows: Partial<Row>[]) =>
  rows.reduce((options, row) => {
    const { system_model_id, model_name, model_source } = row;
    if (system_model_id && model_name && model_source === 'sum-rm') {
      return [
        ...options,
        {
          value: system_model_id,
          text: model_name,
        },
      ];
    }

    return options;
  }, [] as SelectStringOptions);

const getFormMode = (activePanelType: 'edit' | 'add') => {
  if (activePanelType === 'edit') {
    return MODEL_FORM_MODE.EDIT;
  }

  return MODEL_FORM_MODE.ADD;
};

export {
  getFormMode,
  getFormFields,
  getInvalidFields,
  getArtifactApiItems,
  getParentModelOptions,
  getInputValuesFromRow,
  getProperFormatValueForSubmit,
};

