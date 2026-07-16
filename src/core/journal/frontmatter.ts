export type JournalMood = 'calm' | 'happy' | 'sad' | 'anxious' | 'angry';

export const journalMoods = [
	'calm',
	'happy',
	'sad',
	'anxious',
	'angry',
] as const;

export const normalizeLineEndings = (value: string) =>
	value.replaceAll('\r\n', '\n').replaceAll('\r', '\n');

export const isJournalMood = (value: string): value is JournalMood => {
	for (const mood of journalMoods) {
		if (mood === value) {
			return true;
		}
	}

	return false;
};

export const parseJournalMood = (
	value: string | undefined,
): JournalMood | undefined => {
	const normalizedValue = value?.trim().toLowerCase();
	return normalizedValue && isJournalMood(normalizedValue)
		? normalizedValue
		: undefined;
};

const readFrontmatter = (content: string) => {
	const match = /^---\n([\s\S]*?)\n---\n?/v.exec(normalizeLineEndings(content));
	return match?.[1];
};

export const stripFrontmatter = (content: string) =>
	normalizeLineEndings(content).replace(/^---\n[\s\S]*?\n---\n?/v, '');

type JournalFrontmatter = {
	readonly mood?: string;
	readonly slug?: string;
	readonly tags?: readonly string[];
};

type FrontmatterField = {
	readonly key: 'mood' | 'slug' | 'tags';
	readonly value: string;
};

const quoteYamlString = (value: string) =>
	`"${value.replaceAll('\\', String.raw`\\`).replaceAll('"', String.raw`\"`)}"`;

export const upsertJournalFrontmatter = (
	content: string,
	{mood, slug, tags}: JournalFrontmatter,
) => {
	if (!mood && !slug && !tags) {
		return content.trim();
	}

	const trimmed = content.trim();
	const match = /^---\n([\s\S]*?)\n---\n?/v.exec(trimmed);
	const fields: FrontmatterField[] = [];
	if (mood) {
		fields.push({key: 'mood', value: mood});
	}

	if (slug) {
		fields.push({key: 'slug', value: quoteYamlString(slug)});
	}

	if (tags) {
		fields.push({key: 'tags', value: `[${tags.join(', ')}]`});
	}

	if (!match) {
		return `---\n${fields
			.map(field => `${field.key}: ${field.value}`)
			.join('\n')}\n---\n\n${trimmed}`.trim();
	}

	let nextBlock = match[1] ?? '';
	for (const field of fields) {
		const fieldPattern = new RegExp(String.raw`^\s*${field.key}\s*:.*$`, 'imv');
		if (fieldPattern.test(nextBlock)) {
			if (field.key === 'mood') {
				nextBlock = nextBlock.replace(
					fieldPattern,
					`${field.key}: ${field.value}`,
				);
			}

			continue;
		}

		nextBlock = nextBlock
			? `${nextBlock}\n${field.key}: ${field.value}`
			: `${field.key}: ${field.value}`;
	}

	const body = trimmed.slice(match[0].length).trimStart();
	return `---\n${nextBlock}\n---\n\n${body}`.trim();
};

export const upsertMoodFrontmatter = (content: string, mood?: string) =>
	upsertJournalFrontmatter(content, {mood});

export const parseMoodFrontmatter = (
	content: string,
): JournalMood | undefined => {
	const block = readFrontmatter(content);
	if (!block) {
		return undefined;
	}

	const moodMatch = /^\s*mood\s*:\s*(calm|happy|sad|anxious|angry)\s*$/imv.exec(
		block,
	);
	const mood = moodMatch?.[1]?.toLowerCase();
	return mood && isJournalMood(mood) ? mood : undefined;
};

export const extractFrontmatterTags = (content: string) => {
	const block = readFrontmatter(content);
	if (!block) {
		return [];
	}

	const tags: string[] = [];
	const inlineTagsMatch = /^\s*tags\s*:\s*(.+)$/imv.exec(block);
	if (inlineTagsMatch?.[1]) {
		const inline = inlineTagsMatch[1]
			.replaceAll(/[\[\]]/gv, '')
			.split(',')
			.map(part => part.trim().replaceAll(/^["']|["']$/gv, ''))
			.filter(Boolean);
		tags.push(...inline);
	}

	const listTags = [...block.matchAll(/^\s*-\s*([^\n#]+)$/gimv)].flatMap(
		match => {
			const tag = match[1]?.trim().replaceAll(/^["']|["']$/gv, '');
			return tag ? [tag] : [];
		},
	);
	tags.push(...listTags);

	return [...new Set(tags.map(tag => tag.toLowerCase()).filter(Boolean))];
};
