import {resolveInitTarget} from './init-target.js';
import {parseJournalMood} from './journal-frontmatter.js';

export type StartupScreen =
	| 'calendar'
	| 'find'
	| 'home'
	| 'init'
	| 'mood-check-in'
	| 'new-entry'
	| 'mood-tracker'
	| 'project-init';

const screens = [
	'calendar',
	'find',
	'home',
	'init',
	'mood-check-in',
	'new-entry',
	'mood-tracker',
	'project-init',
] as const satisfies readonly StartupScreen[];

const commandScreens = {
	cal: 'calendar',
	find: 'find',
	mood: 'mood-tracker',
	new: 'mood-check-in',
} as const;

type StartupCommand = keyof typeof commandScreens;

type ResolveCliStartupInput = {
	readonly command?: string;
	readonly cwd: string;
	readonly directory?: string;
	readonly findQueryParts?: readonly string[];
	readonly hasCurrentProjectConfig: boolean;
	readonly mood?: string;
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

const resolveInitialFindQuery = (
	command: string | undefined,
	findQueryParts: readonly string[],
) => {
	if (command !== 'find') {
		return undefined;
	}

	return findQueryParts.join(' ').trim().replaceAll(/\s+/gv, ' ') || undefined;
};

const resolveInitialMood = (
	command: string | undefined,
	moodFlag: string | undefined,
) => (command === 'new' && moodFlag ? parseJournalMood(moodFlag) : undefined);

const resolveInvalidMood = (
	command: string | undefined,
	initialMood: string | undefined,
	moodFlag: string | undefined,
) => (command === 'new' && moodFlag && !initialMood ? moodFlag : undefined);

export const resolveCliStartup = ({
	command,
	cwd,
	directory,
	findQueryParts = [],
	hasCurrentProjectConfig,
	mood,
	screen,
}: ResolveCliStartupInput) => {
	const screenFlag = isStartupScreen(screen) ? screen : undefined;
	const moodFlag = typeof mood === 'string' ? mood.trim() : undefined;
	const initialMood = resolveInitialMood(command, moodFlag);
	const invalidMood = resolveInvalidMood(command, initialMood, moodFlag);
	const commandScreen = isStartupCommand(command)
		? commandScreens[command]
		: undefined;
	const initialFindQuery = resolveInitialFindQuery(command, findQueryParts);
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
		initialFindQuery,
		initialMood,
		invalidMood,
		postInitCdCommand: initTarget?.cdCommand,
		screen: shouldStartInit
			? 'init'
			: (screenFlag ?? (initialMood ? 'new-entry' : commandScreen) ?? 'home'),
	};
};
