import process from 'node:process';
import React from 'react';
import {useApp} from 'ink';
import AppScreen from './app-screen.js';
import MainFrame from './components/main-frame.js';
import {useAppInput} from './hooks/use-app-input.js';
import {useCalendarEntries} from './hooks/use-calendar-entries.js';
import {useFindEntries} from './hooks/use-find-entries.js';
import {useJournalEditor} from './hooks/use-journal-editor.js';
import {useMoodTracker} from './hooks/use-mood-tracker.js';
import {useProjectSettings} from './hooks/use-project-settings.js';
import type {Screen} from './types.js';
import type {JournalMood} from './utils/journal-frontmatter.js';
import type {ProjectInitSubmitInput} from './hooks/use-project-init-form.js';

type Props = {
	readonly configDirectory?: string;
	readonly now?: Date;
	readonly onPostInitNextStep?: (command: string) => void;
	readonly postInitCdCommand?: string;
	readonly screen: Screen;
};

export default function App({
	configDirectory = process.cwd(),
	now,
	onPostInitNextStep,
	postInitCdCommand,
	screen,
}: Props) {
	const {exit} = useApp();
	const [activeScreen, setActiveScreen] = React.useState<Screen>(screen);
	const [mood, setMood] = React.useState<JournalMood>('neutral');
	const [moodCheckInSelectedIndex, setMoodCheckInSelectedIndex] =
		React.useState(0);
	const project = useProjectSettings(configDirectory);
	const journal = useJournalEditor({
		configDirectory,
		editor: project.editor,
		now,
		setActiveScreen,
	});
	const calendar = useCalendarEntries({
		configDirectory,
		journalEntryCount: journal.entryCount,
		now,
	});
	const find = useFindEntries({
		active: activeScreen === 'find',
		configDirectory,
		now,
	});
	const moodTracker = useMoodTracker({
		active: activeScreen === 'mood-tracker',
		configDirectory,
		journalEntryCount: journal.entryCount,
		now,
	});

	const completeProjectInit = React.useCallback(
		async (input: ProjectInitSubmitInput) => {
			await project.completeProjectInit(input);
			if (postInitCdCommand && postInitCdCommand !== 'cd .') {
				onPostInitNextStep?.(postInitCdCommand);
				exit();
				return;
			}

			setActiveScreen('home');
		},
		[exit, onPostInitNextStep, postInitCdCommand, project],
	);

	const writeWithMood = React.useCallback(
		(selectedMood: JournalMood) => {
			setMood(selectedMood);
			void journal.writeToday(selectedMood);
		},
		[journal],
	);

	React.useEffect(() => {
		if (activeScreen !== 'new-entry' || !project.isLoaded) {
			return;
		}

		void journal.writeToday(mood);
	}, [activeScreen, journal, mood, project.isLoaded]);

	const openSelectedFindEntry = React.useCallback(async () => {
		const selected = find.results[find.selectedIndex];
		if (!selected || find.isOpening) {
			return;
		}

		try {
			find.setIsOpening(true);
			await journal.openEntry({
				mood,
				onError(message) {
					journal.setStatus(message);
					setActiveScreen('home');
				},
				onSaved() {
					journal.showSavedStatus();
					setActiveScreen('home');
				},
				relativePath: selected.path,
			});
		} finally {
			find.setIsOpening(false);
		}
	}, [find, journal, mood]);

	const openSelectedCalendarEntry = React.useCallback(async () => {
		const relativePath = calendar.entryPaths.get(calendar.selectedDay);
		if (!relativePath || calendar.isOpening) {
			calendar.setStatus('No journal entry found for selected date.');
			return;
		}

		try {
			calendar.setIsOpening(true);
			await journal.openEntry({
				mood,
				onError: calendar.setStatus,
				onSaved() {
					calendar.setStatus('Journal Saved!');
				},
				relativePath,
			});
		} finally {
			calendar.setIsOpening(false);
		}
	}, [calendar, journal, mood]);

	useAppInput({
		activeScreen,
		calendar,
		find,
		moodCheckInSelectedIndex,
		moodTracker,
		openSelectedCalendarEntry() {
			void openSelectedCalendarEntry();
		},
		setActiveScreen,
		setMoodCheckInSelectedIndex,
		writeWithMood,
	});

	return (
		<MainFrame>
			<AppScreen
				activeScreen={activeScreen}
				calendar={calendar}
				completeProjectInit={completeProjectInit}
				find={find}
				journal={journal}
				moodCheckInSelectedIndex={moodCheckInSelectedIndex}
				moodTracker={moodTracker}
				now={now}
				openSelectedFindEntry={() => {
					void openSelectedFindEntry();
				}}
				postInitCdCommand={postInitCdCommand}
				project={project}
			/>
		</MainFrame>
	);
}
