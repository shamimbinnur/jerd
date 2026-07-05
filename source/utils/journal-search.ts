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
	readonly matchLine?: string;
	readonly matchRanges?: readonly HighlightRange[];
	readonly path: string;
	readonly preview: string;
	readonly score: number;
};

export type HighlightRange = {
	readonly end: number;
	readonly start: number;
};

type IndexedEntry = {
	readonly bodyContent: string;
	readonly date: string;
	readonly path: string;
	readonly preview: string;
	readonly tags: string[];
};

const maxMatchLineLength = 120;

const searchTerms = (query: string) =>
	query
		.toLowerCase()
		.split(/\s+/v)
		.map(term => term.trim())
		.filter(Boolean);

const derivePreview = (content: string) => {
	const lines = stripFrontmatter(content)
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean);
	return lines.find(Boolean)?.slice(0, 100) ?? '(empty entry)';
};

const highlightRangesForLine = (
	line: string,
	terms: readonly string[],
): HighlightRange[] => {
	const lowerLine = line.toLowerCase();
	const ranges = terms.flatMap(term => {
		const matches: HighlightRange[] = [];
		let startIndex = 0;
		while (startIndex < lowerLine.length) {
			const matchIndex = lowerLine.indexOf(term, startIndex);
			if (matchIndex === -1) {
				break;
			}

			matches.push({start: matchIndex, end: matchIndex + term.length});
			startIndex = matchIndex + term.length;
		}

		return matches;
	});

	const merged: HighlightRange[] = [];
	for (const range of ranges.toSorted(
		(a, b) => a.start - b.start || b.end - a.end,
	)) {
		const previous = merged.at(-1);
		if (!previous || range.start >= previous.end) {
			merged.push(range);
		}
	}

	return merged;
};

const trimMatchLine = (
	line: string,
	ranges: readonly HighlightRange[],
): {line: string; ranges: readonly HighlightRange[]} => {
	if (line.length <= maxMatchLineLength || ranges.length === 0) {
		return {line, ranges};
	}

	const firstMatch = ranges[0];
	if (!firstMatch) {
		return {line, ranges};
	}

	const sliceStart = Math.max(
		0,
		Math.min(firstMatch.start - 40, line.length - maxMatchLineLength),
	);
	const sliceEnd = sliceStart + maxMatchLineLength;
	const prefix = sliceStart > 0 ? '...' : '';
	const suffix = sliceEnd < line.length ? '...' : '';
	const nextLine = `${prefix}${line.slice(sliceStart, sliceEnd)}${suffix}`;
	const nextRanges = ranges
		.map(range => ({
			start: Math.max(range.start, sliceStart) - sliceStart + prefix.length,
			end: Math.min(range.end, sliceEnd) - sliceStart + prefix.length,
		}))
		.filter(range => range.end > range.start);

	return {line: nextLine, ranges: nextRanges};
};

const deriveMatch = (
	bodyContent: string,
	terms: readonly string[],
):
	| {
			readonly matchLine: string;
			readonly matchRanges: readonly HighlightRange[];
	  }
	| undefined => {
	const line = bodyContent
		.split('\n')
		.map(currentLine => currentLine.trim())
		.find(currentLine => {
			const lowerLine = currentLine.toLowerCase();
			return terms.some(term => lowerLine.includes(term));
		});

	if (!line) {
		return undefined;
	}

	const match = trimMatchLine(line, highlightRangesForLine(line, terms));
	return match.ranges.length > 0
		? {matchLine: match.line, matchRanges: match.ranges}
		: undefined;
};

const enumerateEntries = async (rootDirectory: string) => {
	const files = await listJournalFiles(rootDirectory);
	return Promise.all(
		files.map(async file => {
			const content = await readFile(file.fullPath, 'utf8').catch(() => '');
			return {
				bodyContent: stripFrontmatter(content),
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

const scoreTextMatch = (entry: IndexedEntry, terms: readonly string[]) => {
	if (terms.length === 0) {
		return 0;
	}

	const path = entry.path.toLowerCase();
	const content = entry.bodyContent.toLowerCase();
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
}): Promise<SearchResult[]> => {
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

	const terms = searchTerms(trimmed);
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
		.map(entry => {
			const match = deriveMatch(entry.bodyContent, terms);
			return {
				date: entry.date,
				...match,
				path: entry.path,
				preview: entry.preview,
				score: scoreTextMatch(entry, terms),
			};
		})
		.filter(entry => entry.score > 0)
		.toSorted((a, b) => {
			if (b.score === a.score) {
				return b.date.localeCompare(a.date);
			}

			return b.score - a.score;
		});
};
