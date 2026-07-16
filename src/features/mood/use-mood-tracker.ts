import React from 'react';
import type {JournalMood} from '../../core/journal/frontmatter.js';
import {getJournalMoodMapForMonth} from '../../core/journal/store.js';
import {
	completeMoodMonthQuery,
	type MoodMonthQueryResult,
	parseMoodMonthQuery,
} from './month-query.js';

const firstDayOfMonth = (date: Date) =>
	new Date(date.getFullYear(), date.getMonth(), 1);

export type MoodTrackerView = 'heatgraph' | 'frequency' | 'trend';

const moodTrackerViews: readonly MoodTrackerView[] = [
	'heatgraph',
	'frequency',
	'trend',
];

export const moveMoodTrackerView = (
	view: MoodTrackerView,
	offset: number,
): MoodTrackerView => {
	const currentIndex = moodTrackerViews.indexOf(view);
	const nextIndex =
		(currentIndex + offset + moodTrackerViews.length) % moodTrackerViews.length;
	return moodTrackerViews[nextIndex] ?? 'heatgraph';
};

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
	const [view, setView] = React.useState<MoodTrackerView>('heatgraph');

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
		setView('heatgraph');
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

	const moveView = React.useCallback((offset: number) => {
		setView(currentView => moveMoodTrackerView(currentView, offset));
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
			moveView,
			reset,
			submitMonthQuery,
			updateMonthQuery: setMonthQuery,
			view,
		}),
		[
			clearMonthQuery,
			completeMonthQuery,
			month,
			monthQuery,
			moodsByDay,
			moveMonth,
			moveView,
			reset,
			submitMonthQuery,
			view,
		],
	);
};
