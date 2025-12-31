import { join } from 'path';
import { loadConfig } from '../utils/jerd.config.js';
import { fileExists, getJerdPath } from '../utils/file-system.js';
import { openInEditor } from '../utils/editor.js';
import { parseDate } from '../utils/date-utils.js';
import { successMessage, errorMessage } from '../utils/ui.js';

async function openCommand(dateArg, options = {}) {
  // Parse date or use today
  const date = parseDate(dateArg);
  if (!date) {
    errorMessage(`Invalid date format: ${dateArg}`);
    console.error('\nSupported formats:');
    console.error('  - Keywords: today, yesterday, tomorrow, now');
    console.error('  - ISO: 2025-12-25, 2025/12/25');
    console.error('  - Day: 25, 25th');
    console.error('  - Day + Month: 25 dec, 25th December');
    console.error('  - Day + Month + Year: 25 dec 24, 25th December 2024');
    console.error('  - Month: dec, December (defaults to 1st)');
    console.error('  - Month + Year: dec 24, December 2025');
    console.error('  - Weekday: monday, mon (finds most recent)');
    process.exit(1);
  }

  // Load configuration
  const config = await loadConfig();

  // Calculate file path: Jerd/YYYY/YYYY-MM/YYYY-MM-DD.md
  const year = date.format('YYYY');
  const month = date.format('YYYY-MM');
  const filename = `${date.format('YYYY-MM-DD')}.md`;

  const jerdPath = getJerdPath();
  const yearPath = join(jerdPath, year);
  const monthPath = join(yearPath, month);
  const filePath = join(monthPath, filename);

  // Check if file exists
  const exists = await fileExists(filePath);

  if (!exists) {
    errorMessage(`Journal entry not found: ${filePath}`);
    console.error('\nTip: Use "jerd new" to create a new journal entry.');
    process.exit(1);
  }

  successMessage(`📖 Opening journal entry: ${filePath}`);

  // Open in editor (use editor override if provided via -e flag)
  await openInEditor(filePath, config.editor, options.editor);
}

export default openCommand;
