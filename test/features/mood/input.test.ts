import type {Key} from 'ink';
import test from 'ava';
import type {Screen} from '../../../src/app/types.js';
import {handleMoodTrackerInput} from '../../../src/features/mood/input.js';

const noop = () => undefined;

const key = (value: Partial<Key>): Key => ({
	backspace: false,
	capsLock: false,
	ctrl: false,
	delete: false,
	downArrow: false,
	end: false,
	escape: false,
	home: false,
	hyper: false,
	leftArrow: false,
	meta: false,
	numLock: false,
	pageDown: false,
	pageUp: false,
	return: false,
	rightArrow: false,
	shift: false,
	super: false,
	tab: false,
	upArrow: false,
	...value,
});

test('handleMoodTrackerInput updates typed month query', t => {
	let monthQuery = '';

	handleMoodTrackerInput({
		completeMonthQuery: noop,
		input: 'j',
		key: key({}),
		monthQuery,
		moveMonth: noop,
		setActiveScreen: noop,
		moveView: noop,
		submitMonthQuery: noop,
		updateMonthQuery(value) {
			monthQuery = typeof value === 'function' ? value(monthQuery) : value;
		},
	});

	t.is(monthQuery, 'j');
});

test('handleMoodTrackerInput completes and submits query shortcuts', t => {
	let didComplete = false;
	let didSubmit = false;

	handleMoodTrackerInput({
		completeMonthQuery() {
			didComplete = true;
		},
		input: '',
		key: key({tab: true}),
		monthQuery: 'ju',
		moveMonth: noop,
		setActiveScreen: noop,
		moveView: noop,
		submitMonthQuery: noop,
		updateMonthQuery: noop,
	});
	handleMoodTrackerInput({
		completeMonthQuery: noop,
		input: '',
		key: key({return: true}),
		monthQuery: 'july 2026',
		moveMonth: noop,
		setActiveScreen: noop,
		moveView: noop,
		submitMonthQuery() {
			didSubmit = true;
		},
		updateMonthQuery: noop,
	});

	t.true(didComplete);
	t.true(didSubmit);
});

test('handleMoodTrackerInput deletes query text', t => {
	let monthQuery = 'july';

	handleMoodTrackerInput({
		completeMonthQuery: noop,
		input: '',
		key: key({backspace: true}),
		monthQuery,
		moveMonth: noop,
		setActiveScreen: noop,
		moveView: noop,
		submitMonthQuery: noop,
		updateMonthQuery(value) {
			monthQuery = typeof value === 'function' ? value(monthQuery) : value;
		},
	});

	t.is(monthQuery, 'jul');
});

test('handleMoodTrackerInput keeps month navigation and escape', t => {
	let monthOffset = 0;
	let selectedScreen: Screen | undefined;

	handleMoodTrackerInput({
		completeMonthQuery: noop,
		input: '',
		key: key({leftArrow: true}),
		monthQuery: '',
		moveMonth(offset) {
			monthOffset += offset;
		},
		setActiveScreen(value) {
			selectedScreen =
				typeof value === 'function' ? value('mood-tracker') : value;
		},
		moveView: noop,
		submitMonthQuery: noop,
		updateMonthQuery: noop,
	});
	handleMoodTrackerInput({
		completeMonthQuery: noop,
		input: '',
		key: key({rightArrow: true}),
		monthQuery: '',
		moveMonth(offset) {
			monthOffset += offset;
		},
		setActiveScreen(value) {
			selectedScreen =
				typeof value === 'function' ? value('mood-tracker') : value;
		},
		moveView: noop,
		submitMonthQuery: noop,
		updateMonthQuery: noop,
	});
	handleMoodTrackerInput({
		completeMonthQuery: noop,
		input: '',
		key: key({escape: true}),
		monthQuery: '',
		moveMonth(offset) {
			monthOffset += offset;
		},
		setActiveScreen(value) {
			selectedScreen =
				typeof value === 'function' ? value('mood-tracker') : value;
		},
		moveView: noop,
		submitMonthQuery: noop,
		updateMonthQuery: noop,
	});

	t.is(monthOffset, 0);
	t.is(selectedScreen, 'home');
});

test('handleMoodTrackerInput moves through views with arrow keys', t => {
	const viewOffsets: number[] = [];
	const options = {
		completeMonthQuery: noop,
		input: '',
		monthQuery: '',
		moveMonth: noop,
		moveView(offset: number) {
			viewOffsets.push(offset);
		},
		setActiveScreen: noop,
		submitMonthQuery: noop,
		updateMonthQuery: noop,
	};

	handleMoodTrackerInput({...options, key: key({downArrow: true})});
	handleMoodTrackerInput({...options, key: key({upArrow: true})});

	t.deepEqual(viewOffsets, [1, -1]);
});
