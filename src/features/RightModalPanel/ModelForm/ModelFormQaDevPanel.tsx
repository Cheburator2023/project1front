import React, { useCallback, useMemo, useState } from 'react';
import { Button, T } from '@admiral-ds/react-ui';

import type { Artifact } from '@shared/api/types';
import { Row } from '@shared/types';
import { InputFactoryProps } from '@shared/ui/organisms';
import { useUserStore } from '@shared/stores';

import {
  formatQaMatrixValidationReport,
  parseQaEditMatrixMarkdown,
  validateQaMatrixAgainstFormFields,
  type QaMatrixRuleLine,
  type QaMatrixValidationItem,
} from './qaEditMatrixValidation';

const ruleLineColor = (r: QaMatrixRuleLine): string => {
  if (!r.applied) {
    return '#6b7280';
  }
  if (r.id === 'apiFlags') {
    return '#1565c0';
  }
  return r.pass ? '#1b5e20' : '#b71c1c';
};

type ModelFormQaDevPanelProps = {
  fields: InputFactoryProps<keyof Row>[];
  /** model_source открытой модели (Keycloak / строка в таблице) */
  modelSource?: string | null;
  /** Список артефактов с API — для строки «API артефакта» при расхождении с матрицей */
  artifacts?: Artifact[];
};

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  right: 16,
  bottom: 16,
  width: 400,
  maxHeight: 'min(70vh, 560px)',
  zIndex: 10050,
  display: 'flex',
  flexDirection: 'column',
  background: '#fff',
  border: '1px solid #c5ccd6',
  borderRadius: 8,
  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 12px',
  background: '#f4f6f8',
  borderBottom: '1px solid #e5e7eb',
  gap: 8,
};

