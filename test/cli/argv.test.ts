import test from 'ava';
import {normalizeCliArgv} from '../../src/cli/argv.js';

test('normalizeCliArgv supports single-dash mood flag', t => {
	t.deepEqual(normalizeCliArgv(['new', '-mood', 'calm']), [
		'new',
		'--mood',
		'calm',
	]);
});

test('normalizeCliArgv supports single-dash mood assignment', t => {
	t.deepEqual(normalizeCliArgv(['new', '-mood=happy']), [
		'new',
		'--mood=happy',
	]);
});

test('normalizeCliArgv leaves mood shorthand unchanged', t => {
	t.deepEqual(normalizeCliArgv(['new', '-m', 'sad']), ['new', '-m', 'sad']);
});
