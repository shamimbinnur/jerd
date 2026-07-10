import test from 'ava';
import type {JournalMood} from '../source/utils/journal-frontmatter.js';
import {
	getFrequencyBarWidth,
	getMoodFrequencies,
} from '../source/screens/mood-tracker.js';

test('getMoodFrequencies counts moods and retains zero-count moods', t => {
	const frequencies = getMoodFrequencies(
		new Map<number, JournalMood>([
			[1, 'happy'],
			[2, 'calm'],
			[3, 'happy'],
		]),
	);

	t.is(frequencies.get('calm'), 1);
	t.is(frequencies.get('happy'), 2);
	t.is(frequencies.get('sad'), 0);
	t.is(frequencies.get('anxious'), 0);
	t.is(frequencies.get('angry'), 0);
});

test('getFrequencyBarWidth scales counts and handles an empty month', t => {
	t.is(getFrequencyBarWidth(4, 4), 24);
	t.is(getFrequencyBarWidth(2, 4), 12);
	t.is(getFrequencyBarWidth(0, 4), 0);
	t.is(getFrequencyBarWidth(0, 0), 0);
});
