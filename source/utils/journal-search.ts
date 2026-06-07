import {readFile} from 'node:fs/promises';
import {listJournalFiles} from './journal-files.js';
import {
	extractFrontmatterTags,
	stripFrontmatter,
} from './journal-frontmatter.js';
import {toIsoDate} from './journal-paths.js';

export type ParsedDate = {
	readonly date: Date;
	readonly iso: string;
};

export type SearchResult = {
	readonly date: string;
	readonly path: string;
	readonly preview: string;
	readonly score: number;
};

type IndexedEntry = {
	readonly content: string;
	readonly date: string;
	readonly path: string;
	readonly preview: string;
	readonly tags: string[];
};

const derivePreview = (content: string) => {
	const lines = stripFrontmatter(content)
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean);
	return lines.find(Boolean)?.slice(0, 100) ?? '(empty entry)';
};

const enumerateEntries = async (rootDirectory: string) => {
	const files = await listJournalFiles(rootDirectory);
	return Promise.all(
		files.map(async file => {
			const content = await readFile(file.fullPath, 'utf8').catch(() => '');
			return {
				content,
				date: file.isoDate,
				path: file.relativePath,
				preview: derivePreview(content),
				tags: extractFrontmatterTags(content),
			} satisfies IndexedEntry;
		}),
	);
};

export const parseDateQuery = (
	query: string,
	now = new Date(),
): ParsedDate | undefined => {
	const normalized = query.trim().toLowerCase();
	if (!normalized) {
		return undefined;
	}

	if (normalized === 'today') {
		return {date: now, iso: toIsoDate(now)};
	}

	if (normalized === 'yesterday') {
		const date = new Date(now);
		date.setDate(now.getDate() - 1);
		return {date, iso: toIsoDate(date)};
	}

	const relativeDays = /^(\d+)\s+days?\s+(ago|before)$/v.exec(normalized);
	if (relativeDays) {
		const days = Number(relativeDays[1]);
		const date = new Date(now);
		date.setDate(now.getDate() - days);
		return {date, iso: toIsoDate(date)};
	}

	const absolute = /^(\d{4})-(\d{2})-(\d{2})$/v.exec(normalized);
	if (absolute) {
		const year = absolute[1];
		const month = absolute[2];
		const day = absolute[3];
		if (!year || !month || !day) {
			return undefined;
		}

		const date = new Date(`${year}-${month}-${day}T00:00:00`);
		if (!Number.isNaN(date.getTime()) && toIsoDate(date) === normalized) {
			return {date, iso: normalized};
		}
	}

	return undefined;
};

const scoreTextMatch = (entry: IndexedEntry, query: string) => {
	const terms = query
		.toLowerCase()
		.split(/\s+/v)
		.map(term => term.trim())
		.filter(Boolean);
	if (terms.length === 0) {
		return 0;
	}

	const path = entry.path.toLowerCase();
	const content = entry.content.toLowerCase();
	const preview = entry.preview.toLowerCase();
	const tags = entry.tags.join(' ');
	let score = 0;

	for (const term of terms) {
		if (entry.date.includes(term)) {
			score += 50;
		}

		if (path.includes(term)) {
			score += 25;
		}

		if (tags.includes(term)) {
			score += 20;
		}

		if (preview.includes(term)) {
			score += 10;
		}

		if (content.includes(term)) {
			score += 5;
		}
	}

	return score;
};

export const searchEntries = async ({
	now = new Date(),
	query,
	rootDirectory,
}: {
	readonly now?: Date;
	readonly query: string;
	readonly rootDirectory: string;
}) => {
	const entries = await enumerateEntries(rootDirectory);
	const trimmed = query.trim();
	if (!trimmed) {
		return entries
			.toSorted((a, b) => b.date.localeCompare(a.date))
			.map(entry => ({
				date: entry.date,
				path: entry.path,
				preview: entry.preview,
				score: 0,
			}));
	}

	const parsedDate = parseDateQuery(trimmed, now);
	if (parsedDate) {
		return entries
			.filter(entry => entry.date === parsedDate.iso)
			.map(entry => ({
				date: entry.date,
				path: entry.path,
				preview: entry.preview,
				score: 1000,
			}));
	}

	return entries
		.map(entry => ({
			date: entry.date,
			path: entry.path,
			preview: entry.preview,
			score: scoreTextMatch(entry, trimmed),
		}))
		.filter(entry => entry.score > 0)
		.toSorted((a, b) => {
			if (b.score === a.score) {
				return b.date.localeCompare(a.date);
			}

			return b.score - a.score;
		});
};
