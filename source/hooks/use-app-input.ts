import {useInput} from 'ink';
import React from 'react';
import {
	handleCalendarInput,
	handleFindInput,
	handleHomeInput,
	handleMoodCheckInInput,
	handleMoodTrackerInput,
	resolveHomeQuitInput,
} from '../app/input-handlers.js';
import type {Screen} from '../app/types.js';
import type {JournalMood} from '../utils/journal-frontmatter.js';
import type {useCalendarEntries} from './use-calendar-entries.js';
import type {useFindEntries} from './use-find-entries.js';
import type {useMoodTracker} from './use-mood-tracker.js';

type CalendarEntries = ReturnType<typeof useCalendarEntries>;
type FindEntries = ReturnType<typeof useFindEntries>;
type MoodTracker = ReturnType<typeof useMoodTracker>;

type UseAppInputOptions = {
	readonly activeScreen: Screen;
	readonly calendar: CalendarEntries;
	readonly clearInvalidMoodInput: () => void;
	readonly find: FindEntries;
	readonly isMoodSelectInputActive: boolean;
	readonly moodCheckInSelectedIndex: number;
	readonly moodTracker: MoodTracker;
	readonly onExit: () => void;
	readonly openSelectedCalendarEntry: () => void;
	readonly setActiveScreen: React.Dispatch<React.SetStateAction<Screen>>;
	readonly setMoodCheckInSelectedIndex: React.Dispatch<
		React.SetStateAction<number>
	>;
	readonly writeWithMood: (mood: JournalMood) => void;
};

export const useAppInput = ({
	activeScreen,
	calendar,
	clearInvalidMoodInput,
	find,
	isMoodSelectInputActive,
	moodCheckInSelectedIndex,
	moodTracker,
	onExit,
	openSelectedCalendarEntry,
	setActiveScreen,
	setMoodCheckInSelectedIndex,
	writeWithMood,
}: UseAppInputOptions) => {
	const lastHomeQuitPressAt = React.useRef<number | undefined>(undefined);

	useInput((input, key) => {
		if (activeScreen === 'init' || activeScreen === 'project-init') {
			return;
		}

		const normalizedInput = input?.toLowerCase() ?? '';

		if (activeScreen === 'mood-check-in') {
			if (isMoodSelectInputActive) {
				if (key.escape) {
					clearInvalidMoodInput();
					setActiveScreen('home');
				}

				return;
			}

			handleMoodCheckInInput({
				input: normalizedInput,
				key,
				selectedIndex: moodCheckInSelectedIndex,
				setActiveScreen,
				setSelectedIndex: setMoodCheckInSelectedIndex,
				writeWithMood,
			});
			return;
		}

		if (activeScreen === 'mood-tracker') {
			handleMoodTrackerInput({
				completeMonthQuery: moodTracker.completeMonthQuery,
				input: normalizedInput,
				key,
				moveMonth: moodTracker.moveMonth,
				monthQuery: moodTracker.monthQuery,
				setActiveScreen,
				setView: moodTracker.setView,
				submitMonthQuery: moodTracker.submitMonthQuery,
				updateMonthQuery: moodTracker.updateMonthQuery,
			});
			return;
		}

		if (activeScreen === 'find') {
			handleFindInput({
				key,
				moveSelection: find.moveSelection,
				setActiveScreen,
			});
			return;
		}

		if (activeScreen === 'calendar') {
			handleCalendarInput({
				key,
				moveSelection: calendar.moveSelection,
				openSelectedEntry: openSelectedCalendarEntry,
				setActiveScreen,
			});
			return;
		}

		if (activeScreen === 'home') {
			const quitInput = resolveHomeQuitInput({
				input: normalizedInput,
				lastQuitPressAt: lastHomeQuitPressAt.current,
				now: Date.now(),
			});
			lastHomeQuitPressAt.current = quitInput.nextQuitPressAt;
			if (quitInput.shouldQuit) {
				onExit();
				return;
			}

			handleHomeInput({
				input: normalizedInput,
				openCalendar: calendar.resetSelection,
				openFind: find.reset,
				openMoodTracker: moodTracker.reset,
				resetMoodCheckIn() {
					clearInvalidMoodInput();
					setMoodCheckInSelectedIndex(0);
				},
				setActiveScreen,
			});
		}
	});
};
