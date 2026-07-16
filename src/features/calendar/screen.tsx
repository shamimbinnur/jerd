import {Box, Text} from 'ink';
import {buildMonthGrid, weekLabels} from '../../core/journal/month-grid.js';
import {colors} from '../../shared/theme/colors.js';
import Header from '../../shared/ui/header.js';

type Props = {
	readonly entryDays: ReadonlySet<number>;
	readonly isOpening?: boolean;
	readonly now?: Date;
	readonly selectedDay: number;
	readonly status?: string;
};

const padDay = (day: number) => String(day).padStart(2, ' ');
const calendarCellWidth = 5;

export default function Calendar({
	entryDays,
	isOpening = false,
	now,
	selectedDay,
	status,
}: Props) {
	const currentTime = now ?? new Date();
	const year = currentTime.getFullYear();
	const {label: monthLabel, rows} = buildMonthGrid({
		month: currentTime.getMonth() + 1,
		year,
	});
	const selectedDateLabel = `${monthLabel} ${String(selectedDay)}, ${String(year)}`;
	const selectedDayHasEntry = entryDays.has(selectedDay);
	const entryCountLabel = `${String(entryDays.size)} ${
		entryDays.size === 1 ? 'entry' : 'entries'
	}`;

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Header heading="Calendar" />

			<Box justifyContent="space-between" marginBottom={1} marginTop={1}>
				<Text bold color={colors.typoPrimary}>
					{monthLabel} {year}
				</Text>
				<Text color={colors.typoTertiary}>{entryCountLabel}</Text>
			</Box>

			<Box
				borderColor={colors.borderPrimary}
				borderStyle="round"
				flexDirection="column"
				paddingX={1}
				paddingY={1}
			>
				<Box marginBottom={1}>
					{weekLabels.map(label => (
						<Box
							key={label}
							justifyContent="center"
							width={calendarCellWidth}
						>
							<Text color={colors.typoSecondary}>{label}</Text>
						</Box>
					))}
				</Box>

				{rows.map((row, rowIndex) => (
					<Box key={`week-${String(rowIndex)}`}>
						{row.map((day, dayIndex) => {
							if (!day) {
								return (
									<Box
										key={`empty-${String(rowIndex)}-${String(dayIndex)}`}
										justifyContent="center"
										width={calendarCellWidth}
									>
										<Text> </Text>
									</Box>
								);
							}

							const hasEntry = entryDays.has(day);
							const isSelected = day === selectedDay;
							return (
								<Box
									key={`day-${String(day)}`}
									justifyContent="center"
									width={calendarCellWidth}
								>
									<Text
										bold={isSelected}
										color={
											isSelected
												? colors.primary
												: hasEntry
													? colors.typoPositive
													: colors.typoSecondary
										}
										inverse={isSelected}
									>
										{padDay(day)}
									</Text>
								</Box>
							);
						})}
					</Box>
				))}
			</Box>

			<Box justifyContent="space-between" marginTop={1}>
				<Text color={colors.typoSecondary}>Selected</Text>
				<Text color={colors.typoPrimary}>{selectedDateLabel}</Text>
			</Box>

			<Box marginTop={1}>
				{isOpening ? (
					<Text color={colors.typoPositive}>Opening entry...</Text>
				) : status ? (
					<Text color={colors.typoPositive}>{status}</Text>
				) : (
					<Text
						color={
							selectedDayHasEntry
								? colors.typoPositive
								: colors.typoDisabled
						}
					>
						{selectedDayHasEntry
							? '● Journal entry available'
							: 'No journal entry for this date'}
					</Text>
				)}
			</Box>

			<Box flexGrow={1} />

			<Box>
				<Text color={colors.typoTertiary}>
					←↑↓→ navigate · Enter open · Esc back
				</Text>
			</Box>
		</Box>
	);
}
