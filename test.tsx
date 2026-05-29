import {createRequire} from 'node:module';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {TestFn} from 'ava';
import React from 'react';
import {cleanup, render} from 'ink-testing-library';
import App from './source/app.js';
import Farewell from './source/screens/farewell.js';
import {resolveCliStartup} from './source/utils/cli-startup.js';
import {resolveInitTarget} from './source/utils/init-target.js';

const require = createRequire(import.meta.url);
const test = require('ava') as TestFn;

const waitForRender = async () =>
	new Promise(resolve => {
		setTimeout(resolve, 0);
	});
const waitForFilesystem = async () =>
	new Promise(resolve => {
		setTimeout(resolve, 50);
	});

const enableReadableInput = (
	stdin: ReturnType<typeof render>['stdin'] & {
		read?: () => unknown;
		ref?: () => void;
		unref?: () => void;
	},
) => {
	let bufferedInput: string | undefined;

	stdin.ref = () => undefined;
	stdin.unref = () => undefined;
	stdin.read = () => {
		const input = bufferedInput;
		bufferedInput = undefined;

		return input ?? null;
	};

	stdin.write = input => {
		bufferedInput = input;
		stdin.emit('readable');
	};
};

const renderApp = (
	screen: React.ComponentProps<typeof App>['screen'],
	options: {
		readonly configDirectory?: string;
		readonly now?: Date;
	} = {},
) => {
	const renderedApp = render(
		<App
			configDirectory={options.configDirectory}
			now={options.now ?? new Date('2026-02-24T09:00:00')}
			screen={screen}
		/>,
	);

	enableReadableInput(renderedApp.stdin);

	return renderedApp;
};

test.afterEach(() => {
	cleanup();
});

test('resolves init target directories', t => {
	const cwd = '/workspace';

	t.deepEqual(resolveInitTarget({cwd}), {
		cdCommand: 'cd jerd',
		configDirectory: join(cwd, 'jerd'),
	});
	t.deepEqual(resolveInitTarget({cwd, directory: '.'}), {
		cdCommand: 'cd jerd',
		configDirectory: join(cwd, 'jerd'),
	});
	t.deepEqual(resolveInitTarget({cwd, directory: 'notes'}), {
		cdCommand: 'cd notes',
		configDirectory: join(cwd, 'notes'),
	});
});

test('resolves bare jerd startup from config presence', t => {
	const cwd = '/workspace';

	t.deepEqual(resolveCliStartup({cwd, hasCurrentProjectConfig: true}), {
		configDirectory: cwd,
		postInitCdCommand: undefined,
		screen: 'home',
	});
	t.deepEqual(resolveCliStartup({cwd, hasCurrentProjectConfig: false}), {
		configDirectory: join(cwd, 'jerd'),
		postInitCdCommand: 'cd jerd',
		screen: 'init',
	});
});

test('resolves jerd init startup target', t => {
	const cwd = '/workspace';

	t.deepEqual(
		resolveCliStartup({
			command: 'init',
			cwd,
			directory: 'notes',
			hasCurrentProjectConfig: true,
		}),
		{
			configDirectory: join(cwd, 'notes'),
			postInitCdCommand: 'cd notes',
			screen: 'init',
		},
	);
});

test.serial('renders initial initiation prompt branding and description', t => {
	const {lastFrame} = renderApp('init');
	const frame = lastFrame();

	t.true(frame?.includes('$jerd'));
	t.true(frame?.includes('Jerd is a zero-friction'));
	t.true(frame?.includes('journaling tool'));
});

test.serial('renders home screen when passed through screen prop', t => {
	const {lastFrame} = renderApp('home');
	const frame = lastFrame();

	t.true(frame?.includes('Good morning, Shamim'));
	t.true(frame?.includes('24th February 2026'));
	t.true(frame?.includes('Entries Recorded'));
	t.true(frame?.includes('Cal'));
	t.true(frame?.includes('[m]'));
	t.true(frame?.includes('Mode: visual'));
	t.true(frame?.includes('jk toggles command/visual mode'));
});

test.serial('toggles home mode with jk', async t => {
	const {lastFrame, stdin} = renderApp('home');
	await waitForRender();

	t.true(lastFrame()?.includes('Mode: visual'));

	stdin.write('jk');
	await waitForRender();

	t.true(lastFrame()?.includes('Mode: command'));

	stdin.write('j');
	await waitForRender();
	stdin.write('k');
	await waitForRender();

	t.true(lastFrame()?.includes('Mode: visual'));
});

