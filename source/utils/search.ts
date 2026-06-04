import {readFile, readdir} from 'node:fs/promises';
import {join, relative} from 'node:path';

const pad2 = (value: number) => String(value).padStart(2, '0');

const toIso = (date: Date) =>
	`${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

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

const extractTags = (content: string) => {
	const match = /^---\n([\s\S]*?)\n---\n?/.exec(content);
	if (!match) {
		return [];
	}

	const block = match[1] ?? '';
	const tags: string[] = [];
	const inlineTagsMatch = /^\s*tags\s*:\s*(.+)$/im.exec(block);
	if (inlineTagsMatch?.[1]) {
		const inline = inlineTagsMatch[1]
			.replace(/[[\]]/g, '')
			.split(',')
			.map(part => part.trim().replace(/^["']|["']$/g, ''))
			.filter(Boolean);
		tags.push(...inline);
	}

	const listTags = [...block.matchAll(/^\s*-\s*([^\n#]+)$/gim)]
		.map(match_ => match_[1]?.trim().replace(/^["']|["']$/g, ''))
		.filter(Boolean) as string[];
	tags.push(...listTags);

	return [...new Set(tags.map(tag => tag.toLowerCase()).filter(Boolean))];
};

const derivePreview = (content: string) => {
	const lines = content
		.split('\n')
		.map(line => line.trim())
		.filter(Boolean);
	return lines.find(Boolean)?.slice(0, 100) ?? '(empty entry)';
};

type ParsedFileDate =
	| {
			readonly day: string;
			readonly month?: string;
			readonly year: string;
	  }
	| undefined;

const parseDateFromFileName = (fileName: string): ParsedFileDate => {
	const modern = /^(\d{4})_[a-z]+_(\d{2})\.md$/i.exec(fileName);
	if (modern) {
		const year = modern[1];
		const day = modern[2];
		if (!year || !day) {
			return undefined;
		}

		return {day, year};
	}

	const legacy = /^(\d{4})-(\d{2})-(\d{2})\.md$/.exec(fileName);
	if (legacy) {
		const year = legacy[1];
		const month = legacy[2];
		const day = legacy[3];
		if (!year || !month || !day) {
			return undefined;
		}

		return {day, month, year};
	}

	return undefined;
};

const monthNameToNumber: Record<string, string> = {
	april: '04',
	august: '08',
	december: '12',
	february: '02',
	january: '01',
	july: '07',
	june: '06',
	march: '03',
	may: '05',
	november: '11',
	october: '10',
	september: '09',
};

const buildEntryDate = ({
	day,
	monthDirectory,
	monthFromFile,
	year,
}: {
	readonly day: string;
	readonly monthDirectory: string;
	readonly monthFromFile?: string;
	readonly year: string;
}) => {
	const month = monthFromFile ?? monthNameToNumber[monthDirectory];
	if (!month) {
		return undefined;
	}

	if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month) || !/^\d{2}$/.test(day)) {
		return undefined;
	}

	const iso = `${year}-${month}-${day}`;
	const parsed = new Date(`${iso}T00:00:00`);
	if (Number.isNaN(parsed.getTime())) {
		return undefined;
	}

	return iso;
};

const enumerateEntries = async (rootDirectory: string) => {
	const yearDirs = await readdir(rootDirectory, {withFileTypes: true}).catch(
		() => [],
	);
	const years = yearDirs.filter(
		yearDir => yearDir.isDirectory() && /^\d{4}$/.test(yearDir.name),
	);

	const nested = await Promise.all(
		years.map(async yearDir => {
			const yearPath = join(rootDirectory, yearDir.name);
			const monthDirs = await readdir(yearPath, {withFileTypes: true}).catch(
				() => [],
			);

			return Promise.all(
				monthDirs
					.filter(monthDir => monthDir.isDirectory())
					.map(async monthDir => {
						const monthPath = join(yearPath, monthDir.name);
						const files = await readdir(monthPath, {
							withFileTypes: true,
						}).catch(() => []);

						const entries = await Promise.all(
							files
								.filter(file => file.isFile() && file.name.endsWith('.md'))
								.map(async file => {
									const parsedName = parseDateFromFileName(file.name);
									if (!parsedName) {
										return undefined;
									}

									const date = buildEntryDate({
										day: parsedName.day,
										monthDirectory: monthDir.name,
										monthFromFile: parsedName.month,
										year: parsedName.year,
									});
									if (!date) {
										return undefined;
									}

									const fullPath = join(monthPath, file.name);
									const content = await readFile(fullPath, 'utf8').catch(
										() => '',
									);
									return {
										content,
										date,
										path: relative(rootDirectory, fullPath),
										preview: derivePreview(content),
										tags: extractTags(content),
									} satisfies IndexedEntry;
								}),
						);

						return entries.filter(
							(entry): entry is IndexedEntry => entry !== undefined,
						);
					}),
			);
		}),
	);

	return nested.flat(2);
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
		return {date: now, iso: toIso(now)};
	}

	if (normalized === 'yesterday') {
		const date = new Date(now);
		date.setDate(now.getDate() - 1);
		return {date, iso: toIso(date)};
	}

	const relativeDays = /^(\d+)\s+days?\s+(ago|before)$/.exec(normalized);
	if (relativeDays) {
		const days = Number(relativeDays[1]);
		const date = new Date(now);
		date.setDate(now.getDate() - days);
		return {date, iso: toIso(date)};
	}

	const absolute = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
	if (absolute) {
		const year = absolute[1];
		const month = absolute[2];
		const day = absolute[3];
		if (!year || !month || !day) {
			return undefined;
		}

		const date = new Date(`${year}-${month}-${day}T00:00:00`);
		if (!Number.isNaN(date.getTime()) && toIso(date) === normalized) {
			return {date, iso: normalized};
		}
	}

	return undefined;
};

const scoreTextMatch = (entry: IndexedEntry, query: string) => {
	const terms = query
		.toLowerCase()
		.split(/\s+/)
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
			.sort((a, b) => b.date.localeCompare(a.date))
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
		.sort((a, b) => {
			if (b.score === a.score) {
				return b.date.localeCompare(a.date);
			}

			return b.score - a.score;
		});
};
