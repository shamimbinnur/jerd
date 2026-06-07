import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import test from 'ava';
import {
	countJournalEntries,
	getJournalEntryPathMapForMonth,
	getJournalMoodMapForMonth,
	loadJournalEntry,
	saveJournalEntry,
} from '../source/utils/journal-store.js';
import {getJournalLocation} from '../source/utils/journal-paths.js';
import {withTemporaryDirectory} from './helpers.js';

const june7 = new Date('2026-06-07T12:34:56');

test('builds the current journal path format', async t => {
	await withTemporaryDirectory(t, async directory => {
		const location = getJournalLocation(directory, june7);

		t.is(location.fileName, '2026_june_07.md');
		t.is(location.relativePath, join('2026', 'june', '2026_june_07.md'));
	});
});

test('saves and loads today entry with mood frontmatter', async t => {
	await withTemporaryDirectory(t, async directory => {
		const relativePath = await saveJournalEntry({
			content: 'A readable entry',
			mode: 'replace',
			mood: 'happy',
			now: june7,
			rootDirectory: directory,
		});
		const content = await loadJournalEntry({
			now: june7,
			rootDirectory: directory,
		});

		t.is(relativePath, join('2026', 'june', '2026_june_07.md'));
		t.is(content, '---\nmood: happy\n---\n\nA readable entry\n');
	});
});

test('append mode keeps previous content and adds a timestamped section', async t => {
	await withTemporaryDirectory(t, async directory => {
		await saveJournalEntry({
			content: 'First',
			now: june7,
			rootDirectory: directory,
		});
		await saveJournalEntry({
			content: 'Second',
			now: june7,
			rootDirectory: directory,
		});

		const content = await loadJournalEntry({
			now: june7,
			rootDirectory: directory,
		});
		t.true(content.includes('First'));
		t.true(content.includes('## 2026-06-07 12:34:56'));
		t.true(content.includes('Second'));
	});
});

test('monthly maps include only current-format journal files', async t => {
	await withTemporaryDirectory(t, async directory => {
		const monthDirectory = join(directory, '2026', 'june');
		await mkdir(monthDirectory, {recursive: true});
		await writeFile(
			join(monthDirectory, '2026_june_07.md'),
			'---\nmood: calm\n---\n\nModern',
		);
		await writeFile(join(monthDirectory, '2026-06-08.md'), 'Old');

		const paths = await getJournalEntryPathMapForMonth({
			month: 6,
			rootDirectory: directory,
			year: 2026,
		});
		const moods = await getJournalMoodMapForMonth({
			month: 6,
			rootDirectory: directory,
			year: 2026,
		});
		const entryCount = await countJournalEntries({rootDirectory: directory});
		const oldContent = await readFile(
			join(monthDirectory, '2026-06-08.md'),
			'utf8',
		);

		t.deepEqual(
			[...paths.entries()],
			[[7, join('2026', 'june', '2026_june_07.md')]],
		);
		t.deepEqual([...moods.entries()], [[7, 'calm']]);
		t.is(entryCount, 1);
		t.is(oldContent, 'Old');
	});
});

test('load ignores old date-dashed filenames', async t => {
	await withTemporaryDirectory(t, async directory => {
		const monthDirectory = join(directory, '2026', 'june');
		await mkdir(monthDirectory, {recursive: true});
		await writeFile(join(monthDirectory, '2026-06-07.md'), 'Old entry');
		const content = await loadJournalEntry({
			now: june7,
			rootDirectory: directory,
		});

		t.is(content, '');
	});
});
