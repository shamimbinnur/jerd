import { promises as fs } from 'fs';
import { join } from 'path';
import { getJerdPath } from './file-system.js';
import { notInitializedBanner } from './ui.js';

export async function loadConfig(options = { exitOnError: true }) {
  const jerdPath = getJerdPath();
  const configPath = join(jerdPath, 'jerd.config.js');

  try {
    const content = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(content);
    // Set default uiStyle to 'astro' for backward compatibility
    if (!config.uiStyle) {
      config.uiStyle = 'astro';
    }
    if (!config.theme) {
      config.theme = 'cozy';
    }
    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      if (options.exitOnError) {
        notInitializedBanner();
        process.exit(1);
      } else {
        return null; // Return null if config missing and not exiting
      }
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
