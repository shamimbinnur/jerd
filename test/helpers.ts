import {mkdtemp, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import type {ExecutionContext} from 'ava';

export const withTemporaryDirectory = async (
	t: ExecutionContext,
	task: (directory: string) => Promise<void>,
) => {
	const directory = await mkdtemp(join(tmpdir(), 'jerd-test-'));
	t.teardown(() => {
		rm(directory, {force: true, recursive: true}).catch(() => undefined);
	});

	await task(directory);
};
