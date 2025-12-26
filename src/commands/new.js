import { promises as fs } from 'fs';
import { join } from 'path';
import { loadConfig } from '../utils/jerd.config.js';
import { loadTemplates, renderTemplate } from '../utils/template.js';
import { ensureDirectory, fileExists, getJerdPath } from '../utils/file-system.js';
import { openInEditor } from '../utils/editor.js';
import { parseDate } from '../utils/date-utils.js';
import { successMessage, errorMessage, createSpinner } from '../utils/ui.js';

async function newCommand(dateArg, options = {}) {
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
  const templates = await loadTemplates();

  // Determine template
  const templateName = options.template || config.defaultTemplate || 'default';
  const template = templates.templates.find(t => t.name === templateName);

  if (!template) {
    errorMessage(`Template "${templateName}" not found in templates.json`);
    const availableTemplates = templates.templates.map(t => t.name).join(', ');
    console.error(`Available templates: ${availableTemplates}\n`);
    process.exit(1);
  }

  // Calculate file path: Jerd/YYYY/MM/YYYY-MM-DD.md
  const year = date.format('YYYY');
  const month = date.format('MM');
  const filename = `${date.format('YYYY-MM-DD')}.md`;

  const jerdPath = getJerdPath();
  const yearPath = join(jerdPath, year);
  const monthPath = join(yearPath, month);
  const filePath = join(monthPath, filename);

  // Check if file exists
  const exists = await fileExists(filePath);

  if (!exists) {
    // Show spinner while creating file
    const spinner = createSpinner('✨ Creating journal entry...');
    spinner.start();

    // Create directory structure
    await ensureDirectory(monthPath);

    // Render template
    const content = renderTemplate(template, date);

    // Write file
    await fs.writeFile(filePath, content, 'utf8');

    spinner.succeed(`📝 Created ${filePath}`);
  } else {
    successMessage(`📖 Opening existing entry: ${filePath}`);
  }

  // Open in editor (use editor override if provided)
  await openInEditor(filePath, config.editor, options.editor);
}

export default newCommand;
