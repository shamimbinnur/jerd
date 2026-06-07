#!/usr/bin/env node
import process from 'node:process';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';
import {resolveCliStartup} from './utils/cli-startup.js';
import {hasProjectConfig} from './utils/project-config.js';

const cli = meow(
	`
	Usage
	  $ jerd
	  $ jerd init [directory]
	  $ jerd new
	  $ jerd find
	  $ jerd cal
	  $ jerd mood

	Options
		--screen  Screen to render: home, calendar, find, mood-tracker, init, project-init, or new-entry

	Examples
	  $ jerd
	  $ jerd new
	  $ jerd find
	  $ jerd cal
	  $ jerd mood
	  $ jerd init
	  $ jerd init .
	  $ jerd init my-journal
	  $ jerd --screen=init
`,
	{
		importMeta: import.meta,
		flags: {
			screen: {
				type: 'string',
			},
		},
	},
);

const [command, directory] = cli.input;
const cwd = process.cwd();
const hasCurrentProjectConfig = await hasProjectConfig(cwd);
const startup = resolveCliStartup({
	command,
	cwd,
	directory,
	hasCurrentProjectConfig,
	screen: cli.flags.screen,
});

const formatNextStep = (command: string) => {
	const message = `==> Next: ${command}`;

	if (!process.stdout.isTTY) {
		return message;
	}

	const bold = '\u001B[1m';
	const highlight = '\u001B[38;5;208m';
	const reset = '\u001B[0m';

	return `${highlight}${bold}${message}${reset}`;
};

let nextStepCommand: string | undefined;
const app = render(
	<App
		configDirectory={startup.configDirectory}
		postInitCdCommand={startup.postInitCdCommand}
		screen={startup.screen}
		onPostInitNextStep={command => {
			nextStepCommand = command;
		}}
	/>,
);

await app.waitUntilExit();

if (nextStepCommand) {
	console.log(`\n${formatNextStep(nextStepCommand)}\n`);
}
