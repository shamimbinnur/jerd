import test from 'ava';
import {
	completeMoodMonthQuery,
	getMoodMonthQuerySuggestion,
	parseMoodMonthQuery,
} from '../source/utils/mood-month-query.js';

test('completeMoodMonthQuery completes month prefixes', t => {
	t.is(
		completeMoodMonthQuery('ju', {defaultMonth: 7, defaultYear: 2026}),
		'jul ',
	);
});

test('completeMoodMonthQuery completes year prefixes from current year', t => {
	t.is(
		completeMoodMonthQuery('jul ', {defaultMonth: 7, defaultYear: 2026}),
		'jul 2026',
	);
	t.is(
		completeMoodMonthQuery('jul 2', {defaultMonth: 7, defaultYear: 2026}),
		'jul 2026',
	);
});

test('getMoodMonthQuerySuggestion returns the suggested completion suffix', t => {
	t.is(
		getMoodMonthQuerySuggestion('ju', {defaultMonth: 7, defaultYear: 2026}),
		'l ',
	);
	t.is(
		getMoodMonthQuerySuggestion('jul 2', {
			defaultMonth: 7,
			defaultYear: 2026,
		}),
		'026',
	);
	t.is(
		getMoodMonthQuerySuggestion('', {defaultMonth: 7, defaultYear: 2026}),
		'',
	);
});

test('parseMoodMonthQuery parses valid month and year queries', t => {
	t.deepEqual(parseMoodMonthQuery('jun 2027'), {month: 6, year: 2027});
	t.deepEqual(parseMoodMonthQuery('JUL 2026'), {month: 7, year: 2026});
});

test('parseMoodMonthQuery rejects invalid or incomplete queries', t => {
	t.is(parseMoodMonthQuery('juny 2027'), undefined);
	t.is(parseMoodMonthQuery('jun 202'), undefined);
	t.is(parseMoodMonthQuery('notamonth 2027'), undefined);
});
