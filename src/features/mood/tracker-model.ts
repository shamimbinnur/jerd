import type {JournalMood} from '../../core/journal/frontmatter.js';
import {moodOptions} from './options.js';

export const frequencyBarWidth = 24;

export const trendMoods: ReadonlyArray<{
	readonly label: string;
	readonly mood: JournalMood;
}> = [
	{label: 'Happy', mood: 'happy'},
	{label: 'Calm', mood: 'calm'},
	{label: 'Anxious', mood: 'anxious'},
	{label: 'Sad', mood: 'sad'},
	{label: 'Angry', mood: 'angry'},
];

const moodTrendLevels = new Map<JournalMood, number>(
	trendMoods.map((option, index) => [option.mood, index]),
);

export const getMoodTrendLevel = (mood: JournalMood) =>
	moodTrendLevels.get(mood) ?? 0;

export const buildMoodTrendRows = (
	moodsByDay: ReadonlyMap<number, JournalMood>,
	daysInMonth: number,
) => {
	const rows = Array.from({length: trendMoods.length}, () =>
		Array.from({length: daysInMonth}, () => ' '),
	);

	for (let day = 1; day <= daysInMonth; day += 1) {
		const mood = moodsByDay.get(day);
		if (!mood) {
			continue;
		}

		const level = getMoodTrendLevel(mood);
		const column = day - 1;
		const row = rows[level];
		if (row) {
			row[column] = '●';
		}

		const previousMood = moodsByDay.get(day - 1);
		if (!previousMood) {
			continue;
		}

		const previousLevel = getMoodTrendLevel(previousMood);
		if (previousLevel === level) {
			continue;
		}

		const previousRow = rows[previousLevel];
		if (previousRow) {
			previousRow[column - 1] = previousLevel < level ? '╲' : '╱';
		}

		for (
			let connectorLevel = Math.min(previousLevel, level) + 1;
			connectorLevel < Math.max(previousLevel, level);
			connectorLevel += 1
		) {
			const connectorRow = rows[connectorLevel];
			if (connectorRow) {
				connectorRow[column] = '│';
			}
		}
	}

	return rows.map(row => row.join(''));
};

export const buildTrendDateLabels = (daysInMonth: number) => {
	const labels = Array.from({length: daysInMonth}, () => ' ');
	const labelDays = new Set([1, 10, 20, daysInMonth]);
	for (const day of labelDays) {
		const label = String(day).padStart(2, '0');
		const start = day === daysInMonth ? daysInMonth - 2 : day - 1;
		labels[start] = label[0] ?? ' ';
		labels[start + 1] = label[1] ?? ' ';
	}

	return labels.join('');
};

export const getMoodFrequencies = (
	moodsByDay: ReadonlyMap<number, JournalMood>,
) => {
	const counts = new Map<JournalMood, number>(
		moodOptions.map(option => [option.mood, 0]),
	);
	for (const mood of moodsByDay.values()) {
		counts.set(mood, (counts.get(mood) ?? 0) + 1);
	}

	return counts;
};

export const getFrequencyBarWidth = (count: number, maximum: number) =>
	count === 0 || maximum === 0
		? 0
		: Math.max(1, Math.round((count / maximum) * frequencyBarWidth));
