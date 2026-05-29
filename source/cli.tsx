#!/usr/bin/env node
import process from 'node:process';
import React from 'react';
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

	Options
		--screen  Screen to render: home, init, project-init, loading, success, dashboard, confirmation, or farewell

	Examples
	  $ jerd
	  $ jerd init
	  $ jerd init .
	  $ jerd init my-journal
	  $ jerd --screen=confirmation
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

render(
	<App configDirectory={startup.configDirectory} screen={startup.screen} />,
);
