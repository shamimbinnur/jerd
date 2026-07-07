import {monthNames} from './journal-paths.js';

const monthNameList: readonly string[] = monthNames;
export const shortMoodMonthNames = monthNames.map(monthName =>
	monthName.slice(0, 3),
);

type CompletionOptions = {
	readonly defaultMonth: number;
	readonly defaultYear: number;
};

export type MoodMonthQueryResult = {
	readonly month: number;
	readonly year: number;
};

const findMonthByName = (monthName: string) => {
	const normalizedMonthName = monthName.toLowerCase();
	const shortMonthIndex = shortMoodMonthNames.indexOf(normalizedMonthName);
	if (shortMonthIndex !== -1) {
		return shortMonthIndex + 1;
	}

	const monthIndex = monthNameList.indexOf(normalizedMonthName);

	return monthIndex === -1 ? undefined : monthIndex + 1;
};

const findMonthCompletion = (
	monthPrefix: string,
	defaultMonth: number,
): string | undefined => {
	const normalizedPrefix = monthPrefix.toLowerCase();
	const matches = shortMoodMonthNames.filter(monthName =>
		monthName.startsWith(normalizedPrefix),
	);
	if (matches.length === 0) {
		return undefined;
	}

	const defaultMonthName = shortMoodMonthNames[defaultMonth - 1];
	return (
		matches.find(monthName => monthName === defaultMonthName) ?? matches[0]
	);
};

export const getShortMoodMonthLabel = (month: number) => {
	const shortMonthName =
		shortMoodMonthNames[month - 1] ?? shortMoodMonthNames[0];
	return shortMonthName
		? `${shortMonthName[0]?.toUpperCase() ?? ''}${shortMonthName.slice(1)}`
		: 'Jan';
};

export const completeMoodMonthQuery = (
	query: string,
	{defaultMonth, defaultYear}: CompletionOptions,
) => {
	const normalizedQuery = query.trimStart().toLowerCase();
	const monthMatch = /^([a-z]*)\s*(.*)$/v.exec(normalizedQuery);
	const monthPrefix = monthMatch?.[1] ?? '';
	const yearPrefix = monthMatch?.[2]?.trim() ?? '';
	const completedMonth = findMonthCompletion(monthPrefix, defaultMonth);

	if (!completedMonth) {
		return normalizedQuery;
	}

	if (!normalizedQuery.includes(' ')) {
		return `${completedMonth} `;
	}

	if (yearPrefix.length === 0) {
		return `${completedMonth} ${String(defaultYear)}`;
	}

	if (/^\d{4}$/v.test(yearPrefix)) {
		return `${completedMonth} ${yearPrefix}`;
	}

	const defaultYearText = String(defaultYear);
	if (/^\d{1,3}$/v.test(yearPrefix) && defaultYearText.startsWith(yearPrefix)) {
		return `${completedMonth} ${defaultYearText}`;
	}

	return normalizedQuery;
};

export const getMoodMonthQuerySuggestion = (
	query: string,
	options: CompletionOptions,
) => {
	if (query.length === 0) {
		return '';
	}

	const normalizedQuery = query.toLowerCase();
	const completedQuery = completeMoodMonthQuery(query, options);
	return completedQuery.startsWith(normalizedQuery) &&
		completedQuery !== normalizedQuery
		? completedQuery.slice(normalizedQuery.length)
		: '';
};

export const parseMoodMonthQuery = (
	query: string,
): MoodMonthQueryResult | undefined => {
	const match = /^([a-z]+)\s+(\d{4})$/iv.exec(query.trim());
	const monthName = match?.[1];
	const yearText = match?.[2];
	if (!monthName || !yearText) {
		return undefined;
	}

	const month = findMonthByName(monthName);
	const year = Number(yearText);
	if (!month || !Number.isInteger(year) || year < 1000 || year > 9999) {
		return undefined;
	}

	return {month, year};
};
