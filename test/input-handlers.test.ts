import type {Key} from 'ink';
import test from 'ava';
import {
	handleMoodTrackerInput,
	resolveHomeQuitInput,
} from '../source/app/input-handlers.js';
import type {Screen} from '../source/app/types.js';
import type {MoodTrackerView} from '../source/hooks/use-mood-tracker.js';

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
		setView: noop,
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
		setView: noop,
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
		setView: noop,
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
		setView: noop,
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
		setView: noop,
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
		setView: noop,
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
		setView: noop,
		submitMonthQuery: noop,
		updateMonthQuery: noop,
	});

	t.is(monthOffset, 0);
	t.is(selectedScreen, 'home');
});

test('handleMoodTrackerInput selects mood tracker views with arrow keys', t => {
	const selectedViews: MoodTrackerView[] = [];
	const setView = (
		value: MoodTrackerView | ((current: MoodTrackerView) => MoodTrackerView),
	) => {
		const currentView = selectedViews.at(-1) ?? 'heatgraph';
		selectedViews.push(
			typeof value === 'function' ? value(currentView) : value,
		);
	};

	const options = {
		completeMonthQuery: noop,
		input: '',
		monthQuery: '',
		moveMonth: noop,
		setActiveScreen: noop,
		setView,
		submitMonthQuery: noop,
		updateMonthQuery: noop,
	};

	handleMoodTrackerInput({...options, key: key({downArrow: true})});
	handleMoodTrackerInput({...options, key: key({upArrow: true})});

	t.deepEqual(selectedViews, ['frequency', 'heatgraph']);
});

test('resolveHomeQuitInput quits on a quick second q press', t => {
	const firstPress = resolveHomeQuitInput({
		input: 'q',
		now: 1000,
	});
	const secondPress = resolveHomeQuitInput({
		input: 'q',
		lastQuitPressAt: firstPress.nextQuitPressAt,
		now: 1300,
	});

	t.false(firstPress.shouldQuit);
	t.is(firstPress.nextQuitPressAt, 1000);
	t.true(secondPress.shouldQuit);
	t.is(secondPress.nextQuitPressAt, undefined);
});

test('resolveHomeQuitInput requires two q presses inside the quit window', t => {
	const lateSecondPress = resolveHomeQuitInput({
		input: 'q',
		lastQuitPressAt: 1000,
		now: 2000,
	});
	const otherInput = resolveHomeQuitInput({
		input: 'm',
		lastQuitPressAt: 1000,
		now: 1100,
	});

	t.false(lateSecondPress.shouldQuit);
	t.is(lateSecondPress.nextQuitPressAt, 2000);
	t.false(otherInput.shouldQuit);
	t.is(otherInput.nextQuitPressAt, undefined);
});
