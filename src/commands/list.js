import { promises as fs } from 'fs';
import { join } from 'path';
import { getJerdPath, fileExists } from '../utils/file-system.js';
import { errorMessage, infoMessage, softHeader, gentleHint, notInitializedBanner } from '../utils/ui.js';
import chalk from 'chalk';
import dayjs from 'dayjs';

// Cozy icons
const ICONS = {
  folder: '📁',
  year: '📅',
  month: '📆',
  file: '📝',
  tree: '├──',
  treeLast: '└──',
  treeVertical: '│  ',
  treeSpace: '   '
};

// Month names for display
const MONTH_NAMES_DISPLAY = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December'
};

// Month name to number mapping
const MONTH_NAMES = {
  'january': '01', 'february': '02', 'march': '03', 'april': '04',
  'may': '05', 'june': '06', 'july': '07', 'august': '08',
  'september': '09', 'october': '10', 'november': '11', 'december': '12',
  'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
  'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
  'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
  'sept': '09'
};

// Parse month name from user input (supports full and abbreviated)
function getMonthNumber(monthStr) {
  const normalized = monthStr.toLowerCase().trim();
  return MONTH_NAMES[normalized] || null;
}

/**
 * Extracts month number from folder name
 * @param {string} folderName - The month folder name (e.g., "2025-12")
 * @returns {string|null} - The 2-digit month number (e.g., "12")
 */
function extractMonthNumber(folderName) {
  // New format: YYYY-MM (e.g., "2025-12")
  if (/^\d{4}-\d{2}$/.test(folderName)) {
    return folderName.split('-')[1];
  }
  return null;
}

/**
 * Reads directory contents and returns sorted array
 */
async function readDirectory(dirPath) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    return [];
  }
}

/**
 * Checks if a path is a directory
 */
async function isDirectory(path) {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Prints a tree structure for a single month
 */
async function printMonth(monthPath, monthFolderName, prefix = '', isLast = true) {
  const monthNumber = extractMonthNumber(monthFolderName);
  const monthName = monthNumber ? MONTH_NAMES_DISPLAY[monthNumber] : monthFolderName;
  const connector = isLast ? ICONS.treeLast : ICONS.tree;
  const monthColor = chalk.hex('#8b5cf6').bold(monthName);

  console.log(`${prefix}${connector} ${ICONS.month} ${monthColor}`);

  // Read journal files in the month
  const files = await readDirectory(monthPath);
  const journalFiles = files.filter(f => f.isFile() && f.name.endsWith('.md'));

  const childPrefix = prefix + (isLast ? ICONS.treeSpace : ICONS.treeVertical);

  journalFiles.forEach((file, index) => {
    const isLastFile = index === journalFiles.length - 1;
    const fileConnector = isLastFile ? ICONS.treeLast : ICONS.tree;
    const fileName = chalk.hex('#10b981')(file.name);
    console.log(`${childPrefix}${fileConnector} ${ICONS.file} ${fileName}`);
  });
}

/**
 * Prints a tree structure for a single year
 */
async function printYear(yearPath, year, prefix = '', isLast = true) {
  const connector = isLast ? ICONS.treeLast : ICONS.tree;
  const yearColor = chalk.hex('#f59e0b').bold(year);

  console.log(`${prefix}${connector} ${ICONS.year} ${yearColor}`);

  // Read months in the year
  const entries = await readDirectory(yearPath);
  const months = entries.filter(e => e.isDirectory());

  const childPrefix = prefix + (isLast ? ICONS.treeSpace : ICONS.treeVertical);

  for (let i = 0; i < months.length; i++) {
    const month = months[i];
    const isLastMonth = i === months.length - 1;
    await printMonth(join(yearPath, month.name), month.name, childPrefix, isLastMonth);
  }
}

/**
 * Prints the full journal tree
 */
async function printFullTree(jerdPath) {
  const entries = await readDirectory(jerdPath);
  const years = entries.filter(e => e.isDirectory() && /^\d{4}$/.test(e.name));

  if (years.length === 0) {
    infoMessage('No journal entries found.');
    gentleHint('Start your first entry with "jerd new"');
    return;
  }

  softHeader('Your Journal Entries');

  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    const isLast = i === years.length - 1;
    await printYear(join(jerdPath, year.name), year.name, '', isLast);
  }

  console.log('');
}

