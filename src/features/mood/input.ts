import type {Key} from 'ink';
import type {Screen} from '../../app/types.js';
import type {JournalMood} from '../../core/journal/frontmatter.js';
import {moodOptions} from './options.js';

type StateSetter<T> = (value: T | ((current: T) => T)) => void;

const isSubmitInput = (input: string, isReturnKey: boolean) =>
	isReturnKey || input === '\r' || input === '\n';

export const handleMoodCheckInInput = ({
	input,
	key,
	selectedIndex,
	setActiveScreen,
	setSelectedIndex,
	writeWithMood,
}: {
	readonly input: string;
	readonly key: Key;
	readonly selectedIndex: number;
	readonly setActiveScreen: StateSetter<Screen>;
	readonly setSelectedIndex: StateSetter<number>;
	readonly writeWithMood: (mood: JournalMood) => void;
}) => {
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
		const selectedMood = moodOptions[selectedIndex]?.mood ?? 'calm';
		writeWithMood(selectedMood);
	}
};

export const handleMoodTrackerInput = ({
	completeMonthQuery,
	input,
	key,
	moveMonth,
	moveView,
	monthQuery,
	setActiveScreen,
	submitMonthQuery,
	updateMonthQuery,
}: {
	readonly completeMonthQuery: () => void;
	readonly input: string;
	readonly key: Key;
	readonly moveMonth: (offset: number) => void;
	readonly moveView: (offset: number) => void;
	readonly monthQuery: string;
	readonly setActiveScreen: StateSetter<Screen>;
	readonly submitMonthQuery: () => void;
	readonly updateMonthQuery: StateSetter<string>;
}) => {
	if (key.escape) {
		setActiveScreen('home');
		return;
	}

	if (key.tab) {
		completeMonthQuery();
		return;
	}

	if (isSubmitInput(input, key.return)) {
		submitMonthQuery();
		return;
	}

	if (key.backspace || key.delete) {
		if (monthQuery.length === 0) {
			return;
		}

		updateMonthQuery(currentQuery => currentQuery.slice(0, -1));
		return;
	}

	if (key.leftArrow) {
		moveMonth(-1);
		return;
	}

	if (key.rightArrow) {
		moveMonth(1);
		return;
	}

	if (key.upArrow) {
		moveView(-1);
		return;
	}

	if (key.downArrow) {
		moveView(1);
		return;
	}

	if (key.ctrl || key.meta) {
		return;
	}

	if (input) {
		updateMonthQuery(currentQuery => `${currentQuery}${input}`);
	}
};
