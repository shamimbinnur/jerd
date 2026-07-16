import test from 'ava';
import {resolveHomeQuitInput} from '../../../src/features/home/input.js';

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
