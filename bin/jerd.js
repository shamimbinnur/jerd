#!/usr/bin/env node

import { Command } from 'commander';
import initCommand from '../src/commands/init.js';
import newCommand from '../src/commands/new.js';
import openCommand from '../src/commands/open.js';
import configCommand from '../src/commands/config.js';
import listCommand from '../src/commands/list.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { gradientTitle, dimText } from '../src/utils/ui.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('jerd')
  .description(dimText('📖 Minimal CLI tool for managing daily Markdown journals'))
  .version(packageJson.version, '-v, --version', 'Display version number')
  .addHelpText('beforeAll', () => {
    return gradientTitle('JERD') + '\n';
  });

program
  .command('init [path]')
  .description('🚀 Initialize Jerd project')
  .action(initCommand);

program
  .command('new [date...]')
  .description('✍️  Create journal entry (supports flexible date formats)')
  .option('-t, --template <name>', 'Template to use (overrides config)')
  .option('-e, --editor <name>', 'Editor to use (overrides config)')
  .action((dateArgs, options) => {
    // Join date arguments into a single string (e.g., "jan 4" instead of ["jan", "4"])
    const dateArg = dateArgs && dateArgs.length > 0 ? dateArgs.join(' ') : undefined;
    newCommand(dateArg, options);
  });

program
  .command('open [date...]')
  .description('📖 Open existing journal entry (supports flexible date formats)')
  .option('-e, --editor <name>', 'Editor to use (overrides config)')
  .action((dateArgs, options) => {
    // Join date arguments into a single string (e.g., "jan 4" instead of ["jan", "4"])
    const dateArg = dateArgs && dateArgs.length > 0 ? dateArgs.join(' ') : undefined;
    openCommand(dateArg, options);
  });

program
  .command('config')
  .description('⚙️  Configure Jerd settings (editor, template)')
  .option('-e, --editor', 'Configure editor only')
  .option('-t, --template', 'Configure default template only')
  .action(configCommand);

program
  .command('list [month] [year]')
  .description('📋 List journal entries')
  .option('-a, --all', 'Show full tree of all entries')
  .action((month, year, options) => {
    const args = month ? (year ? [month, year] : [month]) : [];
    listCommand(args, options);
  });

program.parse(process.argv);

// If no command provided, show help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
