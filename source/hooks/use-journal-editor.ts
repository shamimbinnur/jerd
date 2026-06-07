import {join} from 'node:path';
import process from 'node:process';
import React from 'react';
import type {Screen} from '../types.js';
import {openJournalInEditor} from '../utils/journal-editor.js';
import type {JournalMood} from '../utils/journal-frontmatter.js';
import {
	countJournalEntries,
	loadJournalEntry,
	saveJournalEntry,
	saveJournalEntryByPath,
	loadJournalEntryByPath,
} from '../utils/journal-store.js';

const formatSaveError = (error: unknown) =>
	error instanceof Error ? `Save failed: ${error.message}` : 'Save failed';

const withSuspendedRawMode = async (task: () => Promise<void>) => {
	const {stdin} = process;
	const canToggleRawMode =
		typeof stdin.setRawMode === 'function' && stdin.isTTY;

	try {
		if (canToggleRawMode) {
			stdin.setRawMode(false);
		}

		await task();
	} finally {
		if (canToggleRawMode) {
			stdin.setRawMode(true);
		}
	}
};

export const useJournalEditor = ({
	configDirectory,
	editor,
	now,
	setActiveScreen,
}: {
	readonly configDirectory: string;
	readonly editor?: string;
	readonly now?: Date;
	readonly setActiveScreen: React.Dispatch<React.SetStateAction<Screen>>;
}) => {
	const [entryCount, setEntryCount] = React.useState(0);
	const [status, setStatus] = React.useState<string>();
	const isOpeningToday = React.useRef(false);
	const statusClearTimeout = React.useRef<NodeJS.Timeout | undefined>(
		undefined,
	);

	const clearStatusTimeout = React.useCallback(() => {
		if (statusClearTimeout.current) {
			clearTimeout(statusClearTimeout.current);
			statusClearTimeout.current = undefined;
		}
	}, []);

	const showSavedStatus = React.useCallback(() => {
		setStatus('Journal Saved!');
		clearStatusTimeout();
		statusClearTimeout.current = setTimeout(() => {
			setStatus(undefined);
			statusClearTimeout.current = undefined;
		}, 1000);
	}, [clearStatusTimeout]);

	const refreshEntryCount = React.useCallback(async () => {
		const total = await countJournalEntries({rootDirectory: configDirectory});
		setEntryCount(total);
		return total;
	}, [configDirectory]);

	React.useEffect(
		() => () => {
			clearStatusTimeout();
		},
		[clearStatusTimeout],
	);

	React.useEffect(() => {
		let isMounted = true;

		void countJournalEntries({rootDirectory: configDirectory})
			.then(total => {
				if (isMounted) {
					setEntryCount(total);
				}
			})
			.catch(() => undefined);

		return () => {
			isMounted = false;
		};
	}, [configDirectory]);

	const writeToday = React.useCallback(
		async (selectedMood: JournalMood) => {
			if (isOpeningToday.current) {
				return;
			}

			isOpeningToday.current = true;
			clearStatusTimeout();
			setStatus(undefined);

			try {
				await withSuspendedRawMode(async () => {
					const existingContent = await loadJournalEntry({
						now,
						rootDirectory: configDirectory,
					});
					const content = await openJournalInEditor(existingContent, editor);
					await saveJournalEntry({
						content,
						mode: 'replace',
						mood: selectedMood,
						now,
						rootDirectory: configDirectory,
					});
				});
				await refreshEntryCount();
				showSavedStatus();
				setActiveScreen('home');
			} catch (error: unknown) {
				setStatus(formatSaveError(error));
				setActiveScreen('home');
			} finally {
				isOpeningToday.current = false;
			}
		},
		[
			clearStatusTimeout,
			configDirectory,
			editor,
			now,
			refreshEntryCount,
			setActiveScreen,
			showSavedStatus,
		],
	);

	const openEntry = React.useCallback(
		async ({
			mood,
			onError,
			onSaved,
			relativePath,
		}: {
			readonly mood: JournalMood;
			readonly onError: (message: string) => void;
			readonly onSaved: () => void;
			readonly relativePath: string;
		}) => {
			try {
				await withSuspendedRawMode(async () => {
					const path = join(configDirectory, relativePath);
					const existingContent = await loadJournalEntryByPath({path});
					const content = await openJournalInEditor(existingContent, editor);
					await saveJournalEntryByPath({content, mood, path});
				});
				await refreshEntryCount();
				onSaved();
			} catch (error: unknown) {
				onError(formatSaveError(error));
			}
		},
		[configDirectory, editor, refreshEntryCount],
	);

	return React.useMemo(
		() => ({
			entryCount,
			openEntry,
			setStatus,
			showSavedStatus,
			status,
			writeToday,
		}),
		[entryCount, openEntry, showSavedStatus, status, writeToday],
	);
};
