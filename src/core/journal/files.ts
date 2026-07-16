import {readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {getMonthName, parseJournalFileName} from './paths.js';

export type JournalFile = {
	readonly day: number;
	readonly fileName: string;
	readonly fullPath: string;
	readonly isoDate: string;
	readonly monthName: string;
	readonly relativePath: string;
	readonly year: string;
};

const isYearDirectoryName = (name: string) => /^\d{4}$/v.test(name);

const listFilesInMonthDirectory = async ({
	monthName,
	monthPath,
	rootDirectory,
	year,
}: {
	readonly monthName: string;
	readonly monthPath: string;
	readonly rootDirectory: string;
	readonly year: string;
}) => {
	const files = await readdir(monthPath, {withFileTypes: true}).catch(() => []);
	const journalFiles: JournalFile[] = [];

	for (const file of files) {
		if (!file.isFile() || !file.name.endsWith('.md')) {
			continue;
		}

		const parsed = parseJournalFileName({
			fileName: file.name,
			monthName,
			year,
		});
		if (!parsed) {
			continue;
		}

		const relativePath = join(year, monthName, file.name);
		journalFiles.push({
			day: parsed.day,
			fileName: file.name,
			fullPath: join(rootDirectory, relativePath),
			isoDate: parsed.isoDate,
			monthName,
			relativePath,
			year,
		});
	}

	return journalFiles;
};

export const listJournalFilesForMonth = async ({
	month,
	rootDirectory,
	year,
}: {
	readonly month: number;
	readonly rootDirectory: string;
	readonly year: number;
}) => {
	const monthName = getMonthName(month);
	if (!monthName) {
		return [];
	}

	return listFilesInMonthDirectory({
		monthName,
		monthPath: join(rootDirectory, String(year), monthName),
		rootDirectory,
		year: String(year),
	});
};

export const listJournalFiles = async (rootDirectory: string) => {
	const yearDirectories = await readdir(rootDirectory, {
		withFileTypes: true,
	}).catch(() => []);
	const years = yearDirectories.filter(
		yearDirectory =>
			yearDirectory.isDirectory() && isYearDirectoryName(yearDirectory.name),
	);

	const nested = await Promise.all(
		years.map(async yearDirectory => {
			const yearPath = join(rootDirectory, yearDirectory.name);
			const monthDirectories = await readdir(yearPath, {
				withFileTypes: true,
			}).catch(() => []);

			return Promise.all(
				monthDirectories
					.filter(monthDirectory => monthDirectory.isDirectory())
					.map(async monthDirectory =>
						listFilesInMonthDirectory({
							monthName: monthDirectory.name,
							monthPath: join(yearPath, monthDirectory.name),
							rootDirectory,
							year: yearDirectory.name,
						}),
					),
			);
		}),
	);

	const journalFiles: JournalFile[] = [];
	for (const yearFiles of nested) {
		for (const monthFiles of yearFiles) {
			journalFiles.push(...monthFiles);
		}
	}

	return journalFiles;
};
