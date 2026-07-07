import React from 'react';
import type {JournalMood} from '../utils/journal-frontmatter.js';
import {getJournalMoodMapForMonth} from '../utils/journal-store.js';
import {
	completeMoodMonthQuery,
	type MoodMonthQueryResult,
	parseMoodMonthQuery,
} from '../utils/mood-month-query.js';

const firstDayOfMonth = (date: Date) =>
	new Date(date.getFullYear(), date.getMonth(), 1);

const getInitialMonth = (
	initialMonth: MoodMonthQueryResult | undefined,
	now: Date | undefined,
) =>
	initialMonth
		? new Date(initialMonth.year, initialMonth.month - 1, 1)
		: firstDayOfMonth(now ?? new Date());

export const useMoodTracker = ({
	active,
	configDirectory,
	initialMonth,
	journalEntryCount,
	now,
}: {
	readonly active: boolean;
	readonly configDirectory: string;
	readonly initialMonth?: MoodMonthQueryResult;
	readonly journalEntryCount: number;
	readonly now?: Date;
}) => {
	const [month, setMonth] = React.useState(() =>
		getInitialMonth(initialMonth, now),
	);
	const [moodsByDay, setMoodsByDay] = React.useState<Map<number, JournalMood>>(
		new Map<number, JournalMood>(),
	);
	const [monthQuery, setMonthQuery] = React.useState('');

	React.useEffect(() => {
		if (!active) {
			return;
		}

		let isMounted = true;
		void getJournalMoodMapForMonth({
			month: month.getMonth() + 1,
			rootDirectory: configDirectory,
			year: month.getFullYear(),
		})
			.then(moods => {
				if (isMounted) {
					setMoodsByDay(moods);
				}
			})
			.catch(() => {
				if (isMounted) {
					setMoodsByDay(new Map<number, JournalMood>());
				}
			});

		return () => {
			isMounted = false;
		};
	}, [active, configDirectory, journalEntryCount, month]);

	const reset = React.useCallback(() => {
		setMonth(firstDayOfMonth(now ?? new Date()));
		setMoodsByDay(new Map<number, JournalMood>());
		setMonthQuery('');
	}, [now]);

	const moveMonth = React.useCallback((offset: number) => {
		setMonth(
			currentMonth =>
				new Date(
					currentMonth.getFullYear(),
					currentMonth.getMonth() + offset,
					1,
				),
		);
	}, []);

	const clearMonthQuery = React.useCallback(() => {
		setMonthQuery('');
	}, []);

	const completeMonthQuery = React.useCallback(() => {
		setMonthQuery(currentQuery =>
			completeMoodMonthQuery(currentQuery, {
				defaultMonth: month.getMonth() + 1,
				defaultYear: month.getFullYear(),
			}),
		);
	}, [month]);

	const submitMonthQuery = React.useCallback(() => {
		const result = parseMoodMonthQuery(monthQuery);
		if (!result) {
			return;
		}

		setMonth(new Date(result.year, result.month - 1, 1));
		setMoodsByDay(new Map<number, JournalMood>());
		setMonthQuery('');
	}, [monthQuery]);

	return React.useMemo(
		() => ({
			clearMonthQuery,
			completeMonthQuery,
			month,
			monthQuery,
			moodsByDay,
			moveMonth,
			reset,
			submitMonthQuery,
			updateMonthQuery: setMonthQuery,
		}),
		[
			clearMonthQuery,
			completeMonthQuery,
			month,
			monthQuery,
			moodsByDay,
			moveMonth,
			reset,
			submitMonthQuery,
		],
	);
};
