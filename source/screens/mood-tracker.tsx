import React from 'react';
import {Box, Text} from 'ink';
import {colors} from '../theme/colors.js';
import type {JournalMood} from '../utils/journal-frontmatter.js';
import {buildMonthGrid, weekLabels} from '../utils/month-grid.js';
import {
	getMoodMonthQuerySuggestion,
	getShortMoodMonthLabel,
} from '../utils/mood-month-query.js';

const moodColors: Record<JournalMood, string> = {
	angry: '#5C1212',
	calm: '#A8D66D',
	happy: colors.successAccent,
	neutral: colors.textPrimary,
	sad: colors.farewellProgressElapsed,
};

type Props = {
	readonly month: number;
	readonly monthQuery: string;
	readonly moodsByDay: ReadonlyMap<number, JournalMood>;
	readonly year: number;
};

const padDay = (day: number) => String(day).padStart(2, '0');
const moodCellWidth = 5;
const monthInputPlaceholder = '(e.g, jul 2026)';
const monthInputWidth = 18;

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
	year,
}: Props) {
	const [cursorVisible, setCursorVisible] = React.useState(true);
	const {rows} = buildMonthGrid({month, year});
	const monthLabel = getShortMoodMonthLabel(month);
	const monthInputSuggestion = getMoodMonthQuerySuggestion(monthQuery, {
		defaultMonth: month,
		defaultYear: year,
	});

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
					Mood graph | {monthLabel} {year}
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
				<Box marginBottom={1}>
					{weekLabels.map(label => (
						<Box key={label} width={moodCellWidth}>
							<Text color={colors.textHint}>{label}</Text>
						</Box>
					))}
				</Box>

				{rows.map((row, rowIndex) => (
					<Box key={`mood-week-${String(rowIndex)}`}>
						{row.map((day, dayIndex) => {
							if (!day) {
								return (
									<Box
										key={`empty-${String(rowIndex)}-${String(dayIndex)}`}
										width={moodCellWidth}
									>
										<Text> </Text>
									</Box>
								);
							}

							const mood = moodsByDay.get(day);
							return (
								<Box key={`day-${String(day)}`} width={moodCellWidth}>
									<Text
										backgroundColor={mood ? moodColors[mood] : undefined}
										color={mood ? colors.homeActionText : colors.textHint}
									>
										{` ${padDay(day)} `}
									</Text>
								</Box>
							);
						})}
					</Box>
				))}
			</Box>

			<Box marginTop={1}>
				<Text color={colors.textHint}>
					Type month year, Tab to autocomplete, Enter to jump; use ← → to
					navigate; ESC to return
				</Text>
			</Box>
		</Box>
	);
}
