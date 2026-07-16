import {access} from 'node:fs/promises';
import {parseJournalDateQuery} from '../core/journal/date-query.js';
import {
	loadJournalEntryByPath,
	replaceJournalEntryByPath,
} from '../core/journal/store.js';
import {openJournalInEditor} from '../core/journal/editor.js';
import {getJournalLocation} from '../core/journal/paths.js';

type OpenJournalEntryInput = {
	readonly dateText?: string;
	readonly editor?: string;
	readonly now?: Date;
	readonly openEditor?: typeof openJournalInEditor;
	readonly rootDirectory: string;
};

export class OpenCommandError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'OpenCommandError';
	}
}

const ensureExistingFile = async (filePath: string) => {
	try {
		await access(filePath);
	} catch {
		throw new OpenCommandError('No journal entry found for that date.');
	}
};

export const openJournalEntryForDate = async ({
	dateText,
	editor,
	now = new Date(),
	openEditor = openJournalInEditor,
	rootDirectory,
}: OpenJournalEntryInput) => {
	if (!dateText?.trim()) {
		throw new OpenCommandError('Usage: jerd open today|yesterday|YYYY-MM-DD');
	}

	const parsedDate = parseJournalDateQuery(dateText, now);
	if (!parsedDate) {
		throw new OpenCommandError(
			'Invalid date. Use today, yesterday, or YYYY-MM-DD.',
		);
	}

	const location = getJournalLocation(rootDirectory, parsedDate.date);
	await ensureExistingFile(location.filePath);

	const existingContent = await loadJournalEntryByPath({
		path: location.filePath,
	});
	const content = await openEditor(existingContent, editor);
	await replaceJournalEntryByPath({content, path: location.filePath});

	return location.relativePath;
};
