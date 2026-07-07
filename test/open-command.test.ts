import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import test from 'ava';
import {openJournalEntryForDate} from '../source/utils/open-command.js';
import {withTemporaryDirectory} from './helpers.js';

const june7 = new Date('2026-06-07T10:00:00');

const writeEntry = async ({
	content = '',
	datePath,
	directory,
}: {
	readonly content?: string;
	readonly datePath: string;
	readonly directory: string;
}) => {
	const filePath = join(directory, datePath);
	await mkdir(join(filePath, '..'), {recursive: true});
	await writeFile(filePath, content, 'utf8');
	return filePath;
};

test('open command resolves today to current journal path', async t => {
	await withTemporaryDirectory(t, async directory => {
		const filePath = await writeEntry({
			content: 'Today',
			datePath: join('2026', 'june', '2026_june_07.md'),
			directory,
		});
		const relativePath = await openJournalEntryForDate({
			dateText: 'today',
			now: june7,
			openEditor: async (content = '') => `${content.trim()}\nEdited today`,
			rootDirectory: directory,
		});

		t.is(relativePath, join('2026', 'june', '2026_june_07.md'));
		t.is(await readFile(filePath, 'utf8'), 'Today\nEdited today\n');
	});
});

test('open command resolves yesterday to previous day path', async t => {
	await withTemporaryDirectory(t, async directory => {
		await writeEntry({
			content: 'Yesterday',
			datePath: join('2026', 'june', '2026_june_06.md'),
			directory,
		});
		const relativePath = await openJournalEntryForDate({
			dateText: 'yesterday',
			now: june7,
			openEditor: async (content = '') => content,
			rootDirectory: directory,
		});

		t.is(relativePath, join('2026', 'june', '2026_june_06.md'));
	});
});

test('open command resolves ISO dates to current journal path format', async t => {
	await withTemporaryDirectory(t, async directory => {
		await writeEntry({
			content: 'May',
			datePath: join('2026', 'may', '2026_may_31.md'),
			directory,
		});
		const relativePath = await openJournalEntryForDate({
			dateText: '2026-05-31',
			now: june7,
			openEditor: async (content = '') => content,
			rootDirectory: directory,
		});

		t.is(relativePath, join('2026', 'may', '2026_may_31.md'));
	});
});

test('open command rejects invalid dates', async t => {
	await withTemporaryDirectory(t, async directory => {
		await t.throwsAsync(
			openJournalEntryForDate({
				dateText: '2026-02-31',
				now: june7,
				rootDirectory: directory,
			}),
			{message: 'Invalid date. Use today, yesterday, or YYYY-MM-DD.'},
		);
	});
});

test('open command rejects missing date argument', async t => {
	await withTemporaryDirectory(t, async directory => {
		await t.throwsAsync(
			openJournalEntryForDate({
				now: june7,
				rootDirectory: directory,
			}),
			{message: 'Usage: jerd open today|yesterday|YYYY-MM-DD'},
		);
	});
});

test('open command rejects missing journal files without creating them', async t => {
	await withTemporaryDirectory(t, async directory => {
		await t.throwsAsync(
			openJournalEntryForDate({
				dateText: 'today',
				now: june7,
				rootDirectory: directory,
			}),
			{message: 'No journal entry found for that date.'},
		);
		await t.throwsAsync(
			readFile(join(directory, '2026', 'june', '2026_june_07.md')),
		);
	});
});

test('open command saves edited content without changing frontmatter metadata', async t => {
	await withTemporaryDirectory(t, async directory => {
		const filePath = await writeEntry({
			content:
				'---\nmood: calm\nslug: "custom-entry"\ntags: [work]\n---\n\nBefore\n',
			datePath: join('2026', 'june', '2026_june_07.md'),
			directory,
		});
		await openJournalEntryForDate({
			dateText: 'today',
			now: june7,
			openEditor: async (content = '') => content.replace('Before', 'After'),
			rootDirectory: directory,
		});

		t.is(
			await readFile(filePath, 'utf8'),
			'---\nmood: calm\nslug: "custom-entry"\ntags: [work]\n---\n\nAfter\n',
		);
	});
});
