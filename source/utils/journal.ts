import {spawnSync} from 'node:child_process';
import {
	mkdtemp,
	mkdir,
	readFile,
	readdir,
	rm,
	writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import {join, relative} from 'node:path';
import process from 'node:process';

export type JournalMood = 'angry' | 'calm' | 'happy' | 'neutral' | 'sad';

const monthNames = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
] as const;

const pad2 = (value: number) => String(value).padStart(2, '0');
const normalizeLineEndings = (value: string) =>
	value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

const timestamp = (now: Date) =>
	`${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(
		now.getDate(),
	)} ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(
		now.getSeconds(),
	)}`;

const getJournalLocation = (rootDirectory: string, now: Date) => {
	const year = String(now.getFullYear());
	const monthNumber = pad2(now.getMonth() + 1);
	const month = monthNames[now.getMonth()] ?? 'january';
	const day = pad2(now.getDate());
	const directoryPath = join(rootDirectory, year, month);
	const fileName = `${year}_${month}_${day}.md`;
	const filePath = join(directoryPath, fileName);
	const legacyFileName = `${year}-${monthNumber}-${day}.md`;
	const legacyFilePath = join(directoryPath, legacyFileName);

	return {directoryPath, filePath, legacyFilePath};
};

const resolveExistingJournalPath = async (rootDirectory: string, now: Date) => {
	const {filePath, legacyFilePath} = getJournalLocation(rootDirectory, now);

	try {
		await readFile(filePath, 'utf8');
		return filePath;
	} catch {}

	try {
		await readFile(legacyFilePath, 'utf8');
		return legacyFilePath;
	} catch {}

	return filePath;
};

const readJournalFile = async (path: string) =>
	readFile(path, 'utf8')
		.then(content => normalizeLineEndings(content))
		.catch(() => '');

const upsertMoodFrontmatter = (content: string, mood?: string) => {
	if (!mood) {
		return content.trim();
	}

	const trimmed = content.trim();
	const match = /^---\n([\s\S]*?)\n---\n?/.exec(trimmed);
	if (!match) {
		return `---\nmood: ${mood}\n---\n\n${trimmed}`.trim();
	}

	const block = match[1] ?? '';
	const hasMood = /^\s*mood\s*:/im.test(block);
	const nextBlock = hasMood
		? block.replace(/^\s*mood\s*:\s*.*$/im, `mood: ${mood}`)
		: `${block}\nmood: ${mood}`;
	const body = trimmed.slice(match[0].length).trimStart();
	return `---\n${nextBlock}\n---\n\n${body}`.trim();
};

const parseMoodFrontmatter = (content: string): JournalMood | undefined => {
	const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalizeLineEndings(content));
	if (!match) {
		return undefined;
	}

	const moodMatch = /^\s*mood\s*:\s*(angry|calm|happy|neutral|sad)\s*$/im.exec(
		match[1] ?? '',
	);
	return moodMatch?.[1]?.toLowerCase() as JournalMood | undefined;
};

export const openJournalInEditor = async (
	initialContent = '',
	configuredEditor?: string,
) => {
	const temporaryDirectory = await mkdtemp(join(os.tmpdir(), 'jerd-journal-'));
	const messagePath = join(temporaryDirectory, 'JOURNAL_EDITMSG.md');
	const editor = process.env['EDITOR'] ?? configuredEditor?.trim() ?? 'vim';

	await writeFile(messagePath, normalizeLineEndings(initialContent), 'utf8');

	const result = spawnSync(editor, [messagePath], {
		stdio: 'inherit',
	});

	if (result.error) {
		await rm(temporaryDirectory, {force: true, recursive: true});
		throw result.error;
	}

	if (result.status !== 0) {
		await rm(temporaryDirectory, {force: true, recursive: true});
		throw new Error(`${editor} exited with code ${result.status ?? 'unknown'}`);
	}

	const finalContent = normalizeLineEndings(
		await readFile(messagePath, 'utf8'),
	);
	await rm(temporaryDirectory, {force: true, recursive: true});

	return finalContent.trim();
};

export const loadJournalEntry = async ({
	rootDirectory,
	now = new Date(),
}: {
	readonly rootDirectory: string;
	readonly now?: Date;
}) => {
	const filePath = await resolveExistingJournalPath(rootDirectory, now);
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
	const {directoryPath} = getJournalLocation(rootDirectory, now);
	const filePath = await resolveExistingJournalPath(rootDirectory, now);
	const entryContent = upsertMoodFrontmatter(content, mood);

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
	await writeFile(path, `${upsertMoodFrontmatter(content, mood)}\n`, 'utf8');
	return path;
};

export const openEntryByPath = async ({
	editor,
	mood,
	path,
}: {
	readonly editor?: string;
	readonly mood?: string;
	readonly path: string;
}) => {
	const existingContent = await loadJournalEntryByPath({path});
	const content = await openJournalInEditor(existingContent, editor);
	return saveJournalEntryByPath({content, mood, path});
};

