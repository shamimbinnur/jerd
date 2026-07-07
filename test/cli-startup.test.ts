import test from 'ava';
import {resolveCliStartup} from '../source/utils/cli-startup.js';

test('new command starts at mood check-in', t => {
	const startup = resolveCliStartup({
		command: 'new',
		cwd: '/journal',
		hasCurrentProjectConfig: true,
	});

	t.is(startup.screen, 'mood-check-in');
	t.is(startup.configDirectory, '/journal');
	t.is(startup.postInitCdCommand, undefined);
});

test('new command with valid mood starts new entry', t => {
	const startup = resolveCliStartup({
		command: 'new',
		cwd: '/journal',
		hasCurrentProjectConfig: true,
		mood: 'calm',
	});

	t.is(startup.screen, 'new-entry');
	t.is(startup.initialMood, 'calm');
	t.is(startup.invalidMood, undefined);
});

test('new command normalizes valid mood flag case', t => {
	const startup = resolveCliStartup({
		command: 'new',
		cwd: '/journal',
		hasCurrentProjectConfig: true,
		mood: 'HAPPY',
	});

	t.is(startup.screen, 'new-entry');
	t.is(startup.initialMood, 'happy');
});

test('new command with invalid mood starts correction selector', t => {
	const startup = resolveCliStartup({
		command: 'new',
		cwd: '/journal',
		hasCurrentProjectConfig: true,
		mood: 'clm',
	});

	t.is(startup.screen, 'mood-check-in');
	t.is(startup.initialMood, undefined);
	t.is(startup.invalidMood, 'clm');
});

test('screen flag can render mood check-in directly', t => {
	const startup = resolveCliStartup({
		cwd: '/journal',
		hasCurrentProjectConfig: true,
		screen: 'mood-check-in',
	});

	t.is(startup.screen, 'mood-check-in');
});

test('find command without query starts empty find screen', t => {
	const startup = resolveCliStartup({
		command: 'find',
		cwd: '/journal',
		hasCurrentProjectConfig: true,
	});

	t.is(startup.screen, 'find');
	t.is(startup.initialFindQuery, undefined);
});

test('find command stores quoted search term as initial query', t => {
	const startup = resolveCliStartup({
		command: 'find',
		cwd: '/journal',
		findQueryParts: ['work notes'],
		hasCurrentProjectConfig: true,
	});

	t.is(startup.screen, 'find');
	t.is(startup.initialFindQuery, 'work notes');
});

test('find command joins multiple search arguments with spaces', t => {
	const startup = resolveCliStartup({
		command: 'find',
		cwd: '/journal',
		findQueryParts: ['work', 'notes', 'today'],
		hasCurrentProjectConfig: true,
	});

	t.is(startup.screen, 'find');
	t.is(startup.initialFindQuery, 'work notes today');
});

test('find command treats whitespace-only query as empty', t => {
	const startup = resolveCliStartup({
		command: 'find',
		cwd: '/journal',
		findQueryParts: ['  ', '\t'],
		hasCurrentProjectConfig: true,
	});

	t.is(startup.screen, 'find');
	t.is(startup.initialFindQuery, undefined);
});

test('mood command stores an initial mood tracker month', t => {
	const startup = resolveCliStartup({
		command: 'mood',
		cwd: '/journal',
		hasCurrentProjectConfig: true,
		moodMonthQueryParts: ['jul', '2026'],
	});

	t.is(startup.screen, 'mood-tracker');
	t.deepEqual(startup.initialMoodTrackerMonth, {month: 7, year: 2026});
});

test('mood command ignores invalid initial month queries', t => {
	const startup = resolveCliStartup({
		command: 'mood',
		cwd: '/journal',
		hasCurrentProjectConfig: true,
		moodMonthQueryParts: ['julyish', '2026'],
	});

	t.is(startup.screen, 'mood-tracker');
	t.is(startup.initialMoodTrackerMonth, undefined);
});
