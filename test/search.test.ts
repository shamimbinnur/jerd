import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import test from 'ava';
import {parseDateQuery, searchEntries} from '../source/utils/journal-search.js';
import {withTemporaryDirectory} from './helpers.js';

test('parseDateQuery handles aliases, relative dates, and ISO dates', t => {
	const now = new Date('2026-06-07T10:00:00');

	t.is(parseDateQuery('today', now)?.iso, '2026-06-07');
	t.is(parseDateQuery('yesterday', now)?.iso, '2026-06-06');
	t.is(parseDateQuery('3 days ago', now)?.iso, '2026-06-04');
	t.is(parseDateQuery('2026-05-31', now)?.iso, '2026-05-31');
	t.is(parseDateQuery('2026-02-31', now), undefined);
});

test('search indexes current-format files and ignores old date-dashed files', async t => {
	await withTemporaryDirectory(t, async directory => {
		const monthDirectory = join(directory, '2026', 'june');
		await mkdir(monthDirectory, {recursive: true});
		await writeFile(
			join(monthDirectory, '2026_june_07.md'),
			'---\ntags: [work, planning]\n---\n\nReadable planning notes',
		);
		await writeFile(
			join(monthDirectory, '2026-06-08.md'),
			'This old file should not appear',
		);

		const emptyResults = await searchEntries({
			query: '',
			rootDirectory: directory,
		});
		const tagResults = await searchEntries({
			query: 'work',
			rootDirectory: directory,
		});
		const contentResults = await searchEntries({
			query: 'PLANNING',
			rootDirectory: directory,
		});
		const dateResults = await searchEntries({
			query: '2026-06-07',
			rootDirectory: directory,
		});
		const oldResults = await searchEntries({
			query: 'old file',
			rootDirectory: directory,
		});

		t.deepEqual(
			emptyResults.map(result => result.path),
			[join('2026', 'june', '2026_june_07.md')],
		);
		t.is(tagResults[0]?.date, '2026-06-07');
		t.is(tagResults[0]?.matchLine, undefined);
		t.is(contentResults[0]?.matchLine, 'Readable planning notes');
		t.deepEqual(contentResults[0]?.matchRanges, [{start: 9, end: 17}]);
		t.is(dateResults[0]?.date, '2026-06-07');
		t.is(dateResults[0]?.matchLine, undefined);
		t.deepEqual(oldResults, []);
	});
});
