import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);

// Month name lookup map (supports full and abbreviated names)
const MONTH_NAMES = {
  'january': 0, 'february': 1, 'march': 2, 'april': 3,
  'may': 4, 'june': 5, 'july': 6, 'august': 7,
  'september': 8, 'october': 9, 'november': 10, 'december': 11,
  'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3,
  'may': 4, 'jun': 5, 'jul': 6, 'aug': 7,
  'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
  'sept': 8 // Common alternative
};

// Weekday name lookup map
const WEEKDAY_NAMES = {
  'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
  'thursday': 4, 'friday': 5, 'saturday': 6,
  'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3,
  'thu': 4, 'fri': 5, 'sat': 6
};

/**
 * Preprocesses input string: normalize whitespace, lowercase, strip ordinal suffixes
 */
function preprocessInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Normalize whitespace and convert to lowercase
  let normalized = input.trim().toLowerCase();

  // Remove ordinal suffixes (st, nd, rd, th)
  normalized = normalized.replace(/(\d+)(st|nd|rd|th)\b/gi, '$1');

  // Normalize multiple spaces to single space
  normalized = normalized.replace(/\s+/g, ' ');

  return normalized;
}

/**
 * Parses month name (full or abbreviated) to month index (0-11)
 */
function parseMonthName(monthStr) {
  const normalized = monthStr.toLowerCase().trim();
  const monthIndex = MONTH_NAMES[normalized];
  return monthIndex !== undefined ? monthIndex : null;
}

/**
 * Infers 4-digit year from 2-digit year using 80/20 sliding window
 */
function inferYear(yearStr) {
  const yearNum = parseInt(yearStr, 10);

  if (isNaN(yearNum)) {
    return null;
  }

  // If already 4-digit, return as-is
  if (yearNum >= 1000) {
    return yearNum;
  }

  // 2-digit year: use 80/20 rule
  if (yearNum >= 0 && yearNum <= 99) {
    const currentYear = dayjs().year();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const currentYearInCentury = currentYear % 100;

    // If within 20 years forward, use current century
    if (yearNum <= currentYearInCentury + 20) {
      return currentCentury + yearNum;
    } else {
      return currentCentury - 100 + yearNum;
    }
  }

  return null;
}

/**
 * Tries to parse input as keyword (today, yesterday, tomorrow, now)
 */
function tryParseKeyword(input) {
  if (input === 'today' || input === 'now') {
    return dayjs();
  }
  if (input === 'yesterday') {
    return dayjs().subtract(1, 'day');
  }
  if (input === 'tomorrow') {
    return dayjs().add(1, 'day');
  }
  return null;
}

/**
 * Tries to parse input as ISO date format (YYYY-MM-DD or YYYY/MM/DD)
 */
function tryParseISODate(input) {
  // Try YYYY-MM-DD
  let parsed = dayjs(input, 'YYYY-MM-DD', true);
  if (parsed.isValid()) {
    return parsed;
  }

  // Try YYYY/MM/DD
  parsed = dayjs(input, 'YYYY/MM/DD', true);
  if (parsed.isValid()) {
    return parsed;
  }

  return null;
}

/**
 * Tries to parse input as weekday name (always backwards, including today)
 */
function tryParseWeekday(input) {
  // Remove "last" prefix if present
  const cleanInput = input.replace(/^last\s+/, '');

  const targetDay = WEEKDAY_NAMES[cleanInput];

  if (targetDay === undefined) {
    return null;
  }

  const today = dayjs();
  const currentDay = today.day(); // 0-6, Sunday-Saturday

  // Calculate days to subtract to reach target weekday (always backwards)
  let daysBack = (currentDay - targetDay + 7) % 7;

  // If daysBack is 0, it means today is the target weekday
  return today.subtract(daysBack, 'day');
}

/**
 * Tries to parse input as day + month + year (e.g., "12 feb 24", "12 february 2024")
 */
