import { promises as fs } from 'fs';
import { join } from 'path';
import inquirer from 'inquirer';
import { getJerdPath, ensureDirectory, fileExists } from '../utils/file-system.js';
import { createDefaultTemplates } from '../constants.js';
import { welcomeBanner, warningMessage, createSpinner, boxMessage, cyanText, boldText } from '../utils/ui.js';

async function initCommand(projectPath) {
  // Show welcome banner
  welcomeBanner();

  const jerdPath = getJerdPath(projectPath);
  const configPath = join(jerdPath, 'jerd.config.js');
  const templatesPath = join(jerdPath, 'templates.json');

  // Check if already initialized by looking for jerd.config.js
  const configExists = await fileExists(configPath);
  const templatesExists = await fileExists(templatesPath);

  if (configExists || templatesExists) {
    warningMessage(`Jerd is already initialized at ${jerdPath}`);
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: 'Do you want to overwrite the existing configuration?',
      default: false
    }]);

    if (!overwrite) {
      console.log('\nInitialization cancelled.');
      return;
    }
    console.log(''); // Add spacing
  }

  // Interactive prompts for editor selection
  const editorChoices = [
    { name: '📝 nano (Default)', value: 'nano' },
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
    message: '📝 Select your preferred editor:',
    choices: editorChoices,
    default: 'nano'
  }]);

  let editor = selectedEditor;
  if (selectedEditor === 'custom') {
    const { customEditor } = await inquirer.prompt([{
      type: 'input',
      name: 'customEditor',
      message: 'Enter your editor command:',
      default: process.env.EDITOR || 'nano'
    }]);
    editor = customEditor;
  }

  // Get available templates with descriptions
  const defaultTemplatesData = createDefaultTemplates();
  const templateChoices = defaultTemplatesData.templates.map(t => ({
    name: `${t.name} - ${t.description}`,
    value: t.name
  }));

  const { defaultTemplate } = await inquirer.prompt([{
    type: 'list',
    name: 'defaultTemplate',
    message: '📋 Choose your default template:',
    choices: templateChoices,
    default: 'default'
  }]);

  // Show spinner while creating files
  const spinner = createSpinner('⚡ Creating jerd configuration...');
  spinner.start();

  // Create directory if it doesn't exist
  await ensureDirectory(jerdPath);

  // Write jerd.config.js with user selections
  const config = {
    editor: editor,
    jerdPath: "./jerd",
    dateFormat: "YYYY-MM-DD",
    defaultTemplate: defaultTemplate,
  };
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

  // Write templates.json
  await fs.writeFile(templatesPath, JSON.stringify(defaultTemplatesData, null, 2), 'utf8');

  spinner.succeed('✨ Configuration created successfully!');

  // Show success box with next steps
  const successText = `${boldText('🎉 Initialized Jerd journal!')}

✓ Created jerd.config.js
✓ Created templates.json with 5 templates
✓ Editor: ${cyanText(editor)}
✓ Default template: ${cyanText(defaultTemplate)}

${boldText('📚 Next steps:')}
  ${cyanText('jerd new')}              ✍️  Create today's entry
  ${cyanText('jerd new yesterday')}    📅 Create yesterday's entry
  ${cyanText('jerd new -t work')}      💼 Use work template
  ${cyanText('jerd new -e vim')}       ⌨️  Override editor`;

  boxMessage(successText, {
    borderColor: 'green',
    padding: 1,
    margin: { top: 1, bottom: 1, left: 0, right: 0 }
  });
}

export default initCommand;
