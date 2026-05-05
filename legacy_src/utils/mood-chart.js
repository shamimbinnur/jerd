import chalk from 'chalk';
import { MOOD_VALUES, getMoodEmoji, getMoodColor } from '../constants.js';
import { softHeader, dimText, gentleHint } from './ui.js';

/**
 * Renders a vertical bar chart for mood data (best for weekly view)
 * @param {Array} moodData - Array of mood entries
 * @param {string} title - Chart title
 */
export function renderWeeklyChart(moodData, title = 'Mood Graph - Last 7 Days') {
  softHeader(`📊 ${title}`);

  const maxValue = 5;

  // Build the chart row by row from top (5) to bottom (1)
  for (let level = maxValue; level >= 1; level--) {
    let row = chalk.hex('#6b7280')(`${level} │ `);

    for (const entry of moodData) {
      if (entry.value && entry.value >= level) {
        const color = getMoodColor(entry.mood);
        row += chalk.hex(color)('██') + ' ';
      } else {
        row += '   ';
      }
    }
    console.log(row);
  }

  // X-axis
  let xAxis = chalk.hex('#6b7280')('  └─');
  for (let i = 0; i < moodData.length; i++) {
    xAxis += chalk.hex('#6b7280')('───');
  }
  console.log(xAxis);

  // Day labels
  let labels = '    ';
  for (const entry of moodData) {
    labels += chalk.hex('#8b5cf6')(entry.dayLabel.slice(0, 2).padEnd(3));
  }
  console.log(labels);

  // Statistics
  renderStats(moodData);
}

/**
 * Renders a horizontal bar chart (better for month/year views)
 * @param {Array} moodData - Array of mood entries
 * @param {string} title - Chart title
 */
export function renderMonthlyChart(moodData, title) {
  softHeader(`📊 ${title}`);

  const entriesWithMood = moodData.filter(e => e.value !== null);

  if (entriesWithMood.length === 0) {
    console.log(dimText('No mood data found for this period.'));
    gentleHint('Add mood to entries using "jerd new" with astro UI style');
    return;
  }

  // Count mood occurrences
  const moodCounts = {};
  for (const entry of entriesWithMood) {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  }

  const maxCount = Math.max(...Object.values(moodCounts));
  const barMaxWidth = 25;

  // Sort by mood value (highest first)
  const sortedMoods = Object.entries(moodCounts).sort((a, b) =>
    MOOD_VALUES[b[0]].value - MOOD_VALUES[a[0]].value
  );

  for (const [mood, count] of sortedMoods) {
    const emoji = getMoodEmoji(mood);
    const color = getMoodColor(mood);
    const barWidth = Math.round((count / maxCount) * barMaxWidth);
    const bar = chalk.hex(color)('█'.repeat(barWidth));
    const label = mood.padEnd(6);
    console.log(`${emoji} ${chalk.hex(color)(label)} ${bar} ${count}`);
  }

  // Statistics
  renderStats(moodData);
}

/**
 * Renders statistics for mood data
 * @param {Array} moodData - Array of mood entries
 */
function renderStats(moodData) {
  const entriesWithMood = moodData.filter(e => e.value !== null);
  const entriesWithoutMood = moodData.filter(e => e.exists && e.value === null);
  const missingEntries = moodData.filter(e => !e.exists);

  console.log('');

  if (entriesWithMood.length > 0) {
    const avgMood = entriesWithMood.reduce((sum, e) => sum + e.value, 0) / entriesWithMood.length;
    console.log(dimText(`Average mood: ${avgMood.toFixed(1)}/5`));
  }

  if (entriesWithoutMood.length > 0) {
    console.log(dimText(`${entriesWithoutMood.length} entries had no mood data`));
  }

  if (missingEntries.length > 0) {
    console.log(dimText(`${missingEntries.length} days without journal entries`));
  }
}
