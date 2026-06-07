import {readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import test from 'ava';
import {
	getProjectConfigPath,
	hasProjectConfig,
	loadProjectConfig,
	writeProjectConfig,
} from '../source/utils/project-config.js';
import {withTemporaryDirectory} from './helpers.js';

test('project config uses jerd.config.json only', async t => {
	await withTemporaryDirectory(t, async directory => {
		await writeFile(join(directory, 'jerd.config.js'), 'export default {};\n');
		const hasConfig = await hasProjectConfig(directory);
		const config = await loadProjectConfig(directory);

		t.false(hasConfig);
		t.deepEqual(config, {});
	});
});

test('writeProjectConfig creates readable JSON config', async t => {
	await withTemporaryDirectory(t, async directory => {
		const now = new Date('2026-06-07T00:00:00.000Z');
		const config = await writeProjectConfig({
			directory,
			editor: 'vim',
			name: ' Shamim ',
			now,
		});
		const hasConfig = await hasProjectConfig(directory);
		const loadedConfig = await loadProjectConfig(directory);
		const configContent = await readFile(
			getProjectConfigPath(directory),
			'utf8',
		);

		t.true(hasConfig);
		t.like(config, {
			createdAt: now.toISOString(),
			editor: 'vim',
			name: 'Shamim',
			updatedAt: now.toISOString(),
		});
		t.deepEqual(loadedConfig, config);
		t.is(configContent, `${JSON.stringify(config, null, 2)}\n`);
	});
});
