import type { Artifact } from '@shared/api/types';
import { ModelSource, Row } from '@shared/types';
import { InputFactoryProps } from '@shared/ui/organisms';

import { pickArtifactForField } from '../helpers';

export type QaMatrixParsedRow = {
  artefactTechLabel: string;
  expectedLabel: string;
  /** Ожидаемая доступность поля по блоку «в требованиях» */
  requirementAccessible: boolean;
};

/** Секция матрицы: заголовок из qa_edit_matrix.md + строки ⊖ или ⛔️ */
export type QaMatrixSection = {
  /** Строка «Пользователь: …» без префикса */
  matrixUsername: string | null;
  /** Нормализованный model_source: sum | sum-rm */
  matrixModelSource: string | null;
  rows: QaMatrixParsedRow[];
};

export type QaMatrixRuntimeContext = {
  /** Keycloak preferred_username (userStore) */
  username: string | null;
  /** Keycloak user.groups */
  groups: string[];
  /** model_source открытой строки модели */
  modelSource: string | null | undefined;
};

/** Отдельное правило проверки — для раскраски в UI */
export type QaMatrixRuleLine = {
  id: 'login' | 'groups' | 'modelSource' | 'access' | 'label' | 'apiFlags';
  /** false — правило не применялось (нет условий в матрице), нейтральный цвет */
  applied: boolean;
  /** Имеет смысл только при applied === true */
  pass: boolean;
  text: string;
};

export type QaMatrixValidationItem = QaMatrixParsedRow & {
  fieldPresent: boolean;
  disabled: boolean;
  /** Фактическая доступность: поле есть в форме и не disabled */
  actualAccessible: boolean;
  labelMatches: boolean;
  /** Совпадение ожидаемой доступности с фактической */
  accessMatch: boolean;
  /** Совпадение полей формы с матрицей (без контекста сессии) */
  fieldPass: boolean;
  /** preferred_username vs «Пользователь:»; null если в матрице не задано */
  usernameContextMatch: boolean | null;
  /** user.groups vs роль из логина test_*; null если проверка не применима */
  groupsContextMatch: boolean | null;
  /** model_source модели vs «Модель создана в:»; null если в матрице не задано */
  modelSourceContextMatch: boolean | null;
  /** Заголовок секции матрицы (для отладки и ключа списка) */
  sectionMatrixUsername: string | null;
  sectionMatrixModelSource: string | null;
  pass: boolean;
  /** Разбивка по правилам (цвет: зелёный / красный / серый) */
  rules: QaMatrixRuleLine[];
  detail: string;
};

/** Результат валидации: строки по полям + число секций, отброшенных из‑за несовпадения логина */
export type QaMatrixValidationOutcome = {
  items: QaMatrixValidationItem[];
  /** Секции с «Пользователь:», не совпадающим с текущим логином (или без сессии) */
  skippedSectionsByLogin: number;
};

const EMPTY_CONTEXT = {
  rules: [] as QaMatrixRuleLine[],
  usernameContextMatch: null as boolean | null,
  groupsContextMatch: null as boolean | null,
  modelSourceContextMatch: null as boolean | null,
};

const REQ_ACCESSIBLE = /в\s+требованиях:\s*(.+?)\s*$/;
const SECTION_SPLIT = /\r?\n-{3,}\r?\n/;

const USER_LINE = /Пользователь:\s*([^,\n]+)/i;
const MODEL_SOURCE_LINE = /Модель\s+создана\s+в:\s*([^,\n]+)/i;

function parseRequirementTail(tail: string): boolean | null {
  const t = tail.trim();
  if (/НЕдоступно/i.test(t)) {
    return false;
  }
  if (/^доступно$/i.test(t)) {
    return true;
  }
  return null;
}

/** Значения из md: rm / sum / sum-rm → как в API (ModelSource) */
export function normalizeMarkdownModelSource(raw: string): string | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, '');
  if (s === 'rm' || s === 'sum-rm' || s === 'sum_rm') {
    return ModelSource.SUM_RM;
  }
  if (s === 'sum') {
    return ModelSource.SUM;
  }
  return null;
}

/**
 * Сравнение источника из матрицы и из строки модели (регистр, пробелы).
 * Иначе «sum» из md и «SUM» / « sum » из грида давали mismatch в правиле «Источник».
 */
export function canonicalModelSourceForCompare(raw: string | null | undefined): string | null {
  if (raw == null || String(raw).trim() === '') {
    return null;
  }
  const n = normalizeMarkdownModelSource(String(raw));
  if (n !== null) {
    return n;
  }
  return String(raw).trim().toLowerCase();
}

