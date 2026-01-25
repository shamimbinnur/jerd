import chalk from 'chalk';
import dayjs from 'dayjs';
import { softHeader, dimText } from './ui.js';

// GitHub-style contribution colors (green shades)
const ACTIVITY_COLORS = {
  none: '#161b22',    // No activity - dark gray
  low: '#0e4429',     // 1 entry
  medium: '#006d32',  // Active
  high: '#26a641',    // Very active
  max: '#39d353',     // Most active
};

const DOT_CHAR = '●';
const EMPTY_CHAR = '○';

/**
 * Renders a GitHub-style activity graph
 * @param {Array} activityData - Array of {date, exists} objects
 * @param {string} title - Chart title
 */
export function renderStreakChart(activityData, title = 'Journal Activity') {
  softHeader(`📅 ${title}`);

  // Group data by week (columns) and day of week (rows)
  // GitHub style: rows are days (Sun-Sat), columns are weeks
  const weeks = [];
  let currentWeek = [];

  for (const entry of activityData) {
    const dayOfWeek = dayjs(entry.date).day(); // 0 = Sunday

    // Start new week on Sunday
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(entry);
  }

  // Push the last week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Pad first week with nulls at the beginning if it doesn't start on Sunday
  if (weeks.length > 0) {
    const firstWeekStartDay = dayjs(weeks[0][0].date).day();
    for (let i = 0; i < firstWeekStartDay; i++) {
      weeks[0].unshift(null);
    }
  }

  // Pad last week with nulls at the end if it doesn't end on Saturday
  if (weeks.length > 0) {
    const lastWeek = weeks[weeks.length - 1];
    while (lastWeek.length < 7) {
      lastWeek.push(null);
    }
  }

  // Day labels (using 3-char abbreviations for consistent width)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Render the graph (7 rows for days, columns for weeks)
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    let row = chalk.hex('#6b7280')(dayLabels[dayIndex]) + ' ';

    for (let weekIdx = 0; weekIdx < weeks.length; weekIdx++) {
      const week = weeks[weekIdx];
      const entry = week[dayIndex];

      if (entry === null || entry === undefined) {
        row += chalk.hex('#0d1117')(EMPTY_CHAR) + ' '; // Very dark dot for padding (nearly invisible)
      } else if (entry.exists) {
        row += chalk.hex(ACTIVITY_COLORS.max)(DOT_CHAR) + ' ';
      } else {
        row += chalk.hex(ACTIVITY_COLORS.none)(EMPTY_CHAR) + ' ';
      }
    }

    console.log(row);
  }

  // Month labels
  renderMonthLabels(activityData, weeks.length);

  // Statistics
  renderStreakStats(activityData);
}

/**
 * Renders month labels below the graph
 */
function renderMonthLabels(activityData, numWeeks) {
  if (activityData.length === 0) return;

  let monthRow = '    '; // Padding for day labels
  let lastMonth = '';
  let weekIndex = 0;

  for (const entry of activityData) {
    const month = dayjs(entry.date).format('MMM');
    const dayOfWeek = dayjs(entry.date).day();

    // Only process on Sundays (start of week)
    if (dayOfWeek === 0) {
      if (month !== lastMonth) {
        monthRow += chalk.hex('#8b5cf6')(month.slice(0, 3)) + ' ';
        lastMonth = month;
      } else {
        monthRow += '    ';
      }
      weekIndex++;
    }
  }

  console.log('');
  console.log(monthRow);
}

/**
 * Calculates and renders streak statistics
 */
function renderStreakStats(activityData) {
  const totalEntries = activityData.filter(e => e.exists).length;
  const totalDays = activityData.length;

  // Calculate current streak
  let currentStreak = 0;
  for (let i = activityData.length - 1; i >= 0; i--) {
    if (activityData[i].exists) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (const entry of activityData) {
    if (entry.exists) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Calculate percentage
  const percentage = totalDays > 0 ? ((totalEntries / totalDays) * 100).toFixed(0) : 0;

  console.log('');
  console.log(dimText('─'.repeat(40)));
  console.log('');

  // Stats in a row
  console.log(
    chalk.hex('#39d353')(`🔥 ${currentStreak}`) + dimText(' current') + '  ' +
    chalk.hex('#f59e0b')(`⭐ ${longestStreak}`) + dimText(' longest') + '  ' +
    chalk.hex('#3b82f6')(`📝 ${totalEntries}`) + dimText(` entries (${percentage}%)`)
  );

  // Legend
  console.log('');
  console.log(
    dimText('Less ') +
    chalk.hex(ACTIVITY_COLORS.none)(EMPTY_CHAR) + ' ' +
    chalk.hex(ACTIVITY_COLORS.max)(DOT_CHAR) +
    dimText(' More')
  );
}

/**
 * Collects activity data (whether entries exist) for a date range
 */
export async function collectActivityData(startDate, endDate, jerdPath, fileExists) {
  const { join } = await import('path');
  const results = [];

  let currentDate = startDate;
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    const year = currentDate.format('YYYY');
    const month = currentDate.format('YYYY-MM');
    const filename = `${currentDate.format('YYYY-MM-DD')}.md`;
    const filePath = join(jerdPath, year, month, filename);

    results.push({
      date: currentDate.format('YYYY-MM-DD'),
      exists: await fileExists(filePath)
    });

    currentDate = currentDate.add(1, 'day');
  }

  return results;
}
