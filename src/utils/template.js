import { promises as fs } from 'fs';
import { join } from 'path';
import { getJerdPath } from './file-system.js';

export async function loadTemplates() {
  const jerdPath = getJerdPath();
  const templatesPath = join(jerdPath, 'templates.json');

  try {
    const content = await fs.readFile(templatesPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading templates.json:', error.message);
    console.error('Run `jerd init` to create a new journal.');
    process.exit(1);
  }
}

export function renderTemplate(template, date, mood = null) {
  // Build frontmatter
  const frontmatterFields = [];
  frontmatterFields.push(`date: ${date.format('YYYY-MM-DD')}`);

  if (mood) {
    frontmatterFields.push(`mood: ${mood}`);
  }

  if (template.tags && template.tags.length > 0) {
    frontmatterFields.push(`tags: [${template.tags.join(', ')}]`);
  }

  const frontmatter = `---\n${frontmatterFields.join('\n')}\n---\n\n`;

  const sections = template.sections.map(section => {
    return renderSection(section, date);
  });

  return frontmatter + sections.join('\n\n') + '\n';
}

export function renderSection(section, date) {
  let title = section.title ? `## ${section.title}\n\n` : '';
  // Replace {{date}} placeholder with formatted date
  title = title.replace(/\{\{date\}\}/g, date.format('YYYY-MM-DD'));

  switch (section.type) {
    case 'auto-date':
      const format = section.format || 'YYYY-MM-DD';
      const dateStr = date.format(format);
      return `${title}${dateStr}`;

    case 'list':
      const items = section.items || [];
      if (items.length === 0) {
        return `${title}- `;
      }
      const listItems = items.map(item => `- ${item}`).join('\n');
      return `${title}${listItems}`;

    case 'text':
      const content = section.content || '';
      return `${title}${content}`;

    default:
      console.warn(`Warning: Unknown section type: ${section.type}`);
      return '';
  }
}