export const countJournalEntries = async ({
	rootDirectory,
}: {
	readonly rootDirectory: string;
}) => {
	const yearDirectories = await readdir(rootDirectory, {
		withFileTypes: true,
	}).catch(() => []);
	const years = yearDirectories.filter(
		yearDirectory =>
			yearDirectory.isDirectory() && /^\d{4}$/.test(yearDirectory.name),
	);

	const counts = await Promise.all(
		years.map(async yearDirectory => {
			const yearPath = join(rootDirectory, yearDirectory.name);
			const monthDirectories = await readdir(yearPath, {
				withFileTypes: true,
			}).catch(() => []);

			const monthCounts = await Promise.all(
				monthDirectories
					.filter(monthDirectory => monthDirectory.isDirectory())
					.map(async monthDirectory => {
						const monthPath = join(yearPath, monthDirectory.name);
						const files = await readdir(monthPath, {withFileTypes: true}).catch(
							() => [],
						);
						return files.filter(
							file => file.isFile() && file.name.endsWith('.md'),
						).length;
					}),
			);

			return monthCounts.reduce((sum, count) => sum + count, 0);
		}),
	);

	return counts.reduce((sum, count) => sum + count, 0);
};

export const getJournalEntryDaysForMonth = async ({
	month,
	rootDirectory,
	year,
}: {
	readonly month: number;
	readonly rootDirectory: string;
	readonly year: number;
}) => {
	const monthIndex = month - 1;
	const monthName = monthNames[monthIndex];
	if (!monthName) {
		return new Set<number>();
	}

	const monthPath = join(rootDirectory, String(year), monthName);
	const files = await readdir(monthPath, {withFileTypes: true}).catch(() => []);
	const days = new Set<number>();
	const nextMonth = pad2(month);
	for (const file of files) {
		if (!file.isFile() || !file.name.endsWith('.md')) {
			continue;
		}

		const currentPattern = new RegExp(
			`^${year}_${monthName}_(\\d{2})\\.md$`,
			'i',
		);
		const legacyPattern = new RegExp(
			`^${year}-${nextMonth}-(\\d{2})\\.md$`,
			'i',
		);
		const matched =
			currentPattern.exec(file.name) ?? legacyPattern.exec(file.name);
		const dayText = matched?.[1];
		if (!dayText) {
			continue;
		}

		const day = Number(dayText);
		if (Number.isInteger(day) && day >= 1 && day <= 31) {
			days.add(day);
		}
	}

	return days;
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
	const monthIndex = month - 1;
	const monthName = monthNames[monthIndex];
	if (!monthName) {
		return new Map<number, string>();
	}

	const monthPath = join(rootDirectory, String(year), monthName);
	const files = await readdir(monthPath, {withFileTypes: true}).catch(() => []);
	const paths = new Map<number, string>();
	const monthNumber = pad2(month);
	for (const file of files) {
		if (!file.isFile() || !file.name.endsWith('.md')) {
			continue;
		}

		const currentPattern = new RegExp(
			`^${year}_${monthName}_(\\d{2})\\.md$`,
			'i',
		);
		const legacyPattern = new RegExp(
			`^${year}-${monthNumber}-(\\d{2})\\.md$`,
			'i',
		);
		const matched =
			currentPattern.exec(file.name) ?? legacyPattern.exec(file.name);
		const dayText = matched?.[1];
		if (!dayText) {
			continue;
		}

		const day = Number(dayText);
		if (!Number.isInteger(day) || day < 1 || day > 31) {
			continue;
		}

		const relativePath = join(String(year), monthName, file.name);
		if (!paths.has(day)) {
			paths.set(day, relativePath);
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
	const monthIndex = month - 1;
	const monthName = monthNames[monthIndex];
	if (!monthName) {
		return new Map<number, JournalMood>();
	}

	const monthPath = join(rootDirectory, String(year), monthName);
	const files = await readdir(monthPath, {withFileTypes: true}).catch(() => []);
	const monthNumber = pad2(month);
	const moodEntries = await Promise.all(
		files.map(async file => {
			if (!file.isFile() || !file.name.endsWith('.md')) {
				return undefined;
			}

			const currentPattern = new RegExp(
				`^${year}_${monthName}_(\\d{2})\\.md$`,
				'i',
			);
			const legacyPattern = new RegExp(
				`^${year}-${monthNumber}-(\\d{2})\\.md$`,
				'i',
			);
			const matched =
				currentPattern.exec(file.name) ?? legacyPattern.exec(file.name);
			const dayText = matched?.[1];
			if (!dayText) {
				return undefined;
			}

			const day = Number(dayText);
			if (!Number.isInteger(day) || day < 1 || day > 31) {
				return undefined;
			}

			const content = await readFile(join(monthPath, file.name), 'utf8').catch(
				() => '',
			);
			const mood = parseMoodFrontmatter(content);
			if (!mood) {
				return undefined;
			}

			return {day, mood};
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
