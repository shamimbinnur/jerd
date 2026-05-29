import {resolveInitTarget} from './init-target.js';

export type StartupScreen =
	| 'confirmation'
	| 'dashboard'
	| 'farewell'
	| 'home'
	| 'init'
	| 'loading'
	| 'project-init'
	| 'success';

const screens = [
	'confirmation',
	'dashboard',
	'farewell',
	'home',
	'init',
	'loading',
	'project-init',
	'success',
] as const satisfies readonly StartupScreen[];

type ResolveCliStartupInput = {
	readonly command?: string;
	readonly cwd: string;
	readonly directory?: string;
	readonly hasCurrentProjectConfig: boolean;
	readonly screen?: string;
};

export const isStartupScreen = (
	value: string | undefined,
): value is StartupScreen =>
	screens.includes(value as (typeof screens)[number]);

export const resolveCliStartup = ({
	command,
	cwd,
	directory,
	hasCurrentProjectConfig,
	screen,
}: ResolveCliStartupInput) => {
	const screenFlag = isStartupScreen(screen) ? screen : undefined;
	const shouldStartInit =
		command === 'init' || (!screenFlag && !hasCurrentProjectConfig);
	const initTarget = shouldStartInit
		? resolveInitTarget({
				cwd,
				directory: command === 'init' ? directory : undefined,
		  })
		: undefined;

	return {
		configDirectory: initTarget?.configDirectory ?? cwd,
		postInitCdCommand: initTarget?.cdCommand,
		screen: shouldStartInit ? 'init' : screenFlag ?? 'home',
	};
};
