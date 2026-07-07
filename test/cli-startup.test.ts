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
