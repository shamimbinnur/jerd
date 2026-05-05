import { join } from 'path';
import dayjs from 'dayjs';
import { getJerdPath, fileExists } from './file-system.js';
import { extractMoodFromFile } from './frontmatter.js';
import { getMoodValue } from '../constants.js';

/**
 * Collects mood data for a date range
 * @param {dayjs.Dayjs} startDate - Start of range (inclusive)
 * @param {dayjs.Dayjs} endDate - End of range (inclusive)
 * @returns {Promise<Array<{date: string, dayLabel: string, mood: string|null, value: number|null, exists: boolean}>>}
 */
export async function collectMoodData(startDate, endDate) {
  const jerdPath = getJerdPath();
  const results = [];

  let currentDate = startDate;
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    const year = currentDate.format('YYYY');
    const month = currentDate.format('YYYY-MM');
    const filename = `${currentDate.format('YYYY-MM-DD')}.md`;
    const filePath = join(jerdPath, year, month, filename);

    const entry = {
      date: currentDate.format('YYYY-MM-DD'),
      dayLabel: currentDate.format('ddd'),
      mood: null,
      value: null,
      exists: false
    };

    if (await fileExists(filePath)) {
      entry.exists = true;
      entry.mood = await extractMoodFromFile(filePath);
      entry.value = getMoodValue(entry.mood);
    }

    results.push(entry);
    currentDate = currentDate.add(1, 'day');
  }

  return results;
}

/**
 * Gets mood data for last N days
 * @param {number} days - Number of days to fetch
 * @returns {Promise<Array>}
 */
export async function getMoodDataForPeriod(days) {
  const endDate = dayjs();
  const startDate = endDate.subtract(days - 1, 'day');
  return collectMoodData(startDate, endDate);
}

/**
 * Gets mood data for a specific month
 * @param {string} monthNumber - Month number (01-12)
 * @param {string} year - Year (YYYY)
 * @returns {Promise<Array>}
 */
export async function getMoodDataForMonth(monthNumber, year) {
  const startDate = dayjs(`${year}-${monthNumber}-01`);
  const endDate = startDate.endOf('month');
  return collectMoodData(startDate, endDate);
}
