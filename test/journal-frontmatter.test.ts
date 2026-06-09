import test from 'ava';
import {
	parseJournalMood,
	upsertMoodFrontmatter,
} from '../source/utils/journal-frontmatter.js';

test('upsertMoodFrontmatter adds mood before editor content opens', t => {
	t.is(
		upsertMoodFrontmatter('Today I wrote first.', 'calm'),
		'---\nmood: calm\n---\n\nToday I wrote first.',
	);
});

test('upsertMoodFrontmatter updates an existing mood', t => {
	t.is(
		upsertMoodFrontmatter('---\nmood: sad\n---\n\nExisting entry', 'happy'),
		'---\nmood: happy\n---\n\nExisting entry',
	);
});

test('parseJournalMood accepts valid moods case-insensitively', t => {
	t.is(parseJournalMood('calm'), 'calm');
	t.is(parseJournalMood('HAPPY'), 'happy');
});

test('parseJournalMood rejects misspelled moods', t => {
	t.is(parseJournalMood('clm'), undefined);
	t.is(parseJournalMood('hapy'), undefined);
});
