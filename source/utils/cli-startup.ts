import {resolveInitTarget} from './init-target.js';

export type StartupScreen =
	| 'calendar'
	| 'find'
	| 'home'
	| 'init'
	| 'new-entry'
	| 'mood-tracker'
	| 'project-init';

const screens = [
	'calendar',
	'find',
	'home',
	'init',
	'new-entry',
	'mood-tracker',
	'project-init',
] as const satisfies readonly StartupScreen[];

const commandScreens = {
	cal: 'calendar',
	find: 'find',
	mood: 'mood-tracker',
	new: 'new-entry',
} as const;

type StartupCommand = keyof typeof commandScreens;

type ResolveCliStartupInput = {
	readonly command?: string;
	readonly cwd: string;
	readonly directory?: string;
	readonly hasCurrentProjectConfig: boolean;
	readonly screen?: string;
};

export const isStartupScreen = (
	value: string | undefined,
): value is StartupScreen => {
	if (typeof value !== 'string') {
		return false;
	}

	for (const screenName of screens) {
		if (screenName === value) {
			return true;
		}
	}

	return false;
};

const isStartupCommand = (value: string | undefined): value is StartupCommand =>
	typeof value === 'string' && Object.hasOwn(commandScreens, value);

export const resolveCliStartup = ({
	command,
	cwd,
	directory,
	hasCurrentProjectConfig,
	screen,
}: ResolveCliStartupInput) => {
	const screenFlag = isStartupScreen(screen) ? screen : undefined;
	const commandScreen = isStartupCommand(command)
		? commandScreens[command]
		: undefined;
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
		screen: shouldStartInit ? 'init' : (screenFlag ?? commandScreen ?? 'home'),
	};
};
