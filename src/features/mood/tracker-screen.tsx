import React from 'react';
import {Box, Text} from 'ink';
import type {JournalMood} from '../../core/journal/frontmatter.js';
import {buildMonthGrid, weekLabels} from '../../core/journal/month-grid.js';
import {colors} from '../../shared/theme/colors.js';
import Header from '../../shared/ui/header.js';
import {
	getMoodMonthQuerySuggestion,
	getShortMoodMonthLabel,
} from './month-query.js';
import {moodOptions} from './options.js';
import {
	buildMoodTrendRows,
	buildTrendDateLabels,
	frequencyBarWidth,
	getFrequencyBarWidth,
	getMoodFrequencies,
	trendMoods,
} from './tracker-model.js';
import type {MoodTrackerView} from './use-mood-tracker.js';

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
const moodCellWidth = 5;
const monthInputPlaceholder = 'e.g. jul 2026';
const trendLabelWidth = 8;

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
		<Text inverse color={colors.typoSecondary}>
			{' '}
		</Text>
	) : (
		<Text color={colors.typoSecondary}> </Text>
	);

	if (value.length === 0) {
		return (
			<Text>
				{cursor}
				<Text color={colors.typoMuted}>{monthInputPlaceholder}</Text>
			</Text>
		);
	}

	return (
		<Text>
			<Text color={colors.typoPrimary}>{value}</Text>
			<Text color={colors.typoMuted}>{suggestion}</Text>
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
	const daysInMonth = new Date(year, month, 0).getDate();
	const trendRows = buildMoodTrendRows(moodsByDay, daysInMonth);
	const viewLabel =
		view === 'heatgraph'
			? 'Heatgraph'
			: view === 'frequency'
				? 'Frequency'
				: 'Trend';
	const viewPosition = view === 'heatgraph' ? 1 : view === 'frequency' ? 2 : 3;
	const checkInLabel = `${String(moodsByDay.size)} ${
		moodsByDay.size === 1 ? 'check-in' : 'check-ins'
	}`;

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
			<Header heading="Mood tracker" />

			<Box justifyContent="space-between" marginBottom={1} marginTop={1}>
				<Text bold color={colors.typoPrimary}>
					{monthLabel} {year}
				</Text>
				<Text color={colors.typoTertiary}>{checkInLabel}</Text>
			</Box>

			<Box
				borderColor={colors.borderPrimary}
				borderStyle="round"
				paddingX={1}
			>
				<Text color={colors.typoTertiary}>Jump: </Text>
				{renderMonthInput(monthQuery, cursorVisible, monthInputSuggestion)}
			</Box>

			<Box justifyContent="space-between" marginBottom={1} marginTop={1}>
				<Text color={colors.typoSecondary}>{viewLabel}</Text>
				<Text color={colors.typoTertiary}>{viewPosition} of 3</Text>
			</Box>

			<Box
				borderColor={colors.borderPrimary}
				borderStyle="round"
				flexDirection="column"
				paddingX={1}
				paddingY={1}
			>
				{view === 'heatgraph' ? (
					<>
						<Box marginBottom={1}>
							{weekLabels.map(label => (
								<Box
									key={label}
									flexShrink={0}
									justifyContent="center"
									width={moodCellWidth}
								>
									<Text color={colors.typoSecondary}>{label}</Text>
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
												justifyContent="center"
												width={moodCellWidth}
											>
												<Text color={colors.typoPrimary}> </Text>
											</Box>
										);
									}

									const mood = moodsByDay.get(day);
									const moodCell = mood ? moodDisplay[mood] : undefined;
									return (
										<Box
											key={`day-${String(day)}`}
											flexShrink={0}
											justifyContent="center"
											width={moodCellWidth}
										>
											<Text
												backgroundColor={moodCell?.color}
												color={colors.typoPrimary}
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
				) : view === 'frequency' ? (
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
								<Text color={colors.typoPrimary}>{count}</Text>
							</Box>
						);
					})
				) : (
					<>
						{trendMoods.map((option, level) => (
							<Box key={option.mood}>
								<Box width={trendLabelWidth}>
									<Text color={moodDisplay[option.mood].color}>
										{option.label}
									</Text>
								</Box>
								<Text color={moodDisplay[option.mood].color}>
									{trendRows[level]}
								</Text>
							</Box>
						))}
						<Box>
							<Box width={trendLabelWidth} />
							<Text color={colors.typoPrimary}>{'·'.repeat(daysInMonth)}</Text>
						</Box>
						<Box>
							<Box width={trendLabelWidth} />
							<Text color={colors.typoPrimary}>
								{buildTrendDateLabels(daysInMonth)}
							</Text>
						</Box>
					</>
				)}
			</Box>

			<Box flexGrow={1} />

			<Box flexDirection="column">
				<Text color={colors.typoTertiary}>
					Type month/year · Tab complete · Enter jump
				</Text>
				<Text color={colors.typoTertiary}>
					←/→ month · ↑/↓ chart · Esc back
				</Text>
			</Box>
		</Box>
	);
}
