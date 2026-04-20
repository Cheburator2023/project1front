import type { GridApi } from 'ag-grid-community';

/**
 * Highlights search text within a string by wrapping matches in a span with highlighting class
 * @param text - The text to search within
 * @param searchText - The search term to highlight
 * @returns JSX element with highlighted text or original text if no search
 */
export const highlightText = (
  text: string | number | null | undefined,
  searchText: string,
): React.ReactNode => {
  if (!searchText || !text) return text;

  const textStr = String(text);
  const searchStr = searchText.trim();

  if (!searchStr) return textStr;

  // Check if this is a date and try to highlight in the displayed format
  const dateFormats = parseDateFormats(textStr);

  if (dateFormats) {
    const searchLower = searchStr.toLowerCase();

    // Find which date format matches the search and highlight in that format
    const matchedFormatEntry = Object.entries(dateFormats).find(([, formatValue]) => {
      const formatStr = formatValue.toString();
      return formatStr.toLowerCase().includes(searchLower);
    });

    if (matchedFormatEntry) {
      const formatStr = matchedFormatEntry[1].toString();
      const regex = new RegExp(`(${searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = formatStr.split(regex);

      if (parts.length > 1) {
        return (
          <>
            {parts.map((part, index) =>
              regex.test(part) ? (
                <span key={index} className="search-highlight">
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </>
        );
      }
    }
  }

  // Fallback to original text highlighting
  const regex = new RegExp(`(${searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = textStr.split(regex);

  // If no matches found, return original text
  if (parts.length === 1) return textStr;

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="search-highlight">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

/**
 * Parses a date string in various formats and returns normalized representations
 * @param dateString - The date string to parse
 * @returns Object with different normalized date formats or null if invalid
 */
const parseDateFormats = (dateString: string) => {
  if (!dateString) return null;

  // Try to parse as date with explicit locale handling
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    // Try alternative parsing for different formats
    const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, year, month, day] = isoMatch;
      return createFormats(parseInt(year), parseInt(month), parseInt(day));
    }
    return null;
  }

  // Get components with explicit locale handling
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return createFormats(year, month, day);
};

// Helper function to create all date formats
const createFormats = (year: number, month: number, day: number) => {
  // Format with leading zeros
  const pad = (num: number) => num.toString().padStart(2, '0');

  return {
    // ISO format: 2025-04-21
    iso: `${year}-${pad(month)}-${pad(day)}`,
    // DD/MM/YYYY: 21/04/2025
    dmy: `${pad(day)}/${pad(month)}/${year}`,
    // DD.MM.YYYY: 21.04.2025
    dmyDots: `${pad(day)}.${pad(month)}.${year}`,
    // MM/DD/YYYY: 04/21/2025
    mdy: `${pad(month)}/${pad(day)}/${year}`,
    // Local string format
    local: new Date(year, month - 1, day).toLocaleDateString('ru-RU'),
    // Components for partial matching
    day: pad(day),
    month: pad(month),
    year: year.toString(),
    // Additional formats for partial date matching
    dayMonth: `${pad(day)}/${pad(month)}`,
    monthDay: `${pad(month)}/${pad(day)}`,
    dayMonthDots: `${pad(day)}.${pad(month)}`,
    monthDayDots: `${pad(month)}.${pad(day)}`,
    // Without leading zeros
    dayNoZero: day.toString(),
    monthNoZero: month.toString(),
    dayMonthNoZero: `${day}/${month}`,
    monthDayNoZero: `${month}/${day}`,
  };
};

/**
 * Checks if a cell value contains the search text, handling date formatting
 * @param value - The cell value to check
 * @param searchText - The search term to look for
 * @returns boolean indicating if the value contains the search text
 */
export const isCellMatched = (value: any, searchText: string): boolean => {
  if (!searchText || !value) return false;

  const textStr = String(value).toLowerCase();
  const searchStr = searchText.toLowerCase().trim();

  // Direct string match
  if (textStr.includes(searchStr)) {
    return true;
  }

  // Try to parse as date and check all formats
  const dateFormats = parseDateFormats(value);

  if (dateFormats) {
    const searchLower = searchStr.toLowerCase();

    // Check all date formats
    const matchFound = Object.values(dateFormats).some((format) => {
      const formatStr = format.toString().toLowerCase();
      const matches =
        formatStr === searchLower ||
        (formatStr.length > searchLower.length && formatStr.includes(searchLower)) ||
        (searchLower.length <= formatStr.length && formatStr.startsWith(searchLower));

      return matches;
    });

    return matchFound;
  }

  return false;
};

export type SearchMatchColumn = { colId: string; headerName: string };

/** Распарсенная строка поиска: значение для ячеек + опционально колонка по суффиксу заголовка */
export type ParsedGridSearch = {
  raw: string;
  valueQuery: string;
  columnColId: string | null;
  /** Ввод совпал с названием колонки — подсветка заголовка, без фильтра по значению ячеек */
  columnHeaderOnly?: boolean;
};

export const EMPTY_PARSED_GRID_SEARCH: ParsedGridSearch = {
  raw: '',
  valueQuery: '',
  columnColId: null,
  columnHeaderOnly: false,
};

let parsedGridSearchHighlight: ParsedGridSearch = { ...EMPTY_PARSED_GRID_SEARCH };

export const setParsedGridSearchForHighlight = (p: ParsedGridSearch): void => {
  parsedGridSearchHighlight = p;
};

export const getParsedGridSearchForHighlight = (): ParsedGridSearch => parsedGridSearchHighlight;

/** Текст для подсветки в ячейке: учитывает режим «значение + колонка» */
export const getGridSearchHighlightForCell = (colId: string | undefined): string | undefined => {
  if (!colId) {
    return undefined;
  }
  const p = parsedGridSearchHighlight;
  if (p.columnHeaderOnly) {
    return undefined;
  }
  const effective = (p.valueQuery || '').trim() || (p.raw || '').trim();
  if (!effective) {
    return undefined;
  }
  if (p.columnColId && p.columnColId !== colId) {
    return undefined;
  }
  return effective;
};

export type ParsedGridSearchQuery = {
  valueQuery: string;
  columnColId: string | null;
  columnHeaderOnly: boolean;
};

type ColumnHeaderRef = { colId: string; headerName: string };

/** Точное совпадение или ввод — префикс заголовка (без поиска подстроки). */
const findColumnHeaderStrictMatch = (
  q: string,
  columns: ColumnHeaderRef[],
): ColumnHeaderRef | null => {
  const qTrim = q.trim();
  if (!qTrim) {
    return null;
  }
  const qLower = qTrim.toLowerCase();

  const exact = columns.find((c) => c.headerName.trim().toLowerCase() === qLower);
  if (exact) {
    return exact;
  }

  if (qTrim.length < 2) {
    return null;
  }

  const prefixCandidates = columns.filter((c) => {
    const H = c.headerName.trim();
    return H.length > 0 && H.toLowerCase().startsWith(qLower);
  });
  if (prefixCandidates.length === 1) {
    return prefixCandidates[0];
  }
  if (prefixCandidates.length > 1) {
    prefixCandidates.sort((a, b) => b.headerName.length - a.headerName.length);
    return prefixCandidates[0];
  }

  return null;
};

/** Подстрока в заголовке — только если строгого совпадения не было. */
const findColumnHeaderLooseMatch = (
  q: string,
  columns: ColumnHeaderRef[],
): ColumnHeaderRef | null => {
  const qTrim = q.trim();
  if (!qTrim || qTrim.length < 3) {
    return null;
  }
  const qLower = qTrim.toLowerCase();

  const subCandidates = columns.filter((c) =>
    c.headerName.trim().toLowerCase().includes(qLower),
  );
  if (subCandidates.length === 1) {
    return subCandidates[0];
  }
  if (subCandidates.length > 1) {
    subCandidates.sort((a, b) => b.headerName.length - a.headerName.length);
    return subCandidates[0];
  }

  return null;
};

/**
 * 1) Строго: вся строка = заголовок или префикс заголовка колонки → только колонка.
 * 2) Конец строки = начало заголовка другой колонки → значение + колонка (иначе «модель»
 *    в конце «действующая модель» ошибочно цеплялся к «Модель входит…»).
 * 3) Нестрого: подстрока в заголовке → только колонка.
 * 4) Иначе — поиск по значению во всех колонках.
 */
export const parseGridSearchQuery = (
  raw: string,
  columns: { colId: string; headerName: string }[],
): ParsedGridSearchQuery => {
  const q = raw.trim();
  if (!q) {
    return { valueQuery: '', columnColId: null, columnHeaderOnly: false };
  }

  const strictHeader = findColumnHeaderStrictMatch(q, columns);
  if (strictHeader) {
    return {
      valueQuery: '',
      columnColId: strictHeader.colId,
      columnHeaderOnly: true,
    };
  }

  const qLower = q.toLowerCase();
  const sorted = [...columns].sort((a, b) => b.headerName.length - a.headerName.length);

  for (const col of sorted) {
    const H = col.headerName.trim();
    if (H.length < 4) {
      continue;
    }
    for (let len = Math.min(H.length, q.length); len >= 4; len -= 1) {
      const prefix = H.slice(0, len).toLowerCase();
      if (qLower.endsWith(prefix)) {
        const valueQuery = q.slice(0, q.length - len).trimEnd();
        if (valueQuery.length >= 1) {
          return { valueQuery, columnColId: col.colId, columnHeaderOnly: false };
        }
      }
    }
  }

  const looseHeader = findColumnHeaderLooseMatch(q, columns);
  if (looseHeader) {
    return {
      valueQuery: '',
      columnColId: looseHeader.colId,
      columnHeaderOnly: true,
    };
  }

  return { valueQuery: q, columnColId: null, columnHeaderOnly: false };
};

/**
 * Колонки (в порядке отображения в гриде), в которых есть совпадение с поиском
 * по той же логике, что и подсветка ячеек (`isCellMatched`), только среди строк,
 * прошедших фильтр (включая quick filter). С учётом `parseGridSearchQuery`.
 */
export const getDisplayedColumnsWithSearchMatches = (
  api: GridApi,
  searchText: string,
  dataColumnNames: string[],
  columnHeaders: { colId: string; headerName: string }[],
): SearchMatchColumn[] => {
  const parsed = parseGridSearchQuery(searchText.trim(), columnHeaders);
  const effective = (parsed.valueQuery || '').trim();

  if (dataColumnNames.length === 0) {
    return [];
  }

  const allowed = new Set(dataColumnNames);
  const displayed = api.getAllDisplayedColumns();

  if (parsed.columnHeaderOnly && parsed.columnColId) {
    if (!allowed.has(parsed.columnColId)) {
      return [];
    }
    const col = displayed.find((c) => c.getColId() === parsed.columnColId);
    if (!col) {
      return [];
    }
    const colDef = col.getColDef();
    const headerName = colDef.headerName ?? colDef.field ?? parsed.columnColId;
    return [{ colId: parsed.columnColId, headerName: String(headerName) }];
  }

  if (!effective) {
    return [];
  }

  const result: SearchMatchColumn[] = [];
  const scanOnlyColId = parsed.columnColId;

  for (const col of displayed) {
    const colId = col.getColId();
    if (!allowed.has(colId)) {
      continue;
    }
    if (scanOnlyColId && colId !== scanOnlyColId) {
      continue;
    }

    let hasMatch = false;
    api.forEachNodeAfterFilter((node) => {
      if (hasMatch || !node.data) {
        return;
      }
      const val = (node.data as Record<string, unknown>)[colId];
      if (isCellMatched(val, effective)) {
        hasMatch = true;
      }
    });

    if (hasMatch) {
      const colDef = col.getColDef();
      const headerName = colDef.headerName ?? colDef.field ?? colId;
      result.push({ colId, headerName: String(headerName) });
    }
  }

  return result;
};
