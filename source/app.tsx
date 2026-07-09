import process from 'node:process';
import React from 'react';
import {useApp} from 'ink';
import AppScreen from './app/screen.js';
import MainFrame from './components/layout/main-frame.js';
import {useAppInput} from './hooks/use-app-input.js';
import {useCalendarEntries} from './hooks/use-calendar-entries.js';
import {useFindEntries} from './hooks/use-find-entries.js';
import {useJournalEditor} from './hooks/use-journal-editor.js';
import {useMoodTracker} from './hooks/use-mood-tracker.js';
import {useProjectSettings} from './hooks/use-project-settings.js';
import MoodCommandSelect from './screens/mood-command-select.js';
import PostInitPrompt from './screens/post-init-prompt.js';
import type {Screen} from './app/types.js';
import type {JournalMood} from './utils/journal-frontmatter.js';
import type {MoodMonthQueryResult} from './utils/mood-month-query.js';
import type {ProjectInitSubmitInput} from './hooks/use-project-init-form.js';

type Props = {
	readonly configDirectory?: string;
	readonly initialFindQuery?: string;
	readonly initialMood?: JournalMood;
	readonly initialMoodTrackerMonth?: MoodMonthQueryResult;
	readonly invalidMood?: string;
	readonly now?: Date;
	readonly postInitCdCommand?: string;
	readonly screen: Screen;
};

export default function App({
	configDirectory = process.cwd(),
	initialFindQuery,
	initialMood = 'calm',
	initialMoodTrackerMonth,
	invalidMood,
	now,
	postInitCdCommand,
	screen,
}: Props) {
	const {exit} = useApp();
	const [activeScreen, setActiveScreen] = React.useState<Screen>(screen);
	const [mood, setMood] = React.useState<JournalMood>(initialMood);
	const [invalidMoodInput, setInvalidMoodInput] = React.useState(invalidMood);
	const [postInitPrompt, setPostInitPrompt] = React.useState<{
		readonly command: string;
		readonly userName: string;
	}>();
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
		initialQuery: initialFindQuery,
		now,
	});
	const moodTracker = useMoodTracker({
		active: activeScreen === 'mood-tracker',
		configDirectory,
		initialMonth: initialMoodTrackerMonth,
		journalEntryCount: journal.entryCount,
		now,
	});

	const completeProjectInit = React.useCallback(
		async (input: ProjectInitSubmitInput) => {
			await project.completeProjectInit(input);
			if (postInitCdCommand && postInitCdCommand !== 'cd .') {
				setPostInitPrompt({
					command: postInitCdCommand,
					userName: input.name,
				});
				return;
			}

			setActiveScreen('home');
		},
		[postInitCdCommand, project],
	);

	const writeWithMood = React.useCallback(
		(selectedMood: JournalMood) => {
			setInvalidMoodInput(undefined);
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
		clearInvalidMoodInput() {
			setInvalidMoodInput(undefined);
		},
		find,
		isMoodSelectInputActive: Boolean(invalidMoodInput),
		moodCheckInSelectedIndex,
		moodTracker,
		onExit: exit,
		openSelectedCalendarEntry() {
			void openSelectedCalendarEntry();
		},
		setActiveScreen,
		setMoodCheckInSelectedIndex,
		writeWithMood,
	});

	if (activeScreen === 'mood-check-in' && invalidMoodInput) {
		return (
			<MoodCommandSelect
				invalidMood={invalidMoodInput}
				onSelectMood={writeWithMood}
			/>
		);
	}

	if (postInitPrompt) {
		return (
			<PostInitPrompt
				cdCommand={postInitPrompt.command}
				userName={postInitPrompt.userName}
				onExit={exit}
			/>
		);
	}

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
