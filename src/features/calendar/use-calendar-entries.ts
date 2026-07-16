import React from 'react';
import {getJournalEntryPathMapForMonth} from '../../core/journal/store.js';

const getDaysInMonth = (date: Date) =>
	new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

export const useCalendarEntries = ({
	configDirectory,
	journalEntryCount,
	now,
}: {
	readonly configDirectory: string;
	readonly journalEntryCount: number;
	readonly now?: Date;
}) => {
	const activeNow = now ?? new Date();
	const [entryDays, setEntryDays] = React.useState<Set<number>>(
		new Set<number>(),
	);
	const [entryPaths, setEntryPaths] = React.useState<Map<number, string>>(
		new Map<number, string>(),
	);
	const [isOpening, setIsOpening] = React.useState(false);
	const [selectedDay, setSelectedDay] = React.useState(activeNow.getDate());
	const [status, setStatus] = React.useState<string>();

	React.useEffect(() => {
		let isMounted = true;
		const current = now ?? new Date();

		void getJournalEntryPathMapForMonth({
			month: current.getMonth() + 1,
			rootDirectory: configDirectory,
			year: current.getFullYear(),
		})
			.then(paths => {
				if (isMounted) {
					setEntryPaths(paths);
					setEntryDays(new Set<number>(paths.keys()));
				}
			})
			.catch(() => {
				if (isMounted) {
					setEntryPaths(new Map<number, string>());
					setEntryDays(new Set<number>());
				}
			});

		return () => {
			isMounted = false;
		};
	}, [configDirectory, journalEntryCount, now]);

	const resetSelection = React.useCallback(() => {
		const current = now ?? new Date();
		const daysInMonth = getDaysInMonth(current);
		setSelectedDay(Math.min(Math.max(current.getDate(), 1), daysInMonth));
		setStatus(undefined);
	}, [now]);

	const moveSelection = React.useCallback(
		(offset: number) => {
			const current = now ?? new Date();
			const daysInMonth = getDaysInMonth(current);
			setSelectedDay(day => Math.min(Math.max(day + offset, 1), daysInMonth));
			setStatus(undefined);
		},
		[now],
	);

	return React.useMemo(
		() => ({
			entryDays,
			entryPaths,
			isOpening,
			moveSelection,
			resetSelection,
			selectedDay,
			setIsOpening,
			setStatus,
			status,
		}),
		[
			entryDays,
			entryPaths,
			isOpening,
			moveSelection,
			resetSelection,
			selectedDay,
			status,
		],
	);
};
