const fs = require('fs');
const path = require('path');

/**
 * Парсит первую (самую свежую) запись CHANGELOG.md вида:
 *   # [1.60.0](<url>) (2026-04-20)
 *   ## [1.60.1](<url>) (2026-04-22)
 * и возвращает { version, date }. При неудаче возвращает { version: '', date: '' }.
 */
function readChangelogVersion() {
  try {
    const changelogPath = path.resolve(__dirname, 'CHANGELOG.md');
    const content = fs.readFileSync(changelogPath, 'utf8');

    for (const line of content.split(/\r?\n/)) {
      const versionMatch = line.match(/^#{1,6}\s*\[(\d+\.\d+\.\d+)\]/);
      if (!versionMatch) continue;

      const dateMatch = line.match(/\((\d{4}-\d{2}-\d{2})\)/);
      return {
        version: versionMatch[1],
        date: dateMatch ? dateMatch[1] : '',
      };
    }
  } catch (_) {
    // noop
  }
  return { version: '', date: '' };
}

module.exports = { readChangelogVersion };
