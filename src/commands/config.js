import inquirer from 'inquirer';
import { loadConfig, updateConfig } from '../utils/jerd.config.js';
import { createDefaultTemplates } from '../constants.js';
import { createSpinner, successMessage, cyanText, boldText } from '../utils/ui.js';
import { getAllThemes } from '../utils/theme.js';

async function configCommand(options) {
  // Load current config
  const currentConfig = await loadConfig();

  // Prepare updates object
  const updates = {};

  // If specific option flags are passed, only prompt for those
  const shouldPromptEditor = options.editor !== undefined;
  const shouldPromptTemplate = options.template !== undefined;
  const shouldPromptTheme = options.theme !== undefined;
  const shouldPromptAll = !shouldPromptEditor && !shouldPromptTemplate && !shouldPromptTheme;

  // Editor configuration
  if (shouldPromptAll || shouldPromptEditor) {
    const editorChoices = [
      { name: '📝 nano', value: 'nano' },
      { name: '⌨️  vim', value: 'vim' },
      { name: '🚀 nvim', value: 'nvim' },
      { name: '💻 code (VS Code)', value: 'code' },
      { name: '🔧 emacs', value: 'emacs' },
      { name: '✨ subl (Sublime Text)', value: 'subl' },
      { name: '✏️  Other (type manually)', value: 'custom' }
    ];

    const { selectedEditor } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedEditor',
      message: `📝 Select your preferred editor (current: ${cyanText(currentConfig.editor)}):`,
      choices: editorChoices,
      default: currentConfig.editor
    }]);

    let editor = selectedEditor;
    if (selectedEditor === 'custom') {
      const { customEditor } = await inquirer.prompt([{
        type: 'input',
        name: 'customEditor',
        message: 'Enter your editor command:',
        default: currentConfig.editor
      }]);
      editor = customEditor;
    }

    if (editor !== currentConfig.editor) {
      updates.editor = editor;
    }
  }

  // Template configuration
  if (shouldPromptAll || shouldPromptTemplate) {
    const defaultTemplatesData = createDefaultTemplates();
    const templateChoices = defaultTemplatesData.templates.map(t => ({
      name: `${t.name} - ${t.description}`,
      value: t.name
    }));

    const { defaultTemplate } = await inquirer.prompt([{
      type: 'list',
      name: 'defaultTemplate',
      message: `📋 Choose your default template (current: ${cyanText(currentConfig.defaultTemplate)}):`,
      choices: templateChoices,
      default: currentConfig.defaultTemplate
    }]);

    if (defaultTemplate !== currentConfig.defaultTemplate) {
      updates.defaultTemplate = defaultTemplate;
    }
  }

  // Theme configuration
  if (shouldPromptAll || shouldPromptTheme) {
    const themeChoices = getAllThemes().map(t => ({
      name: `${t.icon || '🎨'} ${t.name} - ${t.description}`,
      value: t.value || t.name.toLowerCase()
    }));

    // Fallback if currentTheme is undefined in config
    const currentThemeVal = currentConfig.theme || 'cozy';

    const { theme } = await inquirer.prompt([{
      type: 'list',
      name: 'theme',
      message: `🎨 Choose your visual theme (current: ${cyanText(currentThemeVal)}):`,
      choices: themeChoices,
      default: currentThemeVal
    }]);

    if (theme !== currentConfig.theme) {
      updates.theme = theme;
    }
  }

  // If no changes were made
  if (Object.keys(updates).length === 0) {
    console.log('\nNo changes made to configuration.');
    return;
  }

  // Update the config
  const spinner = createSpinner('⚡ Updating configuration...');
  spinner.start();

  await updateConfig(updates);

  spinner.succeed('✨ Configuration updated successfully!');

  // Show what was updated
  console.log();
  if (updates.editor) {
    successMessage(`✓ Editor: ${cyanText(updates.editor)}`);
  }
  if (updates.defaultTemplate) {
    successMessage(`✓ Default template: ${cyanText(updates.defaultTemplate)}`);
  }
  if (updates.theme) {
    successMessage(`✓ Theme: ${cyanText(updates.theme)}`);
  }
  console.log();
}

export default configCommand;
