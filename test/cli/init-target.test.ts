import test from 'ava';
import {resolveInitTarget} from '../../src/cli/init-target.js';

test('resolveInitTarget returns default project directory command', t => {
	const target = resolveInitTarget({
		cwd: '/workspace',
	});

	t.is(target.configDirectory, '/workspace/jerd');
	t.is(target.cdCommand, 'cd jerd');
});

test('resolveInitTarget quotes directory names with spaces', t => {
	const target = resolveInitTarget({
		cwd: '/workspace',
		directory: 'my journal',
	});

	t.is(target.configDirectory, '/workspace/my journal');
	t.is(target.cdCommand, "cd 'my journal'");
});

test('resolveInitTarget escapes single quotes in directory names', t => {
	const target = resolveInitTarget({
		cwd: '/workspace',
		directory: "sam's journal",
	});

	t.is(target.configDirectory, "/workspace/sam's journal");
	t.is(target.cdCommand, String.raw`cd 'sam'\''s journal'`);
});
