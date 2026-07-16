import {useInput} from 'ink';
import React from 'react';
import type {JournalMood} from '../core/journal/frontmatter.js';
import {handleCalendarInput} from '../features/calendar/input.js';
import type {useCalendarEntries} from '../features/calendar/use-calendar-entries.js';
import {handleFindInput} from '../features/find/input.js';
import type {useFindEntries} from '../features/find/use-find-entries.js';
import {handleHomeInput, resolveHomeQuitInput} from '../features/home/input.js';
import {
	handleMoodCheckInInput,
	handleMoodTrackerInput,
} from '../features/mood/input.js';
import type {useMoodTracker} from '../features/mood/use-mood-tracker.js';
import type {Screen} from './types.js';

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
				moveView: moodTracker.moveView,
				monthQuery: moodTracker.monthQuery,
				setActiveScreen,
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
