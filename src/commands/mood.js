import dayjs from 'dayjs';
import { getJerdPath, fileExists } from '../utils/file-system.js';
import { getMoodDataForPeriod, getMoodDataForMonth } from '../utils/mood-data.js';
import { renderWeeklyChart, renderMonthlyChart } from '../utils/mood-chart.js';
import { errorMessage, gentleHint } from '../utils/ui.js';

// Month name to number mapping
const MONTH_NAMES = {
  'january': '01', 'february': '02', 'march': '03', 'april': '04',
  'may': '05', 'june': '06', 'july': '07', 'august': '08',
  'september': '09', 'october': '10', 'november': '11', 'december': '12',
  'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
  'jun': '06', 'jul': '07', 'aug': '08',
  'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12',
  'sept': '09'
};

function getMonthNumber(monthStr) {
  return MONTH_NAMES[monthStr?.toLowerCase()?.trim()] || null;
}

async function moodCommand(args = [], options = {}) {
  const jerdPath = getJerdPath();

  // Check if jerd directory exists
  if (!(await fileExists(jerdPath))) {
    errorMessage('Jerd not initialized. Run "jerd init" first.');
    process.exit(1);
  }

  // Determine period based on options and arguments
  if (options.week || (!options.month && !options.year && args.length === 0)) {
    // Default: last 7 days
    const moodData = await getMoodDataForPeriod(7);
    renderWeeklyChart(moodData, 'Mood Graph - Last 7 Days');
    return;
  }

  if (options.month) {
    // Last 30 days
    const moodData = await getMoodDataForPeriod(30);
    renderMonthlyChart(moodData, 'Mood Graph - Last 30 Days');
    return;
  }

  if (options.year) {
    // Last 365 days
    const moodData = await getMoodDataForPeriod(365);
    renderMonthlyChart(moodData, 'Mood Graph - Last Year');
    return;
  }

  // Parse month/year arguments
  const firstArg = args[0];
  const secondArg = args[1];

  const monthNumber = getMonthNumber(firstArg);
  if (!monthNumber) {
    errorMessage(`Invalid month: ${firstArg}`);
    gentleHint('Try month names like "january", "jan", or use --week, --month, --year flags');
    process.exit(1);
  }

  const year = secondArg || dayjs().format('YYYY');
  const monthName = dayjs(`${year}-${monthNumber}-01`).format('MMMM');

  const moodData = await getMoodDataForMonth(monthNumber, year);
  renderMonthlyChart(moodData, `Mood Graph - ${monthName} ${year}`);
}

export default moodCommand;
