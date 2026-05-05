import { promises as fs } from 'fs';
import { join } from 'path';
import { loadConfig } from '../utils/jerd.config.js';
import { loadTemplates, renderTemplate } from '../utils/template.js';
import { ensureDirectory, fileExists, getJerdPath } from '../utils/file-system.js';
import { openInEditor } from '../utils/editor.js';
import { parseDate } from '../utils/date-utils.js';
import { successMessage, errorMessage, createSpinner, gentleHint, celebrationLine } from '../utils/ui.js';
import { MOOD_VALUES, MOOD_ORDER } from '../constants.js';
import inquirer from 'inquirer';

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
    // Ask for mood first if uiStyle is 'astro'
    let mood = null;
    if (config.uiStyle === 'astro') {
      const moodChoices = MOOD_ORDER.map(m => ({
        name: `${MOOD_VALUES[m].emoji} ${MOOD_VALUES[m].label}`,
        value: m
      }));

      const response = await inquirer.prompt([{
        type: 'list',
        name: 'mood',
        message: '💭 How are you feeling today?',
        choices: moodChoices,
        default: 'good'
      }]);
      mood = response.mood;
    }

    // Show spinner while creating file
    const spinner = createSpinner('✨ Creating your cozy entry...');
    spinner.start();

    // Create directory structure
    await ensureDirectory(monthPath);

    // Render template with mood
    const content = renderTemplate(template, date, mood);

    // Write file
    await fs.writeFile(filePath, content, 'utf8');

    spinner.succeed(`📝 Created ${filePath}`);

    // Gentle encouragement
    gentleHint('Take your time—your thoughts deserve space.');
  } else {
    successMessage(`📖 Opening existing entry: ${filePath}`);
  }

  // Open in editor (use editor override if provided)
  await openInEditor(filePath, config.editor, options.editor);
}

export default newCommand;
