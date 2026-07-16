import {spawnSync} from 'node:child_process';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import {join} from 'node:path';
import process from 'node:process';
import {normalizeLineEndings} from './frontmatter.js';

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
