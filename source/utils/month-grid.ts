export const weekLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export const monthLabels = [
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

export type MonthGrid = {
	readonly label: string;
	readonly rows: ReadonlyArray<ReadonlyArray<number | undefined>>;
};

export const buildMonthGrid = ({
	month,
	year,
}: {
	readonly month: number;
	readonly year: number;
}): MonthGrid => {
	const monthIndex = month - 1;
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

	return {
		label: monthLabels[monthIndex] ?? 'January',
		rows,
	};
};
