const fs = require('fs');
const path = require('path');

/**
 * Парсит первую (самую свежую) запись CHANGELOG.md вида:
 *   # [1.60.0](<url>) (2026-04-20)
 * и возвращает { version, date }. При неудаче возвращает { version: '', date: '' }.
 */
function readChangelogVersion() {
  try {
    const changelogPath = path.resolve(__dirname, 'CHANGELOG.md');
    const content = fs.readFileSync(changelogPath, 'utf8');
    const match = content.match(
      /^#\s*\[(\d+\.\d+\.\d+)\][^\n]*\((\d{4}-\d{2}-\d{2})\)/m,
    );
    if (match) {
      return { version: match[1], date: match[2] };
    }
  } catch (_) {
    // noop
  }
  return { version: '', date: '' };
}

module.exports = { readChangelogVersion };