export const ModelFormQaDevPanel = ({ fields, modelSource, artifacts }: ModelFormQaDevPanelProps) => {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<QaMatrixValidationItem[] | null>(null);
  const [skippedSectionsByLogin, setSkippedSectionsByLogin] = useState(0);
  const [parseNote, setParseNote] = useState<string | null>(null);
  const [copyHint, setCopyHint] = useState<string | null>(null);

  const username = useUserStore((s) => s.username);
  const groups = useUserStore((s) => s.groups);

  const fieldNames = useMemo(() => new Set(fields.map((f) => String(f.name))), [fields]);

  const run = useCallback(() => {
    const parsed = parseQaEditMatrixMarkdown(input);
    setParseNote(
      parsed.length === 0
        ? 'Не найдено строк с «⊖» и блоком «в требованиях:» — вставьте текст как в qa_edit_matrix.md'
        : null,
    );
    const outcome = validateQaMatrixAgainstFormFields(
      parsed,
      fields,
      {
        username,
        groups,
        modelSource,
      },
      artifacts,
    );
    setResults(outcome.items);
    setSkippedSectionsByLogin(outcome.skippedSectionsByLogin);
  }, [input, fields, username, groups, modelSource, artifacts]);

  const summary = useMemo(() => {
    if (!results?.length) {
      return null;
    }
    const ok = results.filter((r) => r.pass).length;
    return `${ok} / ${results.length} совпало`;
  }, [results]);

  const sessionHint = useMemo(() => {
    const parts: string[] = [];
    if (username) {
      parts.push(`логин: ${username}`);
    }
    if (groups?.length) {
      parts.push(`groups: ${groups.join(', ')}`);
    }
    if (modelSource) {
      parts.push(`model_source: ${modelSource}`);
    }
    return parts.length ? parts.join(' · ') : null;
  }, [username, groups, modelSource]);

  const copyReport = useCallback(async () => {
    if (!results?.length) {
      return;
    }
    const headerLines = [
      sessionHint ? `Сессия: ${sessionHint}` : null,
      skippedSectionsByLogin > 0
        ? `Пропущено секций (другой «Пользователь:»): ${skippedSectionsByLogin}`
        : null,
    ].filter(Boolean);
    const body = formatQaMatrixValidationReport(results);
    const text = headerLines.length ? `${headerLines.join('\n')}\n\n${body}` : body;
    try {
      await navigator.clipboard.writeText(text);
      setCopyHint('Отчёт скопирован');
      window.setTimeout(() => setCopyHint(null), 2000);
    } catch {
      setCopyHint('Не удалось скопировать');
      window.setTimeout(() => setCopyHint(null), 2000);
    }
  }, [results, sessionHint, skippedSectionsByLogin]);

  const copyInput = useCallback(async () => {
    if (!input.trim()) {
      return;
    }
    try {
      await navigator.clipboard.writeText(input);
      setCopyHint('Текст вставки скопирован');
      window.setTimeout(() => setCopyHint(null), 2000);
    } catch {
      setCopyHint('Не удалось скопировать');
      window.setTimeout(() => setCopyHint(null), 2000);
    }
  }, [input]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 10050,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid #c5ccd6',
          background: '#fff',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}
      >
        QA матрица
      </button>
    );
  }

  return (
    <div style={panelStyle} data-model-form-qa-dev-panel>
      <div style={headerStyle}>
        <T font="Subtitle/Subtitle 3">QA edit matrix (dev / innodev)</T>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button dimension="s" appearance="secondary" onClick={() => setOpen(false)}>
            Скрыть
          </Button>
        </div>
      </div>

      <div style={{ padding: 10, overflow: 'auto', flex: 1, minHeight: 0 }}>
        <T font="Caption/Caption 1" color="Neutral/Neutral 50" as="div" style={{ marginBottom: 6 }}>
          Вставьте фрагмент из tasks/qa_edit_matrix.md. Секции с «Пользователь:» учитываются только если логин
          совпадает с текущим; иначе секция пропускается. Без «Пользователь:» проверяются только поля формы.
        </T>
        {sessionHint ? (
          <T
            font="Caption/Caption 1"
            color="Neutral/Neutral 50"
            as="div"
            style={{ marginBottom: 6, wordBreak: 'break-word' }}
          >
            Сессия: {sessionHint}
          </T>
        ) : null}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'Пользователь: …\nМодель создана в: …\n⊖ […] – фронт …, в требованиях: …'}
          style={{
            width: '100%',
            minHeight: 120,
            fontSize: 12,
            fontFamily: 'monospace',
            boxSizing: 'border-box',
            marginBottom: 8,
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button dimension="s" onClick={run}>
            Проверить
          </Button>
          <Button
            dimension="s"
            appearance="secondary"
            disabled={!input.trim()}
            onClick={copyInput}
            title="Копировать текст из поля в буфер"
          >
            Копировать ввод
          </Button>
          <Button
            dimension="s"
            appearance="secondary"
            disabled={!results?.length}
            onClick={copyReport}
            title="Копировать результаты проверки"
          >
            Копировать отчёт
          </Button>
          {copyHint ? (
            <T font="Caption/Caption 1" as="span" style={{ color: '#2e7d32' }}>
              {copyHint}
            </T>
          ) : null}
          <T font="Caption/Caption 1" color="Neutral/Neutral 50" as="span">
            Полей в форме: {fieldNames.size}
          </T>
        </div>
        {parseNote ? (
          <T font="Caption/Caption 1" as="div" style={{ marginBottom: 8, color: '#b45309' }}>
            {parseNote}
          </T>
        ) : null}
        {skippedSectionsByLogin > 0 ? (
          <T font="Caption/Caption 1" as="div" style={{ marginBottom: 8, color: '#6b7280' }}>
            Пропущено секций (в матрице другой «Пользователь:»): {skippedSectionsByLogin}
          </T>
        ) : null}
        {results !== null &&
        results.length === 0 &&
        !parseNote &&
        skippedSectionsByLogin > 0 ? (
          <T font="Caption/Caption 1" as="div" style={{ marginBottom: 8, color: '#b45309' }}>
            Нет строк для вашего логина — все секции с «Пользователь:» относятся к другим пользователям.
          </T>
        ) : null}
        {summary ? (
          <T font="Body/Body 2 Long" as="div" style={{ marginBottom: 8 }}>
            {summary}
          </T>
        ) : null}
        {results && results.length > 0 ? (
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.45 }}>
            {results.map((r) => (
              <li
                key={`${r.sectionMatrixUsername ?? ''}-${r.sectionMatrixModelSource ?? ''}-${r.artefactTechLabel}-${r.expectedLabel}`}
                style={{
                  marginBottom: 10,
                  color: '#111827',
                }}
              >
                <strong>{r.artefactTechLabel}</strong>
                {r.expectedLabel ? ` — «${r.expectedLabel}»` : ''}
                <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {r.rules.map((line) => (
                    <span
                      key={`${r.artefactTechLabel}-${line.id}-${line.text}`}
                      style={{ color: ruleLineColor(line) }}
                    >
                      {line.text}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
};
