import Calendar from '../screens/calendar.js';
import Find from '../screens/find.js';
import Home from '../screens/home.js';
import Init from '../screens/init.js';
import MoodCheckIn from '../screens/mood-check-in.js';
import MoodTracker from '../screens/mood-tracker.js';
import ProjectInit from '../screens/project-init.js';
import type {ProjectInitSubmitInput} from '../hooks/use-project-init-form.js';
import type {useCalendarEntries} from '../hooks/use-calendar-entries.js';
import type {useFindEntries} from '../hooks/use-find-entries.js';
import type {useJournalEditor} from '../hooks/use-journal-editor.js';
import type {useMoodTracker} from '../hooks/use-mood-tracker.js';
import type {useProjectSettings} from '../hooks/use-project-settings.js';
import type {Screen} from './types.js';

type CalendarEntries = ReturnType<typeof useCalendarEntries>;
type FindEntries = ReturnType<typeof useFindEntries>;
type JournalEditor = ReturnType<typeof useJournalEditor>;
type MoodTrackerState = ReturnType<typeof useMoodTracker>;
type ProjectSettings = ReturnType<typeof useProjectSettings>;

type Props = {
	readonly activeScreen: Screen;
	readonly calendar: CalendarEntries;
	readonly completeProjectInit: (
		input: ProjectInitSubmitInput,
	) => Promise<void>;
	readonly find: FindEntries;
	readonly journal: JournalEditor;
	readonly moodCheckInSelectedIndex: number;
	readonly moodTracker: MoodTrackerState;
	readonly now?: Date;
	readonly openSelectedFindEntry: () => void;
	readonly postInitCdCommand?: string;
	readonly project: ProjectSettings;
};

export default function AppScreen({
	activeScreen,
	calendar,
	completeProjectInit,
	find,
	journal,
	moodCheckInSelectedIndex,
	moodTracker,
	now,
	openSelectedFindEntry,
	postInitCdCommand,
	project,
}: Props) {
	if (activeScreen === 'home') {
		return (
			<Home
				journalEntryCount={journal.entryCount}
				journalStatus={journal.status}
				now={now}
				userName={project.userName}
			/>
		);
	}

	if (activeScreen === 'new-entry') {
		return (
			<Home
				journalEntryCount={journal.entryCount}
				journalStatus="Opening editor..."
				now={now}
				userName={project.userName}
			/>
		);
	}

	if (activeScreen === 'find') {
		return (
			<Find
				isOpening={find.isOpening}
				now={now}
				query={find.query}
				results={find.results}
				selectedIndex={find.selectedIndex}
				onOpenSelected={openSelectedFindEntry}
				onQueryChange={find.updateQuery}
			/>
		);
	}

	if (activeScreen === 'calendar') {
		return (
			<Calendar
				entryDays={calendar.entryDays}
				isOpening={calendar.isOpening}
				now={now}
				selectedDay={calendar.selectedDay}
				status={calendar.status}
			/>
		);
	}

	if (activeScreen === 'mood-check-in') {
		return <MoodCheckIn selectedIndex={moodCheckInSelectedIndex} />;
	}

	if (activeScreen === 'mood-tracker') {
		return (
			<MoodTracker
				month={moodTracker.month.getMonth() + 1}
				monthQuery={moodTracker.monthQuery}
				moodsByDay={moodTracker.moodsByDay}
				view={moodTracker.view}
				year={moodTracker.month.getFullYear()}
			/>
		);
	}

	if (activeScreen === 'project-init') {
		return (
			<ProjectInit
				nextStepCommand={postInitCdCommand}
				onSubmitProject={completeProjectInit}
			/>
		);
	}

	return (
		<Init
			nextStepCommand={postInitCdCommand}
			onComplete={completeProjectInit}
		/>
	);
}
