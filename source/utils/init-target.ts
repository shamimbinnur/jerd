import {relative, resolve} from 'node:path';

const defaultProjectDirectoryName = 'jerd';
const shellSafePathCharacters = new Set([
	'.',
	'/',
	'-',
	'_',
	...'0123456789',
	...'abcdefghijklmnopqrstuvwxyz',
	...'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
]);

type ResolveInitTargetInput = {
	readonly cwd: string;
	readonly directory?: string;
};

const quoteShellPath = (path: string) => {
	if ([...path].every(character => shellSafePathCharacters.has(character))) {
		return path;
	}

	return `'${path.replaceAll("'", String.raw`'\''`)}'`;
};

export const resolveInitTarget = ({cwd, directory}: ResolveInitTargetInput) => {
	const requestedDirectory = directory?.trim();
	const projectDirectory =
		!requestedDirectory || requestedDirectory === '.'
			? defaultProjectDirectoryName
			: requestedDirectory;
	const configDirectory = resolve(cwd, projectDirectory);
	const relativeDirectory = relative(cwd, configDirectory) || '.';

	return {
		cdCommand: `cd ${quoteShellPath(relativeDirectory)}`,
		configDirectory,
	};
};