test.serial('renders home greeting from project config', async t => {
	const configDirectory = await mkdtemp(join(tmpdir(), 'jerd-test-'));

	t.teardown(async () => {
		await rm(configDirectory, {force: true, recursive: true});
	});

	await writeFile(
		join(configDirectory, 'jerd.config.json'),
		`${JSON.stringify({name: 'Mina'}, null, 2)}\n`,
		'utf8',
	);

	const {lastFrame} = renderApp('home', {configDirectory});
	await waitForFilesystem();
	await waitForRender();

	t.true(lastFrame()?.includes('Good morning, Mina'));
});

test.serial('renders static initiation controls', t => {
	const {lastFrame} = renderApp('init');
	const frame = lastFrame();

	t.true(frame?.includes('Fresh start, huh?'));
	t.true(frame?.includes('Initiate now?'));
	t.true(frame?.includes('Yes [y]'));
	t.true(frame?.includes('No [n]'));
});

test.serial('renders loading screen when passed through screen prop', t => {
	const {lastFrame} = renderApp('loading');
	const frame = lastFrame();

	t.true(frame?.includes('Setting things up'));
	t.true(frame?.includes('Loading...'));
});

test.serial('renders project initiation name input', t => {
	const {lastFrame} = renderApp('project-init');
	const frame = lastFrame();

	t.true(frame?.includes('Initiate a jerd project directory'));
	t.true(frame?.includes('Project setup'));
	t.true(frame?.includes('Name'));
	t.true(frame?.includes('Enter your name...'));
	t.true(frame?.includes('Press enter to continue'));
});

test.serial('renders success screen when passed through screen prop', t => {
	const {lastFrame} = renderApp('success');
	const frame = lastFrame();

	t.true(frame?.includes('Ready.'));
	t.true(frame?.includes('jerd initiated'));
});

test.serial('renders dashboard screen when passed through screen prop', t => {
	const {lastFrame} = renderApp('dashboard');
	const frame = lastFrame();

	t.true(frame?.includes('Your journal desk is open'));
	t.true(frame?.includes('Current Writing Streak'));
	t.true(frame?.includes('Today'));
	t.true(frame?.includes('[s]'));
});

test.serial('renders completed farewell message', t => {
	const {lastFrame} = render(
		<Farewell isComplete progressRatio={0} secondsRemaining={0} />,
	);
	const frame = lastFrame();

	t.true(frame?.includes('will keep your words warm.'));
	t.true(frame?.includes('Come back when'));
	t.true(frame?.includes('day has more to say!'));
});

test.serial(
	'moves from initiation confirmation to project setup on yes',
	async t => {
		const {lastFrame, stdin} = renderApp('init');
		await waitForRender();

		t.true(lastFrame()?.includes('│ Yes [y] │   │ No [n] │'));

		stdin.write('y');
		await waitForRender();

		t.true(lastFrame()?.includes('Project setup'));
		t.true(lastFrame()?.includes('Enter your name...'));
	},
);

test.serial('moves from project setup to menu on name submit', async t => {
	const configDirectory = await mkdtemp(join(tmpdir(), 'jerd-test-'));

	t.teardown(async () => {
		await rm(configDirectory, {force: true, recursive: true});
	});

	const {lastFrame, stdin} = renderApp('init', {
		configDirectory,
	});
	await waitForRender();

	stdin.write('y');
	await waitForRender();

	stdin.write('Shamim');
	await waitForRender();

	stdin.write('\r');
	await waitForFilesystem();
	await waitForRender();

	const config = JSON.parse(
		await readFile(join(configDirectory, 'jerd.config.json'), 'utf8'),
	) as Record<string, unknown>;

	t.is(config['name'], 'Shamim');
	t.false('jerdPath' in config);
	t.false('dateFormat' in config);
	t.false('defaultTemplate' in config);
	t.false('uiStyle' in config);
	t.false('theme' in config);
	t.true(lastFrame()?.includes('Good morning, Shamim'));
	t.true(lastFrame()?.includes('Cal'));
	t.true(lastFrame()?.includes('Write'));
});
