import {access, mkdir, readFile, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const configFileName = 'jerd.config.json';
const legacyConfigFileName = 'jerd.config.js';

type ProjectConfigInput = {
	readonly directory: string;
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

const getLegacyProjectConfigPath = (directory: string) =>
	join(directory, legacyConfigFileName);

export const hasProjectConfig = async (directory: string) => {
	try {
		await access(getProjectConfigPath(directory));

		return true;
	} catch (error: unknown) {
		if (!isNotFoundError(error)) {
			throw error;
		}
	}

	try {
		await access(getLegacyProjectConfigPath(directory));

		return true;
	} catch (error: unknown) {
		if (isNotFoundError(error)) {
			return false;
		}

		throw error;
	}
};

export const loadProjectConfig = async (directory: string) => {
	const config = await readExistingConfig(getProjectConfigPath(directory));

	if (Object.keys(config).length > 0) {
		return config;
	}

	return readExistingConfig(getLegacyProjectConfigPath(directory));
};

export const writeProjectConfig = async ({
	directory,
	name,
	now = new Date(),
}: ProjectConfigInput) => {
	const configPath = getProjectConfigPath(directory);
	const existingConfig = await readExistingConfig(configPath);
	const timestamp = now.toISOString();
	const config = {
		...existingConfig,
		name: name.trim(),
		editor:
			typeof existingConfig.editor === 'string'
				? existingConfig.editor
				: 'nvim',
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