function splitIntoSections(text: string): string[] {
  const n = text.replace(/\r\n/g, '\n');
  const byDash = n.split(SECTION_SPLIT).filter((s) => s.trim());
  if (byDash.length > 1) {
    return byDash;
  }
  const byUser = n.split(/\n(?=Пользователь\s*:)/i).filter((s) => s.trim());
  if (byUser.length > 1) {
    return byUser;
  }
  return [n];
}

/** Строка матрицы: префикс ⊖ или ⛔/⛔️ (U+26D4, опционально VS U+FE0F), затем JSON-фрагмент */
function stripMatrixRowMarker(line: string): string | null {
  const t = line.trim();
  if (t.startsWith('⊖')) {
    return t.slice('⊖'.length).trimStart();
  }
  if (t.startsWith('⛔')) {
    let rest = t.slice('⛔'.length);
    if (rest.startsWith('\uFE0F')) {
      rest = rest.slice(1);
    }
    return rest.trimStart();
  }
  return null;
}

function parseMatrixRowsFromSectionBody(sectionText: string): QaMatrixParsedRow[] {
  return sectionText.split(/\r?\n/).reduce<QaMatrixParsedRow[]>((rows, rawLine) => {
    const line = rawLine.trim();
    const payload = stripMatrixRowMarker(line);
    if (payload === null) {
      return rows;
    }

    const tech = payload.match(/"artefact_tech_label"\s*:\s*"([^"]+)"/);
    if (!tech) {
      return rows;
    }

    const labMatch = payload.match(/"label"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    const expectedLabel = labMatch ? labMatch[1].replace(/\\"/g, '"') : '';

    const reqM = payload.match(REQ_ACCESSIBLE);
    if (!reqM) {
      return rows;
    }

    const reqAccessible = parseRequirementTail(reqM[1]);
    if (reqAccessible === null) {
      return rows;
    }

    rows.push({
      artefactTechLabel: tech[1],
      expectedLabel,
      requirementAccessible: reqAccessible,
    });
    return rows;
  }, []);
}

function parseSectionHeader(sectionText: string): Pick<QaMatrixSection, 'matrixUsername' | 'matrixModelSource'> {
  const userM = sectionText.match(USER_LINE);
  const modelM = sectionText.match(MODEL_SOURCE_LINE);

  const rawUser = userM?.[1]?.trim().replace(/,$/, '') ?? null;
  const rawModel = modelM?.[1]?.trim().replace(/,$/, '') ?? null;

  let matrixModelSource: string | null = null;
  if (rawModel) {
    matrixModelSource = normalizeMarkdownModelSource(rawModel) ?? rawModel.trim();
  }

  return {
    matrixUsername: rawUser || null,
    matrixModelSource,
  };
}

/**
 * Разбор tasks/qa_edit_matrix.md: секции по ----- или по повтору «Пользователь:»;
 * в каждой — «Пользователь», «Модель создана в», строки ⊖ или ⛔️ (как в отчётах теста).
 */
export function parseQaEditMatrixMarkdown(text: string): QaMatrixSection[] {
  return splitIntoSections(text).flatMap((chunk) => {
    const { matrixUsername, matrixModelSource } = parseSectionHeader(chunk);
    const rows = parseMatrixRowsFromSectionBody(chunk);
    if (rows.length === 0) {
      return [];
    }
    return [
      {
        matrixUsername,
        matrixModelSource,
        rows,
      },
    ];
  });
}

function buildContextRuleLines(
  section: Pick<QaMatrixSection, 'matrixUsername' | 'matrixModelSource'>,
  runtime: QaMatrixRuntimeContext | undefined,
): {
  rules: QaMatrixRuleLine[];
  usernameContextMatch: boolean | null;
  groupsContextMatch: boolean | null;
  modelSourceContextMatch: boolean | null;
} {
  const rules: QaMatrixRuleLine[] = [];
  let usernameContextMatch: boolean | null = null;
  let groupsContextMatch: boolean | null = null;
  let modelSourceContextMatch: boolean | null = null;

  const expectedUser = section.matrixUsername?.trim();

  if (expectedUser) {
    if (!runtime) {
      usernameContextMatch = false;
      rules.push({
        id: 'login',
        applied: true,
        pass: false,
        text: `Логин: нет данных сессии (ожидалось «${expectedUser}»)`,
      });
      const testRoleNoRt = /^test_(.+)$/.exec(expectedUser);
      if (testRoleNoRt) {
        groupsContextMatch = false;
        rules.push({
          id: 'groups',
          applied: true,
          pass: false,
          text: `Keycloak groups: нет данных сессии (ожидалась группа «${testRoleNoRt[1]}»)`,
        });
      } else {
        rules.push({
          id: 'groups',
          applied: false,
          pass: true,
          text: 'Keycloak groups: проверка не требуется (логин не test_*)',
        });
      }
    } else {
      const actualUser = runtime.username?.trim() ?? '';
      usernameContextMatch = expectedUser === actualUser;
      rules.push({
        id: 'login',
        applied: true,
        pass: usernameContextMatch,
        text: usernameContextMatch
          ? `Логин: совпадает («${expectedUser}»)`
          : `Логин: в матрице «${expectedUser}», в сессии «${actualUser || '—'}»`,
      });

      const testRole = /^test_(.+)$/.exec(expectedUser);
      if (testRole) {
        const roleSlug = testRole[1];
        groupsContextMatch = runtime.groups.includes(roleSlug);
        rules.push({
          id: 'groups',
          applied: true,
          pass: groupsContextMatch,
          text: groupsContextMatch
            ? `Keycloak groups: есть «${roleSlug}»`
            : `Keycloak groups: нет «${roleSlug}» (по логину test_*)`,
        });
      } else {
        rules.push({
          id: 'groups',
          applied: false,
          pass: true,
          text: 'Keycloak groups: проверка не требуется (логин не test_*)',
        });
      }
    }
  } else {
    rules.push({
      id: 'login',
      applied: false,
      pass: true,
      text: 'Логин: в матрице не задан',
    });
    rules.push({
      id: 'groups',
      applied: false,
      pass: true,
      text: 'Keycloak groups: в матрице нет логина — не проверяем',
    });
  }

  if (section.matrixModelSource) {
    if (!runtime) {
      modelSourceContextMatch = false;
      rules.push({
        id: 'modelSource',
        applied: true,
        pass: false,
        text: `Источник: нет данных сессии (в матрице «${section.matrixModelSource}»)`,
      });
    } else {
      const actual = runtime.modelSource?.trim();
      if (!actual) {
        modelSourceContextMatch = false;
        rules.push({
          id: 'modelSource',
          applied: true,
          pass: false,
          text: 'Источник: у открытой модели нет model_source',
        });
      } else {
        const expectedCanon = canonicalModelSourceForCompare(section.matrixModelSource);
        const actualCanon = canonicalModelSourceForCompare(actual);
        modelSourceContextMatch = Boolean(
          expectedCanon && actualCanon && expectedCanon === actualCanon,
        );
        rules.push({
          id: 'modelSource',
          applied: true,
          pass: modelSourceContextMatch,
          text: modelSourceContextMatch
            ? `Источник: «${section.matrixModelSource}» совпадает с моделью («${actual}»)`
            : `Источник: в матрице «${section.matrixModelSource}», у модели «${actual}»`,
        });
      }
    }
  } else {
    rules.push({
      id: 'modelSource',
      applied: false,
      pass: true,
      text: 'Источник модели: в матрице не задан',
    });
  }

  return {
    rules,
    usernameContextMatch,
    groupsContextMatch,
    modelSourceContextMatch,
  };
}

function getFieldByName(
  fields: InputFactoryProps<keyof Row>[],
  name: string,
): InputFactoryProps<keyof Row> | undefined {
  return fields.find((f) => String(f.name) === name);
}

/**
 * Сверка строк матрицы с полями формы и (опционально) с контекстом сессии Keycloak и model_source.
 */
function buildFieldRuleLines(
  row: QaMatrixParsedRow,
  field: InputFactoryProps<keyof Row> | undefined,
  accessMatch: boolean,
  labelMatches: boolean,
  actualAccessible: boolean,
  fieldPresent: boolean,
  disabled: boolean,
  artifact?: Artifact | null,
): QaMatrixRuleLine[] {
  const req = row.requirementAccessible ? 'доступно' : 'недоступно';
  const act = actualAccessible ? 'доступно' : 'недоступно';

  let accessText: string;
  if (accessMatch) {
    accessText = `Доступность: совпадает (матрица: ${req}, форма: ${act})`;
  } else if (fieldPresent && disabled && row.requirementAccessible) {
    accessText = `Доступность: матрица ${req}, форма ${act} (поле есть, но disabled)`;
  } else {
    accessText = `Доступность: матрица ${req}, форма ${act}`;
  }

  const accessLine: QaMatrixRuleLine = {
    id: 'access',
    applied: true,
    pass: accessMatch,
    text: accessText,
  };

  const apiFlagsLine: QaMatrixRuleLine | null =
    !accessMatch && fieldPresent && row.requirementAccessible && artifact
      ? {
          id: 'apiFlags',
          applied: true,
          pass: true,
          text: `API артефакта (id=${artifact.artefact_id}): is_edit_flg=${artifact.is_edit_flg}, is_editable_by_role_sum=${artifact.is_editable_by_role_sum}, is_editable_by_role_sum_rm=${artifact.is_editable_by_role_sum_rm} — для SUM-модели смотрите в первую очередь is_editable_by_role_sum (должно быть 1); иначе проверяйте artefact_source_roles / бэкенд.`,
        }
      : null;

  const labelLine: QaMatrixRuleLine = row.expectedLabel?.trim()
    ? {
        id: 'label',
        applied: true,
        pass: labelMatches,
        text: labelMatches
          ? `Label: совпадает («${row.expectedLabel}»)`
          : `Label: ожидание «${row.expectedLabel}», в форме «${field?.label ?? ''}»`,
      }
    : {
        id: 'label',
        applied: false,
        pass: true,
        text: 'Label: в матрице не задан',
      };

  return [accessLine, ...(apiFlagsLine ? [apiFlagsLine] : []), labelLine];
}

/**
 * Секции с «Пользователь:», не совпадающим с текущим логином, не попадают в результат.
 * Секции без «Пользователь:» проверяются только по полям формы (без login/groups/model_source).
 */
export function validateQaMatrixAgainstFormFields(
  sections: QaMatrixSection[],
  fields: InputFactoryProps<keyof Row>[],
  runtimeContext?: QaMatrixRuntimeContext,
  /** Передать список артефактов с API — при расхождении доступа добавится строка с флагами is_edit_flg / is_editable_by_role_* */
  artifacts?: Artifact[],
): QaMatrixValidationOutcome {
  const skippedSectionsByLogin = sections.reduce((n, section) => {
    const expectedLogin = section.matrixUsername?.trim();
    if (!expectedLogin) {
      return n;
    }
    const sessionLogin = runtimeContext?.username?.trim();
    if (!sessionLogin || expectedLogin !== sessionLogin) {
      return n + 1;
    }
    return n;
  }, 0);

  const sectionsToProcess = sections.filter((section) => {
    const expectedLogin = section.matrixUsername?.trim();
    if (!expectedLogin) {
      return true;
    }
    const sessionLogin = runtimeContext?.username?.trim();
    return Boolean(sessionLogin && expectedLogin === sessionLogin);
  });

  const items = sectionsToProcess.flatMap((section) => {
    const expectedLogin = section.matrixUsername?.trim();
    const ctx = expectedLogin
      ? buildContextRuleLines(section, runtimeContext)
      : EMPTY_CONTEXT;

    return section.rows.map((row) => {
      const field = getFieldByName(fields, row.artefactTechLabel);
      const fieldPresent = Boolean(field);
      const disabled = Boolean(field?.disabled);
      const actualAccessible = fieldPresent && !disabled;

      const labelMatches =
        !row.expectedLabel ||
        (fieldPresent ? field?.label?.trim() === row.expectedLabel.trim() : true);

      const accessMatch = row.requirementAccessible === actualAccessible;
      const fieldPass = accessMatch && labelMatches;

      const artifactForRow =
        artifacts && artifacts.length > 0
          ? pickArtifactForField(artifacts, row.artefactTechLabel, {
              model_source: runtimeContext?.modelSource ?? undefined,
            })
          : undefined;

      const fieldRules = buildFieldRuleLines(
        row,
        field,
        accessMatch,
        labelMatches,
        actualAccessible,
        fieldPresent,
        disabled,
        artifactForRow,
      );

      const rules: QaMatrixRuleLine[] = [...ctx.rules, ...fieldRules];

      const pass = rules.every((r) => !r.applied || r.pass);
      const detail = rules.map((r) => r.text).join(' · ');

      return {
        ...row,
        fieldPresent,
        disabled,
        actualAccessible,
        labelMatches,
        accessMatch,
        fieldPass,
        usernameContextMatch: ctx.usernameContextMatch,
        groupsContextMatch: ctx.groupsContextMatch,
        modelSourceContextMatch: ctx.modelSourceContextMatch,
        sectionMatrixUsername: section.matrixUsername,
        sectionMatrixModelSource: section.matrixModelSource,
        pass,
        rules,
        detail,
      };
    });
  });

  return { items, skippedSectionsByLogin };
}

/** Текст отчёта для буфера обмена */
export function formatQaMatrixValidationReport(items: QaMatrixValidationItem[]): string {
  return items
    .map((r) => {
      const header = `${r.artefactTechLabel}${r.expectedLabel ? ` — «${r.expectedLabel}»` : ''}`;
      const lines = r.rules.map((x) => `  • ${x.text}`).join('\n');
      return `${header}\n${lines}`;
    })
    .join('\n\n');
}