/**
 * Prints entries for a specific month and year
 */
async function printMonthEntries(jerdPath, monthNumber, year) {
  const yearPath = join(jerdPath, year);
  const monthFolderName = `${year}-${monthNumber}`;
  const monthPath = join(yearPath, monthFolderName);

  if (!(await fileExists(monthPath)) || !(await isDirectory(monthPath))) {
    errorMessage(`No entries found for ${MONTH_NAMES_DISPLAY[monthNumber]} ${year}`);
    return;
  }

  const files = await readDirectory(monthPath);
  const journalFiles = files.filter(f => f.isFile() && f.name.endsWith('.md'));

  if (journalFiles.length === 0) {
    infoMessage(`No journal entries in ${MONTH_NAMES_DISPLAY[monthNumber]} ${year}`);
    gentleHint('Create an entry with "jerd new" for this month');
    return;
  }

  softHeader(`${ICONS.month} ${MONTH_NAMES_DISPLAY[monthNumber]} ${year}`);

  journalFiles.forEach((file, index) => {
    const isLast = index === journalFiles.length - 1;
    const connector = isLast ? ICONS.treeLast : ICONS.tree;
    const fileName = chalk.green(file.name);
    console.log(`${connector} ${ICONS.file} ${fileName}`);
  });

  console.log('');
}

/**
 * Prints entries for a specific year
 */
async function printYearEntries(jerdPath, year) {
  const yearPath = join(jerdPath, year);

  if (!(await fileExists(yearPath)) || !(await isDirectory(yearPath))) {
    errorMessage(`No entries found for ${year}`);
    return;
  }

  const entries = await readDirectory(yearPath);
  const months = entries.filter(e => e.isDirectory());

  if (months.length === 0) {
    infoMessage(`No journal entries in ${year}`);
    gentleHint('Create an entry with "jerd new" for this year');
    return;
  }

  softHeader(`${ICONS.year} ${year}`);

  // Read months in the year and print them directly (without repeating year)
  const childPrefix = '';
  for (let i = 0; i < months.length; i++) {
    const month = months[i];
    const isLastMonth = i === months.length - 1;
    await printMonth(join(yearPath, month.name), month.name, childPrefix, isLastMonth);
  }

  console.log('');
}

/**
 * Main list command
 */
async function listCommand(args, options = {}) {
  const jerdPath = getJerdPath();

  // Check if jerd directory exists
  if (!(await fileExists(jerdPath))) {
    notInitializedBanner();
    process.exit(1);
  }

  // Handle -a flag for full tree
  if (options.all) {
    await printFullTree(jerdPath);
    return;
  }

  // If no arguments, show full tree
  if (!args || args.length === 0) {
    await printFullTree(jerdPath);
    return;
  }

  // Parse first argument - could be month or year
  const firstArg = args[0];
  const secondArg = args[1];

  // Check if first argument is a 4-digit year
  if (/^\d{4}$/.test(firstArg)) {
    // First argument is a year
    await printYearEntries(jerdPath, firstArg);
    return;
  }

  // Otherwise, treat first argument as month
  const monthNumber = getMonthNumber(firstArg);

  if (!monthNumber) {
    errorMessage(`Invalid month or year: ${firstArg}`);
    gentleHint('Try month names like "January", "jan", or a year like "2024"');
    console.error('\nSupported formats:');
    console.error('  - Month names: January, February, jan, feb, ...');
    console.error('  - Year: 2024, 2023, ...\n');
    process.exit(1);
  }

  // Determine year (from second argument or current year)
  const year = secondArg || dayjs().format('YYYY');

  // Validate year format if provided
  if (secondArg && !/^\d{4}$/.test(secondArg)) {
    errorMessage(`Invalid year format: ${secondArg}`);
    gentleHint('Year should be a 4-digit number like "2024"');
    console.error('\nYear must be a 4-digit number (e.g., 2024)\n');
    process.exit(1);
  }

  // Print month entries
  await printMonthEntries(jerdPath, monthNumber, year);
}

export default listCommand;
