import {Box, Text} from 'ink';
import {colors} from '../theme/colors.js';
import type {JournalMood} from '../utils/journal-frontmatter.js';
import {buildMonthGrid, weekLabels} from '../utils/month-grid.js';

const moodColors: Record<JournalMood, string> = {
	angry: '#5C1212',
	calm: '#A8D66D',
	happy: colors.successAccent,
	neutral: colors.textPrimary,
	sad: colors.farewellProgressElapsed,
};

type Props = {
	readonly month: number;
	readonly moodsByDay: ReadonlyMap<number, JournalMood>;
	readonly year: number;
};

const padDay = (day: number) => String(day).padStart(2, '0');

export default function MoodTracker({month, moodsByDay, year}: Props) {
	const {label: monthLabel, rows} = buildMonthGrid({month, year});

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box marginBottom={1}>
				<Text bold color={colors.brand}>
					$jerd
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text color={colors.textPrimary}>
					Mood graph | {monthLabel} {year}
				</Text>
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
						<Box key={label} width={4}>
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
										width={4}
									>
										<Text> </Text>
									</Box>
								);
							}

							const mood = moodsByDay.get(day);
							return (
								<Box key={`day-${String(day)}`} width={4}>
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
				<Text color={colors.textHint}>Use ← → to navigate months</Text>
			</Box>
		</Box>
	);
}
