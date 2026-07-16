import {mkdir, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import test from 'ava';
import {searchEntries} from '../../../src/features/find/search.js';
import {withTemporaryDirectory} from '../../helpers.js';

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

test('search resolves today and yesterday to journal dates', async t => {
	await withTemporaryDirectory(t, async directory => {
		const monthDirectory = join(directory, '2026', 'june');
		await mkdir(monthDirectory, {recursive: true});
		await writeFile(
			join(monthDirectory, '2026_june_06.md'),
			'Yesterday entry',
		);
		await writeFile(join(monthDirectory, '2026_june_07.md'), 'Today entry');

		const now = new Date(2026, 5, 7, 12);
		const todayResults = await searchEntries({
			now,
			query: 'today',
			rootDirectory: directory,
		});
		const yesterdayResults = await searchEntries({
			now,
			query: 'yesterday',
			rootDirectory: directory,
		});

		t.deepEqual(
			todayResults.map(result => result.date),
			['2026-06-07'],
		);
		t.deepEqual(
			yesterdayResults.map(result => result.date),
			['2026-06-06'],
		);
	});
});
