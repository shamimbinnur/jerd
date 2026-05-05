import { promises as fs } from 'fs';

/**
 * Parses YAML frontmatter from markdown content
 * @param {string} content - Raw markdown file content
 * @returns {Object} - Parsed frontmatter as object, empty object if none
 */
export function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return {};
  }

  const frontmatterStr = match[1];
  const result = {};

  // Simple YAML parsing for flat key-value pairs
  const lines = frontmatterStr.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Handle array values like [daily, reflection]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map(v => v.trim());
      }

      result[key] = value;
    }
  }

  return result;
}

/**
 * Extracts mood from a journal file
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<string|null>} - Mood value or null
 */
export async function extractMoodFromFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const frontmatter = parseFrontmatter(content);
    return frontmatter.mood || null;
  } catch {
    return null;
  }
}
