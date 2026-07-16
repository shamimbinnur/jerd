import test from 'ava';
import type {JournalMood} from '../../../src/core/journal/frontmatter.js';
import {
	buildMoodTrendRows,
	buildTrendDateLabels,
	getFrequencyBarWidth,
	getMoodFrequencies,
	getMoodTrendLevel,
} from '../../../src/features/mood/tracker-model.js';
import {moveMoodTrackerView} from '../../../src/features/mood/use-mood-tracker.js';

test('moveMoodTrackerView cycles and wraps in both directions', t => {
	t.is(moveMoodTrackerView('heatgraph', 1), 'frequency');
	t.is(moveMoodTrackerView('frequency', 1), 'trend');
	t.is(moveMoodTrackerView('trend', 1), 'heatgraph');
	t.is(moveMoodTrackerView('heatgraph', -1), 'trend');
	t.is(moveMoodTrackerView('trend', -1), 'frequency');
});

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

test('getMoodTrendLevel uses the agreed mood score order', t => {
	t.deepEqual(
		(['happy', 'calm', 'anxious', 'sad', 'angry'] as const).map(mood =>
			getMoodTrendLevel(mood),
		),
		[0, 1, 2, 3, 4],
	);
});

test('buildMoodTrendRows connects rising, falling, and multi-level changes', t => {
	const falling = buildMoodTrendRows(
		new Map<number, JournalMood>([
			[1, 'happy'],
			[2, 'angry'],
		]),
		2,
	);
	t.deepEqual(falling, ['╲ ', ' │', ' │', ' │', ' ●']);

	const rising = buildMoodTrendRows(
		new Map<number, JournalMood>([
			[1, 'sad'],
			[2, 'calm'],
		]),
		2,
	);
	t.deepEqual(rising, ['  ', ' ●', ' │', '╱ ', '  ']);
});

test('buildMoodTrendRows connects equal moods and breaks at missing days', t => {
	const rows = buildMoodTrendRows(
		new Map<number, JournalMood>([
			[1, 'happy'],
			[2, 'happy'],
			[4, 'calm'],
		]),
		4,
	);

	t.deepEqual(rows, ['●●  ', '   ●', '    ', '    ', '    ']);
});

test('buildTrendDateLabels stays within each supported month width', t => {
	for (const daysInMonth of [28, 29, 30, 31]) {
		const labels = buildTrendDateLabels(daysInMonth);
		t.is(labels.length, daysInMonth);
		t.true(labels.startsWith('01'));
		t.true(labels.endsWith(String(daysInMonth)));
	}
});
