import test from 'ava';
import {
	parseJournalMood,
	upsertJournalFrontmatter,
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

test('upsertJournalFrontmatter adds jamstack metadata', t => {
	t.is(
		upsertJournalFrontmatter('Today I wrote first.', {
			mood: 'calm',
			slug: '07-june-2026',
			tags: [],
		}),
		'---\nmood: calm\nslug: "07-june-2026"\ntags: []\n---\n\nToday I wrote first.',
	);
});

test('upsertJournalFrontmatter preserves custom slug and tags', t => {
	t.is(
		upsertJournalFrontmatter(
			'---\nmood: sad\nslug: "custom-entry"\ntags: [work, planning]\n---\n\nExisting entry',
			{
				mood: 'happy',
				slug: '07-june-2026',
				tags: [],
			},
		),
		'---\nmood: happy\nslug: "custom-entry"\ntags: [work, planning]\n---\n\nExisting entry',
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
