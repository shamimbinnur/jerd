import { promises as fs } from 'fs';
import { join } from 'path';
import inquirer from 'inquirer';
import { fileExists, getJerdPath } from '../utils/file-system.js';
import { parseDate } from '../utils/date-utils.js';
import { successMessage, errorMessage, warningMessage, gentleHint } from '../utils/ui.js';

async function delCommand(dateArg) {
  // Parse date or use today
  const date = parseDate(dateArg);
  if (!date) {
    errorMessage(`Invalid date format: ${dateArg}`);
    gentleHint('Try keywords like "today", "yesterday", or dates like "2025-12-25"');
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
    gentleHint('Nothing to delete here!');
    process.exit(1);
  }

  // Ask for confirmation
  warningMessage(`You are about to delete: ${filename}`);

  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: '🗑️  Are you sure you want to delete this entry?',
    default: false
  }]);

  if (!confirm) {
    console.log('\nDeletion cancelled.');
    return;
  }

  // Delete the file
  await fs.unlink(filePath);
  successMessage(`🗑️  Deleted: ${filename}`);
}

export default delCommand;
