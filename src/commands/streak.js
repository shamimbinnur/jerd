import dayjs from 'dayjs';
import { getJerdPath, fileExists } from '../utils/file-system.js';
import { renderStreakChart, collectActivityData } from '../utils/streak-chart.js';
import { notInitializedBanner } from '../utils/ui.js';

async function streakCommand(options = {}) {
  const jerdPath = getJerdPath();

  // Check if jerd directory exists
  if (!(await fileExists(jerdPath))) {
    notInitializedBanner();
    process.exit(1);
  }

  // Determine date range based on options
  let days = 90; // Default: ~3 months (similar to GitHub's default view)
  let title = 'Journal Activity - Last 3 Months';

  if (options.week) {
    days = 7;
    title = 'Journal Activity - Last 7 Days';
  } else if (options.month) {
    days = 30;
    title = 'Journal Activity - Last 30 Days';
  } else if (options.year) {
    days = 365;
    title = 'Journal Activity - Last Year';
  }

  const endDate = dayjs();
  const startDate = endDate.subtract(days - 1, 'day');

  // Collect activity data
  const activityData = await collectActivityData(startDate, endDate, jerdPath, fileExists);

  // Render the chart
  renderStreakChart(activityData, title);
}

export default streakCommand;
