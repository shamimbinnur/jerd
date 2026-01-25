import { promises as fs } from 'fs';
import { join } from 'path';
import { getJerdPath } from './file-system.js';

export async function loadConfig() {
  const jerdPath = getJerdPath();
  const configPath = join(jerdPath, 'jerd.config.js');

  try {
    const content = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(content);
    // Set default uiStyle to 'astro' for backward compatibility
    if (!config.uiStyle) {
      config.uiStyle = 'astro';
    }
    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('Error: No jerd project found in this directory or any parent directory.');
      console.error('Run `jerd init` to create a new journal.');
      process.exit(1);
    }
    throw error;
  }
}

export async function updateConfig(updates) {
  const jerdPath = getJerdPath();
  const configPath = join(jerdPath, 'jerd.config.js');
  const config = await loadConfig();
  const newConfig = { ...config, ...updates };
  await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
  return newConfig;
}
