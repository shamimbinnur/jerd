import {Box, Text} from 'ink';
import {colors} from '../theme/colors.js';
import {buildMonthGrid, weekLabels} from '../utils/month-grid.js';

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

	return (
		<Box flexDirection="column" flexGrow={1}>
			<Box marginBottom={1}>
				<Text bold color={colors.brand}>
					$jerd
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text color={colors.textPrimary}>
					{monthLabel} {year}
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
						<Box key={label} width={calendarCellWidth}>
							<Text color={colors.textHint}>{label}</Text>
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
										width={calendarCellWidth}
									>
										<Text> </Text>
									</Box>
								);
							}

							const hasEntry = entryDays.has(day);
							const isSelected = day === selectedDay;
							return (
								<Box key={`day-${String(day)}`} width={calendarCellWidth}>
									<Text
										bold={isSelected}
										color={
											hasEntry
												? colors.brand
												: isSelected
													? colors.successAccent
													: colors.textPrimary
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

			<Box marginTop={1}>
				{status ? (
					<Text color={isOpening ? colors.textHint : colors.successAccent}>
						{isOpening ? 'Opening entry...' : status}
					</Text>
				) : null}
			</Box>

			<Box marginTop={status ? 0 : 1}>
				<Text color={colors.textHint}>
					Use ← ↑ ↓ → to navigate; press ESC to return to main menu
				</Text>
			</Box>
		</Box>
	);
}
