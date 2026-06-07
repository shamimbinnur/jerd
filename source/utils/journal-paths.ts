import {join, relative} from 'node:path';

export const monthNames = [
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
] as const;

export const pad2 = (value: number) => String(value).padStart(2, '0');

export const toIsoDate = (date: Date) =>
	`${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

export const getMonthName = (month: number) => monthNames[month - 1];

const getMonthNumber = (monthName: string) => {
	for (const [index, currentMonthName] of monthNames.entries()) {
		if (currentMonthName === monthName) {
			return pad2(index + 1);
		}
	}

	return undefined;
};

export const getJournalLocation = (rootDirectory: string, now: Date) => {
	const year = String(now.getFullYear());
	const month = monthNames[now.getMonth()] ?? 'january';
	const day = pad2(now.getDate());
	const directoryPath = join(rootDirectory, year, month);
	const fileName = `${year}_${month}_${day}.md`;
	const filePath = join(directoryPath, fileName);

	return {
		day,
		directoryPath,
		fileName,
		filePath,
		month,
		relativePath: relative(rootDirectory, filePath),
		year,
	};
};

export const parseJournalFileName = ({
	fileName,
	monthName,
	year,
}: {
	readonly fileName: string;
	readonly monthName: string;
	readonly year: string;
}) => {
	const match = new RegExp(
		String.raw`^${year}_${monthName}_(\d{2})\.md$`,
		'iv',
	).exec(fileName);
	const dayText = match?.[1];
	if (!dayText) {
		return undefined;
	}

	const day = Number(dayText);
	if (!Number.isInteger(day) || day < 1 || day > 31) {
		return undefined;
	}

	const monthNumber = getMonthNumber(monthName);
	if (!monthNumber) {
		return undefined;
	}

	return {
		day,
		isoDate: `${year}-${monthNumber}-${dayText}`,
	};
};
