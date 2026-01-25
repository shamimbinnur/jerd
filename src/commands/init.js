import { promises as fs } from 'fs';
import { join, relative } from 'path';
import inquirer from 'inquirer';
import { getJerdPath, ensureDirectory, fileExists } from '../utils/file-system.js';
import { createDefaultTemplates } from '../constants.js';
import { welcomeBanner, warningMessage, createSpinner, cozyBox, cyanText, boldText, softHeader, stepLine, celebrationLine, gentleHint } from '../utils/ui.js';

async function initCommand(projectPath) {
  // Show welcome banner
  welcomeBanner();

  softHeader('Setting up your cozy journal');

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

  // Step 1: Choose editor
  stepLine(1, 3, 'Choose your favorite editor');
  
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

  // Step 2: Choose template
  stepLine(2, 3, 'Pick your default template');
  
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

  // Step 3: Create configuration
  stepLine(3, 3, 'Creating your cozy setup');
  
  // Show spinner while creating files
  const spinner = createSpinner('✨ Setting up your journal...');
  spinner.start();

  // Create directory if it doesn't exist
  await ensureDirectory(jerdPath);

  // Write jerd.config.js with user selections
  const config = {
    editor: editor,
    jerdPath: "./jerd",
    dateFormat: "YYYY-MM-DD",
    defaultTemplate: defaultTemplate,
    uiStyle: "astro", // Add cozy Astro-style UI
  };
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');

  // Write templates.json
  await fs.writeFile(templatesPath, JSON.stringify(defaultTemplatesData, null, 2), 'utf8');

  spinner.succeed('✨ Your cozy journal is ready!');

  celebrationLine();

  // Show success box with next steps
  const successText = `${boldText('🌟 Welcome to your cozy journal!')}

✓ Created jerd.config.js
✓ Created templates.json with 5 templates
✓ Editor: ${cyanText(editor)}
✓ Default template: ${cyanText(defaultTemplate)}

${boldText('📚 Your first steps:')}
  ${cyanText('jerd new')}              ✍️  Create today's entry
  ${cyanText('jerd new yesterday')}    📅 Create yesterday's entry
  ${cyanText('jerd new -t work')}      💼 Use work template
  ${cyanText('jerd new -e vim')}       ⌨️  Override editor`;

  cozyBox(successText);

  // Show cd instruction if jerd was created in a subdirectory
  const cwd = process.cwd();
  if (jerdPath !== cwd) {
    const relativePath = relative(cwd, jerdPath);
    gentleHint(`cd '${relativePath}' to start journaling`);
  }
}

export default initCommand;
