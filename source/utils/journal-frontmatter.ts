export type JournalMood = 'angry' | 'calm' | 'happy' | 'neutral' | 'sad';

const journalMoods = ['angry', 'calm', 'happy', 'neutral', 'sad'] as const;

export const normalizeLineEndings = (value: string) =>
	value.replaceAll('\r\n', '\n').replaceAll('\r', '\n');

const isJournalMood = (value: string): value is JournalMood => {
	for (const mood of journalMoods) {
		if (mood === value) {
			return true;
		}
	}

	return false;
};

const readFrontmatter = (content: string) => {
	const match = /^---\n([\s\S]*?)\n---\n?/v.exec(normalizeLineEndings(content));
	return match?.[1];
};

export const stripFrontmatter = (content: string) =>
	normalizeLineEndings(content).replace(/^---\n[\s\S]*?\n---\n?/v, '');

export const upsertMoodFrontmatter = (content: string, mood?: string) => {
	if (!mood) {
		return content.trim();
	}

	const trimmed = content.trim();
	const match = /^---\n([\s\S]*?)\n---\n?/v.exec(trimmed);
	if (!match) {
		return `---\nmood: ${mood}\n---\n\n${trimmed}`.trim();
	}

	const block = match[1] ?? '';
	const hasMood = /^\s*mood\s*:/imv.test(block);
	const nextBlock = hasMood
		? block.replace(/^\s*mood\s*:\s*.*$/imv, `mood: ${mood}`)
		: `${block}\nmood: ${mood}`;
	const body = trimmed.slice(match[0].length).trimStart();
	return `---\n${nextBlock}\n---\n\n${body}`.trim();
};

export const parseMoodFrontmatter = (
	content: string,
): JournalMood | undefined => {
	const block = readFrontmatter(content);
	if (!block) {
		return undefined;
	}

	const moodMatch = /^\s*mood\s*:\s*(angry|calm|happy|neutral|sad)\s*$/imv.exec(
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
