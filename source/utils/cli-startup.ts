import {resolveInitTarget} from './init-target.js';

export type StartupScreen =
	| 'calendar'
	| 'confirmation'
	| 'dashboard'
	| 'farewell'
	| 'find'
	| 'home'
	| 'init'
	| 'loading'
	| 'new-entry'
	| 'mood-tracker'
	| 'project-init'
	| 'success';

const screens = [
	'calendar',
	'confirmation',
	'dashboard',
	'farewell',
	'find',
	'home',
	'init',
	'loading',
	'new-entry',
	'mood-tracker',
	'project-init',
	'success',
] as const satisfies readonly StartupScreen[];

const commandScreens = {
	cal: 'calendar',
	find: 'find',
	mood: 'mood-tracker',
	new: 'new-entry',
} as const;

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
	const commandScreen =
		command && command in commandScreens
			? commandScreens[command as keyof typeof commandScreens]
			: undefined;
	const shouldStartInit =
		command === 'init' ||
		(!screenFlag && !commandScreen && !hasCurrentProjectConfig);
	const initTarget = shouldStartInit
		? resolveInitTarget({
				cwd,
				directory: command === 'init' ? directory : undefined,
		  })
		: undefined;

	return {
		configDirectory: initTarget?.configDirectory ?? cwd,
		postInitCdCommand: initTarget?.cdCommand,
		screen: shouldStartInit ? 'init' : screenFlag ?? commandScreen ?? 'home',
	};
};
