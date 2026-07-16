import test from 'ava';
import {parseJournalDateQuery} from '../../../src/core/journal/date-query.js';

test('parseJournalDateQuery handles aliases, relative dates, and ISO dates', t => {
	const now = new Date('2026-06-07T10:00:00');

	t.is(parseJournalDateQuery('today', now)?.iso, '2026-06-07');
	t.is(parseJournalDateQuery('yesterday', now)?.iso, '2026-06-06');
	t.is(parseJournalDateQuery('3 days ago', now)?.iso, '2026-06-04');
	t.is(parseJournalDateQuery('2026-05-31', now)?.iso, '2026-05-31');
	t.is(parseJournalDateQuery('2026-02-31', now), undefined);
});
