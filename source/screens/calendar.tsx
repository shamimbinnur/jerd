import {Box, Text} from 'ink';
import React from 'react';
import {colors} from '../theme/colors.js';

const weekLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;
const monthLabels = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
] as const;

type Props = {
	readonly entryDays: ReadonlySet<number>;
	readonly isOpening?: boolean;
	readonly now?: Date;
	readonly selectedDay: number;
	readonly status?: string;
};

const padDay = (day: number) => String(day).padStart(2, ' ');

export default function Calendar({
	entryDays,
	isOpening = false,
	now = new Date(),
	selectedDay,
	status,
}: Props) {
	const year = now.getFullYear();
	const monthIndex = now.getMonth();
	const monthLabel = monthLabels[monthIndex] ?? 'January';
	const firstDayOffset = new Date(year, monthIndex, 1).getDay();
	const totalDays = new Date(year, monthIndex + 1, 0).getDate();
	const cells: Array<number | undefined> = [
		...Array.from({length: firstDayOffset}, () => undefined),
		...Array.from({length: totalDays}, (_, index) => index + 1),
	];
	const rows: Array<Array<number | undefined>> = [];
	for (let index = 0; index < cells.length; index += 7) {
		rows.push(cells.slice(index, index + 7));
	}

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
						<Box key={label} width={4}>
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
										width={4}
									>
										<Text> </Text>
									</Box>
								);
							}

							const hasEntry = entryDays.has(day);
							const isSelected = day === selectedDay;
							return (
								<Box key={`day-${String(day)}`} width={4}>
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
				<Text color={colors.textHint}>Use ← ↑ ↓ → to navigate</Text>
			</Box>
		</Box>
	);
}
