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

test('screen flag can render mood check-in directly', t => {
	const startup = resolveCliStartup({
		cwd: '/journal',
		hasCurrentProjectConfig: true,
		screen: 'mood-check-in',
	});

	t.is(startup.screen, 'mood-check-in');
});
