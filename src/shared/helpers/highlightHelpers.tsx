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

