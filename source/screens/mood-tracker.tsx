import React from 'react';
import {Box, Text} from 'ink';
import {moodOptions} from '../components/mood-check-in/mood-options.js';
import type {MoodTrackerView} from '../hooks/use-mood-tracker.js';
import {colors} from '../theme/colors.js';
import type {JournalMood} from '../utils/journal-frontmatter.js';
import {buildMonthGrid, weekLabels} from '../utils/month-grid.js';
import {
	getMoodMonthQuerySuggestion,
	getShortMoodMonthLabel,
} from '../utils/mood-month-query.js';

const moodDisplay: Record<
	JournalMood,
	{
		readonly color: string;
		readonly symbol: string;
	}
> = {
	angry: {color: colors.moodAngry, symbol: 'A'},
	anxious: {color: colors.moodAnxious, symbol: 'X'},
	calm: {color: colors.moodCalm, symbol: 'C'},
	happy: {color: colors.moodHappy, symbol: 'H'},
	sad: {color: colors.moodSad, symbol: 'S'},
};

type Props = {
	readonly month: number;
	readonly monthQuery: string;
	readonly moodsByDay: ReadonlyMap<number, JournalMood>;
	readonly view: MoodTrackerView;
	readonly year: number;
};

const padDay = (day: number) => String(day).padStart(2, '0');
const moodCellWidth = 6;
const monthInputPlaceholder = '(e.g, jul 2026)';
const monthInputWidth = 18;
const frequencyBarWidth = 24;

export const getMoodFrequencies = (
	moodsByDay: ReadonlyMap<number, JournalMood>,
) => {
	const counts = new Map<JournalMood, number>(
		moodOptions.map(option => [option.mood, 0]),
	);
	for (const mood of moodsByDay.values()) {
		counts.set(mood, (counts.get(mood) ?? 0) + 1);
	}

	return counts;
};

export const getFrequencyBarWidth = (count: number, maximum: number) =>
	count === 0 || maximum === 0
		? 0
		: Math.max(1, Math.round((count / maximum) * frequencyBarWidth));

const formatMoodDay = (day: number, symbol: string) =>
	`${padDay(day)}-${symbol}`;

const formatPlainDay = (day: number) => padDay(day);

const normalizeWeekRow = (row: ReadonlyArray<number | undefined>) => [
	...row,
	...Array.from({length: 7 - row.length}, () => undefined),
];

const renderMonthInput = (
	value: string,
	cursorVisible: boolean,
	suggestion: string,
) => {
	const cursor = cursorVisible ? (
		<Text inverse color={colors.brand}>
			{' '}
		</Text>
	) : (
		<Text color={colors.brand}> </Text>
	);

	if (value.length === 0) {
		return (
			<Text>
				{cursor}
				<Text color={colors.textHint}>{monthInputPlaceholder}</Text>
			</Text>
		);
	}

	return (
		<Text>
			<Text color={colors.brand}>{value}</Text>
			<Text color={colors.textHint}>{suggestion}</Text>
			{cursor}
		</Text>
	);
};

export default function MoodTracker({
	month,
	monthQuery,
	moodsByDay,
	view,
	year,
}: Props) {
	const [cursorVisible, setCursorVisible] = React.useState(true);
	const {rows} = buildMonthGrid({month, year});
	const monthLabel = getShortMoodMonthLabel(month);
	const monthInputSuggestion = getMoodMonthQuerySuggestion(monthQuery, {
		defaultMonth: month,
		defaultYear: year,
	});
	const moodFrequencies = getMoodFrequencies(moodsByDay);
	const maximumFrequency = Math.max(...moodFrequencies.values());

	React.useEffect(() => {
		const interval = setInterval(() => {
			setCursorVisible(currentCursorVisible => !currentCursorVisible);
		}, 500);

		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box marginBottom={1}>
				<Text bold color={colors.brand}>
					$jerd
				</Text>
			</Box>

			<Box justifyContent="space-between" marginBottom={1} width="100%">
				<Text color={colors.textPrimary}>
					Mood {view === 'heatgraph' ? 'heatgraph' : 'frequency'} | {monthLabel}{' '}
					{year}
				</Text>
				<Box>
					<Text color={colors.panelBorder}>│</Text>
					<Box marginLeft={1} width={monthInputWidth}>
						{renderMonthInput(monthQuery, cursorVisible, monthInputSuggestion)}
					</Box>
				</Box>
			</Box>

			<Box
				borderColor={colors.panelBorder}
				borderStyle="round"
				flexDirection="column"
				paddingX={1}
				paddingY={1}
			>
				{view === 'heatgraph' ? (
					<>
						<Box marginBottom={1}>
							{weekLabels.map(label => (
								<Box key={label} flexShrink={0} width={moodCellWidth}>
									<Text color={colors.textHint}>{label}</Text>
								</Box>
							))}
						</Box>

						{rows.map((row, rowIndex) => (
							<Box key={`mood-week-${String(rowIndex)}`}>
								{normalizeWeekRow(row).map((day, dayIndex) => {
									if (!day) {
										return (
											<Box
												key={`empty-${String(rowIndex)}-${String(dayIndex)}`}
												flexShrink={0}
												width={moodCellWidth}
											>
												<Text> </Text>
											</Box>
										);
									}

									const mood = moodsByDay.get(day);
									const moodCell = mood ? moodDisplay[mood] : undefined;
									return (
										<Box
											key={`day-${String(day)}`}
											flexShrink={0}
											width={moodCellWidth}
										>
											<Text
												backgroundColor={moodCell?.color}
												color={
													moodCell ? colors.homeActionText : colors.textHint
												}
											>
												{moodCell
													? formatMoodDay(day, moodCell.symbol)
													: formatPlainDay(day)}
											</Text>
										</Box>
									);
								})}
							</Box>
						))}
					</>
				) : (
					moodOptions.map((option, optionIndex) => {
						const count = moodFrequencies.get(option.mood) ?? 0;
						const barWidth = getFrequencyBarWidth(count, maximumFrequency);

						return (
							<Box
								key={option.mood}
								marginBottom={optionIndex < moodOptions.length - 1 ? 1 : 0}
							>
								<Box width={10}>
									<Text color={moodDisplay[option.mood].color}>
										{option.label}
									</Text>
								</Box>
								<Box width={frequencyBarWidth + 1}>
									<Text color={moodDisplay[option.mood].color}>
										{'█'.repeat(barWidth)}
									</Text>
								</Box>
								<Text color={colors.textPrimary}>{count}</Text>
							</Box>
						);
					})
				)}
			</Box>

			<Box marginTop={1}>
				<Text color={colors.textHint}>
					Type month year, Tab to autocomplete, Enter to jump; ← → month; ↑ ↓
					chart; ESC to return
				</Text>
			</Box>
		</Box>
	);
}
