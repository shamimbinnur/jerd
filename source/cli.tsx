#!/usr/bin/env node
import process from 'node:process';

const minimumNodeVersion = [24, 18, 0] as const;

const isSupportedNodeVersion = (version: string) => {
	const [major = 0, minor = 0, patch = 0] = version
		.split('.')
		.map(part => Number.parseInt(part, 10));
	const [minimumMajor, minimumMinor, minimumPatch] = minimumNodeVersion;

	return (
		major > minimumMajor ||
		(major === minimumMajor && minor > minimumMinor) ||
		(major === minimumMajor && minor === minimumMinor && patch >= minimumPatch)
	);
};

if (!isSupportedNodeVersion(process.versions.node)) {
	console.error(
		`Jerd requires Node.js ${minimumNodeVersion.join('.')} or newer. You are running ${process.version}.`,
	);
	process.exit(1);
}

const [
	{default: React},
	{render},
	{default: meow},
	{default: App},
	{normalizeCliArgv},
	{openJournalEntryForDate},
	{resolveCliStartup},
	{hasProjectConfig, loadProjectConfig},
] = await Promise.all([
	import('react'),
	import('ink'),
	import('meow'),
	import('./app.js'),
	import('./utils/cli-argv.js'),
	import('./utils/open-command.js'),
	import('./utils/cli-startup.js'),
	import('./utils/project-config.js'),
]);

const cli = meow(
	`
	Usage
	  $ jerd
	  $ jerd init [directory]
	  $ jerd new [--mood mood]
	  $ jerd open today|yesterday|YYYY-MM-DD
	  $ jerd find [search term]
	  $ jerd cal
	  $ jerd mood

	Options
		--mood, -mood, -m  Mood for jerd new: happy, calm, neutral, sad, or angry
		--screen  Screen to render: home, calendar, find, mood-check-in, mood-tracker, init, project-init, or new-entry

	Examples
	  $ jerd
	  $ jerd new
	  $ jerd new --mood calm
	  $ jerd new -mood calm
	  $ jerd new -m happy
	  $ jerd open today
	  $ jerd open yesterday
	  $ jerd open 2026-07-07
	  $ jerd find
	  $ jerd find "work notes"
	  $ jerd find today
	  $ jerd cal
	  $ jerd mood
	  $ jerd init
	  $ jerd init .
	  $ jerd init my-journal
	  $ jerd --screen=init
`,
	{
		argv: normalizeCliArgv(process.argv.slice(2)),
		importMeta: import.meta,
		flags: {
			mood: {
				shortFlag: 'm',
				type: 'string',
			},
			screen: {
				type: 'string',
			},
		},
	},
);

const [command, directory, ...commandArguments] = cli.input;
const cwd = process.cwd();
const hasCurrentProjectConfig = await hasProjectConfig(cwd);

if (command === 'open') {
	if (!hasCurrentProjectConfig) {
		console.error(
			'No jerd.config.json found. Run this from a journal project.',
		);
		process.exit(1);
	}

	try {
		const projectConfig = await loadProjectConfig(cwd);
		const relativePath = await openJournalEntryForDate({
			dateText: directory,
			editor: projectConfig.editor,
			rootDirectory: cwd,
		});
		console.log(`Saved ${relativePath}`);
	} catch (error: unknown) {
		console.error(error instanceof Error ? error.message : 'Open failed');
		process.exit(1);
	}

	process.exit(0);
}

const startup = resolveCliStartup({
	command,
	cwd,
	directory,
	findQueryParts: [directory, ...commandArguments].filter(
		(argument): argument is string => typeof argument === 'string',
	),
	hasCurrentProjectConfig,
	mood: cli.flags.mood,
	screen: cli.flags.screen,
});

const app = render(
	React.createElement(App, {
		configDirectory: startup.configDirectory,
		initialFindQuery: startup.initialFindQuery,
		initialMood: startup.initialMood,
		invalidMood: startup.invalidMood,
		postInitCdCommand: startup.postInitCdCommand,
		screen: startup.screen,
	}),
);

await app.waitUntilExit();
