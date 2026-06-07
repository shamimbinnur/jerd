import React from 'react';
import type {JournalMood} from '../utils/journal-frontmatter.js';
import {getJournalMoodMapForMonth} from '../utils/journal-store.js';

const firstDayOfMonth = (date: Date) =>
	new Date(date.getFullYear(), date.getMonth(), 1);

export const useMoodTracker = ({
	active,
	configDirectory,
	journalEntryCount,
	now,
}: {
	readonly active: boolean;
	readonly configDirectory: string;
	readonly journalEntryCount: number;
	readonly now?: Date;
}) => {
	const [month, setMonth] = React.useState(() =>
		firstDayOfMonth(now ?? new Date()),
	);
	const [moodsByDay, setMoodsByDay] = React.useState<Map<number, JournalMood>>(
		new Map<number, JournalMood>(),
	);

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

	return React.useMemo(
		() => ({
			month,
			moodsByDay,
			moveMonth,
			reset,
		}),
		[month, moodsByDay, moveMonth, reset],
	);
};
