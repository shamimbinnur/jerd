import { promises as fs, accessSync } from "fs";
import { join, resolve } from "path";

export async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

/**
 * Traverses up the directory tree to find the project root containing jerd.config.js
 * Limited to 3 levels up to avoid unnecessary filesystem traversal
 * @param {string} startDir - Directory to start searching from (defaults to process.cwd())
 * @returns {string|null} - Path to project root, or null if not found
 */
function findProjectRoot(startDir = process.cwd()) {
  let currentDir = resolve(startDir);
  const maxLevels = 3; // Supports: item (0), month (1), year (2), jerd root (3)

  for (let level = 0; level <= maxLevels; level++) {
    const configPath = join(currentDir, "jerd.config.js");

    // Synchronously check if config exists in current directory
    try {
      accessSync(configPath);
      return currentDir; // Found it!
    } catch {
      // Config not found, continue traversing
    }

    // If we've checked maxLevels, stop
    if (level === maxLevels) {
      return null; // Not found within allowed range
    }

    // Move up one directory
    const parentDir = resolve(currentDir, "..");

    // Safety check: prevent infinite loop and check for filesystem root
    if (parentDir === currentDir) {
      return null;
    }

    currentDir = parentDir;
  }

  return null;
}

export function getJerdPath(projectPath = null) {
  // If path is '.', use current directory directly (don't create subdirectory)
  if (projectPath === ".") {
    return process.cwd();
  }

  // If no path provided, find project root via parent directory traversal
  if (!projectPath) {
    const projectRoot = findProjectRoot();

    if (projectRoot) {
      // Found jerd.config.js in this directory or a parent (within 3 levels)
      return projectRoot;
    }

    // Not found - fallback to legacy behavior (./jerd subdirectory)
    // This maintains backward compatibility
    return join(process.cwd(), "jerd");
  }

  // Otherwise resolve the provided path and use it directly
  // When user specifies a custom directory name, that directory IS the jerd project
  return resolve(projectPath);
}

export async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
