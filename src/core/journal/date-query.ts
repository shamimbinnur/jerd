import {toIsoDate} from './paths.js';

export type ParsedJournalDate = {
	readonly date: Date;
	readonly iso: string;
};

export const parseJournalDateQuery = (
	query: string,
	now = new Date(),
): ParsedJournalDate | undefined => {
	const normalized = query.trim().toLowerCase();
	if (!normalized) {
		return undefined;
	}

	if (normalized === 'today') {
		return {date: now, iso: toIsoDate(now)};
	}

	if (normalized === 'yesterday') {
		const date = new Date(now);
		date.setDate(now.getDate() - 1);
		return {date, iso: toIsoDate(date)};
	}

	const relativeDays = /^(\d+)\s+days?\s+(ago|before)$/v.exec(normalized);
	if (relativeDays) {
		const days = Number(relativeDays[1]);
		const date = new Date(now);
		date.setDate(now.getDate() - days);
		return {date, iso: toIsoDate(date)};
	}

	const absolute = /^(\d{4})-(\d{2})-(\d{2})$/v.exec(normalized);
	if (absolute) {
		const year = absolute[1];
		const month = absolute[2];
		const day = absolute[3];
		if (!year || !month || !day) {
			return undefined;
		}

		const date = new Date(`${year}-${month}-${day}T00:00:00`);
		if (!Number.isNaN(date.getTime()) && toIsoDate(date) === normalized) {
			return {date, iso: normalized};
		}
	}

	return undefined;
};
