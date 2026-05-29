import {relative, resolve} from 'node:path';

const defaultProjectDirectoryName = 'jerd';

type ResolveInitTargetInput = {
	readonly cwd: string;
	readonly directory?: string;
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
		cdCommand: `cd ${relativeDirectory}`,
		configDirectory,
	};
};
