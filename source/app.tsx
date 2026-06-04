import {join} from 'node:path';
import process from 'node:process';
import React from 'react';
import {useInput} from 'ink';
import MainFrame from './components/main-frame.js';
import Calendar from './screens/calendar.js';
import Dashboard from './screens/dashboard.js';
import Farewell from './screens/farewell.js';
import Find from './screens/find.js';
import Home from './screens/home.js';
import Init from './screens/init.js';
import Loading from './screens/loading.js';
import MoodCheckIn, {moodOptions} from './screens/mood-check-in.js';
import MoodTracker from './screens/mood-tracker.js';
import ProjectInit from './screens/project-init.js';
import Success from './screens/success.js';
import {
	countJournalEntries,
	getJournalEntryPathMapForMonth,
	getJournalMoodMapForMonth,
	type JournalMood,
	loadJournalEntry,
	openEntryByPath,
	openJournalInEditor,
	saveJournalEntry,
} from './utils/journal.js';
import {loadProjectConfig, writeProjectConfig} from './utils/project-config.js';
import {searchEntries, type SearchResult} from './utils/search.js';

type Screen =
	| 'calendar'
	| 'confirmation'
	| 'dashboard'
	| 'farewell'
	| 'find'
	| 'home'
	| 'init'
	| 'loading'
	| 'mood-check-in'
	| 'mood-tracker'
	| 'new-entry'
	| 'project-init'
	| 'success';

type Props = {
	readonly configDirectory?: string;
	readonly now?: Date;
	readonly screen: Screen;
};