function tryParseDayMonthYear(input) {
  const match = input.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{2,4})$/);
  if (!match) {
    return null;
  }

  const day = parseInt(match[1], 10);
  const monthIndex = parseMonthName(match[2]);
  const year = inferYear(match[3]);

  if (monthIndex === null || year === null) {
    return null;
  }

  // Construct date and validate
  const date = dayjs(`${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

  // Ensure the date hasn't overflowed (e.g., Feb 31 becoming Mar 3)
  if (date.isValid() && date.date() === day && date.month() === monthIndex && date.year() === year) {
    return date;
  }
  return null;
}

/**
 * Tries to parse input as day + month (e.g., "23 sept", "25 december", "12th feb")
 * Pattern: NUMBER MONTH → day is NUMBER, month is MONTH, year is current
 */
function tryParseDayMonth(input) {
  const match = input.match(/^(\d{1,2})\s+([a-z]+)$/);
  if (!match) {
    return null;
  }

  const day = parseInt(match[1], 10);
  const monthIndex = parseMonthName(match[2]);

  if (monthIndex === null) {
    return null;
  }

  // Bounds check for day
  if (day < 1 || day > 31) {
    return null;
  }

  const year = dayjs().year();

  // Construct date and validate
  const date = dayjs(`${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

  // Ensure the date hasn't overflowed (e.g., Feb 31 becoming Mar 3)
  if (date.isValid() && date.date() === day && date.month() === monthIndex && date.year() === year) {
    return date;
  }
  return null;
}

/**
 * Tries to parse input as month + year (e.g., "feb 24", "december 2025")
 */
function tryParseMonthYear(input) {
  const match = input.match(/^([a-z]+)\s+(\d{2,4})$/);
  if (!match) {
    return null;
  }

  const monthIndex = parseMonthName(match[1]);
  const year = inferYear(match[2]);

  if (monthIndex === null || year === null) {
    return null;
  }

  // Set day to 1st
  const date = dayjs(`${year}-${String(monthIndex + 1).padStart(2, '0')}-01`);
  return date.isValid() ? date : null;
}

/**
 * Tries to parse input as month + day or just month (e.g., "sept 23", "january 23rd", "feb")
 * Pattern: MONTH NUMBER → month is MONTH, day is NUMBER, year is current
 * Pattern: MONTH → month is MONTH, day defaults to 1, year is current
 */
function tryParseMonthDay(input) {
  // Match: month name optionally followed by day number
  const match = input.match(/^([a-z]+)(?:\s+(\d{1,2}))?$/);
  if (!match) {
    return null;
  }

  const monthIndex = parseMonthName(match[1]);
  if (monthIndex === null) {
    return null;
  }

  const year = dayjs().year();
  const day = match[2] ? parseInt(match[2], 10) : 1;

  // Bounds check for day
  if (day < 1 || day > 31) {
    return null;
  }

  // Construct date and validate
  const date = dayjs(`${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

  // Ensure the date hasn't overflowed (e.g., Feb 31 becoming Mar 3)
  if (date.isValid() && date.date() === day && date.month() === monthIndex && date.year() === year) {
    return date;
  }
  return null;
}

/**
 * Tries to parse input as day only (e.g., "25", "1")
 */
function tryParseDay(input) {
  const match = input.match(/^(\d{1,2})$/);
  if (!match) {
    return null;
  }

  const day = parseInt(match[1], 10);

  // Bounds check
  if (day < 1 || day > 31) {
    return null;
  }

  const year = dayjs().year();
  const month = dayjs().month();

  // Construct date and validate (handles invalid days for month)
  const date = dayjs(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

  // Ensure the date hasn't overflowed
  if (date.isValid() && date.date() === day && date.month() === month && date.year() === year) {
    return date;
  }
  return null;
}

/**
 * Parses a date argument into a dayjs object
 * Supports multiple natural language formats
 */
export function parseDate(dateArg) {
  // Type check: only accept strings, null, or undefined
  if (dateArg !== null && dateArg !== undefined && typeof dateArg !== 'string') {
    return null;
  }

  // If no argument, use today
  if (!dateArg) {
    return dayjs();
  }

  // Preprocess input
  const input = preprocessInput(dateArg);

  // If preprocessing resulted in empty string, return null
  if (!input) {
    return null;
  }

  // Try patterns in priority order
  let result;

  // Keywords (today, yesterday, tomorrow, now)
  result = tryParseKeyword(input);
  if (result) return result;

  // ISO formats (YYYY-MM-DD, YYYY/MM/DD)
  result = tryParseISODate(input);
  if (result) return result;

  // Weekdays (monday, last monday)
  result = tryParseWeekday(input);
  if (result) return result;

  // Day + Month + Year (12 feb 24, 12th february 2024)
  result = tryParseDayMonthYear(input);
  if (result) return result;

  // Day + Month (12 feb, 25th december)
  result = tryParseDayMonth(input);
  if (result) return result;

  // Month + Day or Month only (jan 23, january 23th, feb)
  // Must run before Month + Year to prioritize day interpretation
  result = tryParseMonthDay(input);
  if (result) return result;

  // Month + Year (feb 24, december 2025)
  // Numbers > 31 will fall through from tryParseMonthDay
  result = tryParseMonthYear(input);
  if (result) return result;

  // Day only (25, 25th)
  result = tryParseDay(input);
  if (result) return result;

  // No match found
  return null;
}
