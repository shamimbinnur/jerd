import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {relative} from 'node:path';
import {listJournalFiles, listJournalFilesForMonth} from './journal-files.js';
import {
	type JournalMood,
	normalizeLineEndings,
	parseMoodFrontmatter,
	upsertJournalFrontmatter,
} from './journal-frontmatter.js';
import {getJournalLocation, pad2, toDateSlug} from './journal-paths.js';

const timestamp = (now: Date) =>
	`${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(
		now.getDate(),
	)} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(
		now.getSeconds(),
	)}`;

const readJournalFile = async (path: string) =>
	readFile(path, 'utf8')
		.then(content => normalizeLineEndings(content))
		.catch(() => '');

export const loadJournalEntry = async ({
	rootDirectory,
	now = new Date(),
}: {
	readonly rootDirectory: string;
	readonly now?: Date;
}) => {
	const {filePath} = getJournalLocation(rootDirectory, now);
	return readJournalFile(filePath);
};

export const loadJournalEntryByPath = async ({path}: {readonly path: string}) =>
	readJournalFile(path);

export const saveJournalEntry = async ({
	rootDirectory,
	content,
	mood,
	now = new Date(),
	mode = 'append',
}: {
	readonly rootDirectory: string;
	readonly content: string;
	readonly mood?: string;
	readonly now?: Date;
	readonly mode?: 'append' | 'replace';
}) => {
	const {directoryPath, filePath} = getJournalLocation(rootDirectory, now);
	const entryContent = upsertJournalFrontmatter(content, {
		mood,
		slug: toDateSlug(now),
		tags: [],
	});

	await mkdir(directoryPath, {recursive: true});

	if (mode === 'replace') {
		await writeFile(filePath, `${entryContent}\n`, 'utf8');
		return relative(rootDirectory, filePath);
	}

	const existing = await readFile(filePath, 'utf8').catch(() => '');
	const nextContent =
		existing.trim().length > 0
			? `${existing.trimEnd()}\n\n---\n\n## ${timestamp(
					now,
				)}\n\n${entryContent}\n`
			: `${entryContent}\n`;

	await writeFile(filePath, nextContent, 'utf8');

	return relative(rootDirectory, filePath);
};

export const saveJournalEntryByPath = async ({
	content,
	mood,
	path,
}: {
	readonly content: string;
	readonly mood?: string;
	readonly path: string;
}) => {
	await writeFile(
		path,
		`${upsertJournalFrontmatter(content, {mood})}\n`,
		'utf8',
	);
	return path;
};

export const countJournalEntries = async ({
	rootDirectory,
}: {
	readonly rootDirectory: string;
}) => {
	const files = await listJournalFiles(rootDirectory);
	return files.length;
};

export const getJournalEntryPathMapForMonth = async ({
	month,
	rootDirectory,
	year,
}: {
	readonly month: number;
	readonly rootDirectory: string;
	readonly year: number;
}) => {
	const files = await listJournalFilesForMonth({month, rootDirectory, year});
	const paths = new Map<number, string>();
	for (const file of files) {
		if (!paths.has(file.day)) {
			paths.set(file.day, file.relativePath);
		}
	}

	return paths;
};

export const getJournalMoodMapForMonth = async ({
	month,
	rootDirectory,
	year,
}: {
	readonly month: number;
	readonly rootDirectory: string;
	readonly year: number;
}) => {
	const files = await listJournalFilesForMonth({month, rootDirectory, year});
	const moodEntries = await Promise.all(
		files.map(async file => {
			const content = await readFile(file.fullPath, 'utf8').catch(() => '');
			const mood = parseMoodFrontmatter(content);
			if (!mood) {
				return undefined;
			}

			return {day: file.day, mood};
		}),
	);

	const moods = new Map<number, JournalMood>();
	for (const entry of moodEntries) {
		if (entry && !moods.has(entry.day)) {
			moods.set(entry.day, entry.mood);
		}
	}

	return moods;
};
