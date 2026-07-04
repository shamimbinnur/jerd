import type {Key} from 'ink';
import {moodOptions} from '../components/mood-check-in/mood-options.js';
import type {JournalMood} from '../utils/journal-frontmatter.js';
import type {Screen} from './types.js';

type StateSetter<T> = (value: T | ((current: T) => T)) => void;

type Navigation = {
	readonly setActiveScreen: StateSetter<Screen>;
};

type CalendarInput = Navigation & {
	readonly moveSelection: (offset: number) => void;
	readonly openSelectedEntry: () => void;
};

type FindInput = Navigation & {
	readonly moveSelection: (offset: number) => void;
};

type HomeInput = Navigation & {
	readonly openCalendar: () => void;
	readonly openFind: () => void;
	readonly openMoodTracker: () => void;
	readonly resetMoodCheckIn: () => void;
};

type MoodCheckInInput = Navigation & {
	readonly input: string;
	readonly key: Key;
	readonly selectedIndex: number;
	readonly setSelectedIndex: StateSetter<number>;
	readonly writeWithMood: (mood: JournalMood) => void;
};

type MoodTrackerInput = Navigation & {
	readonly key: Key;
	readonly moveMonth: (offset: number) => void;
};

const isSubmitInput = (input: string, isReturnKey: boolean) =>
	isReturnKey || input === '\r' || input === '\n';

export const handleMoodCheckInInput = ({
	input,
	key,
	selectedIndex,
	setActiveScreen,
	setSelectedIndex,
	writeWithMood,
}: MoodCheckInInput) => {
	const keyedMood = moodOptions.find(
		option => option.symbol.toLowerCase() === input,
	)?.mood;
	if (keyedMood) {
		writeWithMood(keyedMood);
		return;
	}

	if (key.escape) {
		setActiveScreen('home');
		return;
	}

	if (key.upArrow || key.leftArrow) {
		setSelectedIndex(currentIndex => Math.max(currentIndex - 1, 0));
		return;
	}

	if (key.downArrow || key.rightArrow) {
		setSelectedIndex(currentIndex =>
			Math.min(currentIndex + 1, moodOptions.length - 1),
		);
		return;
	}

	if (isSubmitInput(input, key.return)) {
		const selectedMood = moodOptions[selectedIndex]?.mood ?? 'neutral';
		writeWithMood(selectedMood);
	}
};

export const handleMoodTrackerInput = ({
	key,
	moveMonth,
	setActiveScreen,
}: MoodTrackerInput) => {
	if (key.escape) {
		setActiveScreen('home');
		return;
	}

	if (key.leftArrow) {
		moveMonth(-1);
		return;
	}

	if (key.rightArrow) {
		moveMonth(1);
	}
};

export const handleFindInput = ({
	key,
	moveSelection,
	setActiveScreen,
}: FindInput & {readonly key: Key}) => {
	if (key.escape) {
		setActiveScreen('home');
		return;
	}

	if (key.upArrow) {
		moveSelection(-1);
		return;
	}

	if (key.downArrow) {
		moveSelection(1);
	}
};

export const handleCalendarInput = ({
	key,
	moveSelection,
	openSelectedEntry,
	setActiveScreen,
}: CalendarInput & {readonly key: Key}) => {
	if (key.escape) {
		setActiveScreen('home');
		return;
	}

	if (key.leftArrow) {
		moveSelection(-1);
		return;
	}

	if (key.rightArrow) {
		moveSelection(1);
		return;
	}

	if (key.upArrow) {
		moveSelection(-7);
		return;
	}

	if (key.downArrow) {
		moveSelection(7);
		return;
	}

	if (key.return) {
		openSelectedEntry();
	}
};

export const handleHomeInput = ({
	input,
	openCalendar,
	openFind,
	openMoodTracker,
	resetMoodCheckIn,
	setActiveScreen,
}: HomeInput & {readonly input: string}) => {
	if (input === 'f') {
		openFind();
		setActiveScreen('find');
		return;
	}

	if (input === 'c') {
		openCalendar();
		setActiveScreen('calendar');
		return;
	}

	if (input === 'w') {
		resetMoodCheckIn();
		setActiveScreen('mood-check-in');
		return;
	}

	if (input === 'm') {
		openMoodTracker();
		setActiveScreen('mood-tracker');
	}
};
