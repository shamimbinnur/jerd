import {access, mkdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const configFileName = 'jerd.config.json';

type ProjectConfigInput = {
	readonly directory: string;
	readonly editor: string;
	readonly name: string;
	readonly now?: Date;
};

type ConfigRecord = Record<string, unknown>;
export type ProjectConfig = ConfigRecord & {
	readonly editor?: string;
	readonly name?: string;
};

const isConfigRecord = (value: unknown): value is ConfigRecord =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const isNotFoundError = (error: unknown) =>
	isConfigRecord(error) && 'code' in error && error['code'] === 'ENOENT';

const readExistingConfig = async (
	configPath: string,
): Promise<ProjectConfig> => {
	try {
		const content = await readFile(configPath, 'utf8');
		const config = JSON.parse(content) as unknown;

		return isConfigRecord(config) ? config : {};
	} catch (error: unknown) {
		if (isNotFoundError(error)) {
			return {};
		}

		throw error;
	}
};

export const getProjectConfigPath = (directory: string) =>
	join(directory, configFileName);

export const hasProjectConfig = async (directory: string) => {
	try {
		await access(getProjectConfigPath(directory));

		return true;
	} catch (error: unknown) {
		if (isNotFoundError(error)) {
			return false;
		}

		throw error;
	}
};

export const loadProjectConfig = async (directory: string) =>
	readExistingConfig(getProjectConfigPath(directory));

export const writeProjectConfig = async ({
	directory,
	editor,
	name,
	now = new Date(),
}: ProjectConfigInput) => {
	const configPath = getProjectConfigPath(directory);
	const existingConfig = await readExistingConfig(configPath);
	const timestamp = now.toISOString();
	const config = {
		...existingConfig,
		name: name.trim(),
		editor,
		createdAt:
			typeof existingConfig['createdAt'] === 'string'
				? existingConfig['createdAt']
				: timestamp,
		updatedAt: timestamp,
	};

	await mkdir(directory, {recursive: true});
	await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

	return config;
};