export default function App({
	configDirectory = process.cwd(),
	now,
	screen,
}: Props) {
	const [activeScreen, setActiveScreen] = React.useState<Screen>(screen);
	const [journalEntryCount, setJournalEntryCount] = React.useState(0);
	const [journalStatus, setJournalStatus] = React.useState<string>();
	const [calendarStatus, setCalendarStatus] = React.useState<string>();
	const [calendarEntryDays, setCalendarEntryDays] = React.useState<Set<number>>(
		new Set<number>(),
	);
	const [calendarEntryPaths, setCalendarEntryPaths] = React.useState<
		Map<number, string>
	>(new Map<number, string>());
	const [calendarSelectedDay, setCalendarSelectedDay] = React.useState(
		(now ?? new Date()).getDate(),
	);
	const [isOpeningCalendarEntry, setIsOpeningCalendarEntry] =
		React.useState(false);
	const [findQuery, setFindQuery] = React.useState('');
	const [findResults, setFindResults] = React.useState<SearchResult[]>([]);
	const [findSelectedIndex, setFindSelectedIndex] = React.useState(0);
	const [isOpeningFindEntry, setIsOpeningFindEntry] = React.useState(false);
	const [mood, setMood] = React.useState<JournalMood>('neutral');
	const [moodCheckInSelectedIndex, setMoodCheckInSelectedIndex] =
		React.useState(0);
	const [moodTrackerMonth, setMoodTrackerMonth] = React.useState(() => {
		const activeNow = now ?? new Date();
		return new Date(activeNow.getFullYear(), activeNow.getMonth(), 1);
	});
	const [moodsByDay, setMoodsByDay] = React.useState<Map<number, JournalMood>>(
		new Map<number, JournalMood>(),
	);
	const [editor, setEditor] = React.useState<string>();
	const [isProjectConfigLoaded, setIsProjectConfigLoaded] =
		React.useState(false);
	const [userName, setUserName] = React.useState('Shamim');
	const isOpeningEditor = React.useRef(false);
	const statusClearTimeout = React.useRef<NodeJS.Timeout | undefined>(
		undefined,
	);

	React.useEffect(
		() => () => {
			if (statusClearTimeout.current) {
				clearTimeout(statusClearTimeout.current);
			}
		},
		[],
	);

	React.useEffect(() => {
		let isMounted = true;

		void loadProjectConfig(configDirectory)
			.then(config => {
				if (!isMounted) {
					return;
				}

				if (typeof config.name === 'string') {
					setUserName(config.name);
				}

				if (typeof config.editor === 'string') {
					setEditor(config.editor);
				}

				setIsProjectConfigLoaded(true);
			})
			.catch(() => {
				if (isMounted) {
					setIsProjectConfigLoaded(true);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [configDirectory]);

	React.useEffect(() => {
		if (activeScreen !== 'mood-tracker') {
			return;
		}

		let isMounted = true;
		void getJournalMoodMapForMonth({
			month: moodTrackerMonth.getMonth() + 1,
			rootDirectory: configDirectory,
			year: moodTrackerMonth.getFullYear(),
		})
			.then(moods => {
				if (isMounted) {
					setMoodsByDay(moods);
				}
			})
			.catch(() => {
				if (isMounted) {
					setMoodsByDay(new Map<number, JournalMood>());
				}
			});

		return () => {
			isMounted = false;
		};
	}, [activeScreen, configDirectory, journalEntryCount, moodTrackerMonth]);

	React.useEffect(() => {
		let isMounted = true;
		const activeNow = now ?? new Date();

		void getJournalEntryPathMapForMonth({
			month: activeNow.getMonth() + 1,
			rootDirectory: configDirectory,
			year: activeNow.getFullYear(),
		})
			.then(paths => {
				if (isMounted) {
					setCalendarEntryPaths(paths);
					setCalendarEntryDays(new Set<number>(paths.keys()));
				}
			})
			.catch(() => {
				if (isMounted) {
					setCalendarEntryPaths(new Map<number, string>());
					setCalendarEntryDays(new Set<number>());
				}
			});

		return () => {
			isMounted = false;
		};
	}, [configDirectory, journalEntryCount, now]);

	React.useEffect(() => {
		let isMounted = true;

		void countJournalEntries({rootDirectory: configDirectory})
			.then(total => {
				if (isMounted) {
					setJournalEntryCount(total);
				}
			})
			.catch(() => undefined);

		return () => {
			isMounted = false;
		};
	}, [configDirectory]);

	const completeProjectInit = React.useCallback(
		async (name: string) => {
			const config = await writeProjectConfig({
				directory: configDirectory,
				name,
			});
			setUserName(typeof config.name === 'string' ? config.name : name);
			setActiveScreen('home');
		},
		[configDirectory],
	);

	const writeJournalFromEditor = React.useCallback(
		async (selectedMood: JournalMood) => {
			if (isOpeningEditor.current) {
				return;
			}

			isOpeningEditor.current = true;
			if (statusClearTimeout.current) {
				clearTimeout(statusClearTimeout.current);
				statusClearTimeout.current = undefined;
			}

			setJournalStatus(undefined);
			const {stdin} = process;
			const canToggleRawMode =
				typeof stdin.setRawMode === 'function' && stdin.isTTY;

			try {
				if (canToggleRawMode) {
					stdin.setRawMode(false);
				}

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
				const total = await countJournalEntries({
					rootDirectory: configDirectory,
				});
				setJournalEntryCount(total);
				setJournalStatus('Journal Saved!');
				setActiveScreen('home');
				statusClearTimeout.current = setTimeout(() => {
					setJournalStatus(undefined);
					statusClearTimeout.current = undefined;
				}, 1000);
			} catch (error: unknown) {
				setJournalStatus(
					error instanceof Error
						? `Save failed: ${error.message}`
						: 'Save failed',
				);
				setActiveScreen('home');
			} finally {
				if (canToggleRawMode) {
					stdin.setRawMode(true);
				}

				isOpeningEditor.current = false;
			}
		},
		[configDirectory, editor, now],
	);

	const writeWithMood = React.useCallback(
		(selectedMood: JournalMood) => {
			setMood(selectedMood);
			void writeJournalFromEditor(selectedMood);
		},
		[writeJournalFromEditor],
	);

	React.useEffect(() => {
		if (activeScreen !== 'new-entry' || !isProjectConfigLoaded) {
			return;
		}

		void writeJournalFromEditor(mood);
	}, [activeScreen, isProjectConfigLoaded, mood, writeJournalFromEditor]);

	const openSelectedFindEntry = React.useCallback(async () => {
		const selected = findResults[findSelectedIndex];
		if (!selected || isOpeningFindEntry) {
			return;
		}

		setIsOpeningFindEntry(true);
		const {stdin} = process;
		const canToggleRawMode =
			typeof stdin.setRawMode === 'function' && stdin.isTTY;

		try {
			if (canToggleRawMode) {
				stdin.setRawMode(false);
			}

			const absolutePath = join(configDirectory, selected.path);
			await openEntryByPath({editor, mood, path: absolutePath});
			const total = await countJournalEntries({rootDirectory: configDirectory});
			setJournalEntryCount(total);
			setJournalStatus('Journal Saved!');
			if (statusClearTimeout.current) {
				clearTimeout(statusClearTimeout.current);
			}

			statusClearTimeout.current = setTimeout(() => {
				setJournalStatus(undefined);
				statusClearTimeout.current = undefined;
			}, 1000);
			setActiveScreen('home');
		} catch (error: unknown) {
			setJournalStatus(
				error instanceof Error
					? `Save failed: ${error.message}`
					: 'Save failed',
			);
			setActiveScreen('home');
		} finally {
			if (canToggleRawMode) {
				stdin.setRawMode(true);
			}

			setIsOpeningFindEntry(false);
		}
	}, [
		configDirectory,
		editor,
		findResults,
		findSelectedIndex,
		isOpeningFindEntry,
		mood,
	]);

	const openSelectedCalendarEntry = React.useCallback(async () => {
		const relativePath = calendarEntryPaths.get(calendarSelectedDay);
		if (!relativePath || isOpeningCalendarEntry) {
			setCalendarStatus('No journal entry found for selected date.');
			return;
		}

		setIsOpeningCalendarEntry(true);
		const {stdin} = process;
		const canToggleRawMode =
			typeof stdin.setRawMode === 'function' && stdin.isTTY;

		try {
			if (canToggleRawMode) {
				stdin.setRawMode(false);
			}

			const absolutePath = join(configDirectory, relativePath);
			await openEntryByPath({editor, mood, path: absolutePath});
			const total = await countJournalEntries({rootDirectory: configDirectory});
			setJournalEntryCount(total);
			setCalendarStatus('Journal Saved!');
		} catch (error: unknown) {
			setCalendarStatus(
				error instanceof Error
					? `Save failed: ${error.message}`
					: 'Save failed',
			);
		} finally {
			if (canToggleRawMode) {
				stdin.setRawMode(true);
			}

			setIsOpeningCalendarEntry(false);
		}
	}, [
		calendarEntryPaths,
		calendarSelectedDay,
		configDirectory,
		editor,
		isOpeningCalendarEntry,
		mood,
	]);

	React.useEffect(() => {
		if (activeScreen !== 'find') {
			return;
		}

		let isMounted = true;
		void searchEntries({
			now,
			query: findQuery,
			rootDirectory: configDirectory,
		})
			.then(results => {
				if (!isMounted) {
					return;
				}

				setFindResults(results);
				setFindSelectedIndex(currentIndex => {
					if (results.length === 0) {
						return 0;
					}

					return Math.min(currentIndex, results.length - 1);
				});
			})
			.catch(() => {
				if (isMounted) {
					setFindResults([]);
					setFindSelectedIndex(0);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [activeScreen, configDirectory, findQuery, now]);

	// eslint-disable-next-line complexity
	useInput((input, key) => {
		if (activeScreen === 'init' || activeScreen === 'project-init') {
			return;
		}

		const normalizedInput = input?.toLowerCase() ?? '';
		if (activeScreen === 'mood-check-in') {
			const keyedMood = moodOptions.find(
				option => option.symbol.toLowerCase() === normalizedInput,
			)?.mood;
			if (keyedMood) {
				writeWithMood(keyedMood);
				return;
			}

			if (key.escape) {
				setActiveScreen('home');
				return;
			}

			if (key.upArrow || key.leftArrow) {
				setMoodCheckInSelectedIndex(currentIndex =>
					Math.max(currentIndex - 1, 0),
				);
				return;
			}

			if (key.downArrow || key.rightArrow) {
				setMoodCheckInSelectedIndex(currentIndex =>
					Math.min(currentIndex + 1, moodOptions.length - 1),
				);
				return;
			}

			if (key.return || normalizedInput === '\r' || normalizedInput === '\n') {
				const selectedMood =
					moodOptions[moodCheckInSelectedIndex]?.mood ?? 'neutral';
				writeWithMood(selectedMood);
				return;
			}
		}

		if (activeScreen === 'mood-tracker') {
			if (key.escape) {
				setActiveScreen('home');
				return;
			}

			if (key.leftArrow) {
				setMoodTrackerMonth(
					currentMonth =>
						new Date(
							currentMonth.getFullYear(),
							currentMonth.getMonth() - 1,
							1,
						),
				);
				return;
			}

			if (key.rightArrow) {
				setMoodTrackerMonth(
					currentMonth =>
						new Date(
							currentMonth.getFullYear(),
							currentMonth.getMonth() + 1,
							1,
						),
				);
				return;
			}
		}

		if (activeScreen === 'find') {
			if (key.escape) {
				setActiveScreen('home');
				return;
			}

			if (key.upArrow) {
				setFindSelectedIndex(currentIndex => Math.max(currentIndex - 1, 0));
				return;
			}

			if (key.downArrow) {
				setFindSelectedIndex(currentIndex =>
					Math.min(currentIndex + 1, Math.max(findResults.length - 1, 0)),
				);
				return;
			}
		}

		if (activeScreen === 'calendar' && key.escape) {
			setActiveScreen('home');
			return;
		}

		if (activeScreen === 'calendar') {
			const activeNow = now ?? new Date();
			const daysInMonth = new Date(
				activeNow.getFullYear(),
				activeNow.getMonth() + 1,
				0,
			).getDate();

			if (key.leftArrow) {
				setCalendarSelectedDay(current => Math.max(1, current - 1));
				return;
			}

			if (key.rightArrow) {
				setCalendarSelectedDay(current => Math.min(daysInMonth, current + 1));
				return;
			}

			if (key.upArrow) {
				setCalendarSelectedDay(current => Math.max(1, current - 7));
				return;
			}

			if (key.downArrow) {
				setCalendarSelectedDay(current => Math.min(daysInMonth, current + 7));
				return;
			}

			if (key.return) {
				void openSelectedCalendarEntry();
				return;
			}
		}

		if (activeScreen === 'home' && normalizedInput === 'f') {
			setFindQuery('');
			setFindSelectedIndex(0);
			setActiveScreen('find');
			return;
		}

		if (activeScreen === 'home' && normalizedInput === 'c') {
			const activeNow = now ?? new Date();
			const daysInMonth = new Date(
				activeNow.getFullYear(),
				activeNow.getMonth() + 1,
				0,
			).getDate();
			setCalendarSelectedDay(
				Math.min(Math.max(activeNow.getDate(), 1), daysInMonth),
			);
			setCalendarStatus(undefined);
			setActiveScreen('calendar');
			return;
		}

		if (activeScreen === 'home' && normalizedInput === 'w') {
			setMoodCheckInSelectedIndex(0);
			setActiveScreen('mood-check-in');
			return;
		}

		if (activeScreen === 'home' && normalizedInput === 'm') {
			const activeNow = now ?? new Date();
			setMoodTrackerMonth(
				new Date(activeNow.getFullYear(), activeNow.getMonth(), 1),
			);
			setMoodsByDay(new Map<number, JournalMood>());
			setActiveScreen('mood-tracker');
		}
	});

	const activeScreenContent = (() => {
		if (activeScreen === 'home') {
			return (
				<Home
					journalEntryCount={journalEntryCount}
					journalStatus={journalStatus}
					now={now}
					userName={userName}
				/>
			);
		}

		if (activeScreen === 'new-entry') {
			return (
				<Home
					journalEntryCount={journalEntryCount}
					journalStatus="Opening editor..."
					now={now}
					userName={userName}
				/>
			);
		}

		if (activeScreen === 'find') {
			return (
				<Find
					isOpening={isOpeningFindEntry}
					query={findQuery}
					results={findResults}
					selectedIndex={findSelectedIndex}
					onOpenSelected={() => {
						void openSelectedFindEntry();
					}}
					onQueryChange={query => {
						setFindQuery(query);
						setFindSelectedIndex(0);
					}}
				/>
			);
		}

		if (activeScreen === 'calendar') {
			return (
				<Calendar
					entryDays={calendarEntryDays}
					isOpening={isOpeningCalendarEntry}
					now={now}
					selectedDay={calendarSelectedDay}
					status={calendarStatus}
				/>
			);
		}

		if (activeScreen === 'mood-check-in') {
			return <MoodCheckIn selectedIndex={moodCheckInSelectedIndex} />;
		}

		if (activeScreen === 'mood-tracker') {
			return (
				<MoodTracker
					month={moodTrackerMonth.getMonth() + 1}
					moodsByDay={moodsByDay}
					year={moodTrackerMonth.getFullYear()}
				/>
			);
		}

		if (activeScreen === 'farewell') {
			return (
				<Farewell isComplete={false} progressRatio={1} secondsRemaining={1} />
			);
		}

		if (activeScreen === 'loading') {
			return <Loading frame="." />;
		}

		if (activeScreen === 'success') {
			return <Success />;
		}

		if (activeScreen === 'dashboard') {
			return <Dashboard />;
		}

		if (activeScreen === 'project-init') {
			return <ProjectInit onSubmitName={completeProjectInit} />;
		}

		return <Init onComplete={completeProjectInit} />;
	})();

	return <MainFrame>{activeScreenContent}</MainFrame>;
}
