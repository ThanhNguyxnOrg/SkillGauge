import { parse as parseYaml } from 'yaml';
import { ParsedMarkdown, SkillMetadata } from '../types.js';

export function parseMarkdown(content: string): ParsedMarkdown {
  const metadata: SkillMetadata = {};
  const headings: { level: number; text: string }[] = [];
  const listDepths: number[] = [];
  const codeBlocks: string[] = [];

  let yamlContent = '';
  let inYaml = false;
  let inCode = false;
  let currentCode = '';

  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    // Frontmatter parsing
    if (line.trim() === '---') {
      if (!inYaml && yamlContent === '') {
        inYaml = true;
        continue;
      } else if (inYaml) {
        inYaml = false;
        try {
          Object.assign(metadata, parseYaml(yamlContent));
        } catch {}
        continue;
      }
    }

    if (inYaml) {
      yamlContent += line + '\n';
      continue;
    }

    // Code blocks parsing
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        inCode = true;
        currentCode = '';
      } else {
        inCode = false;
        codeBlocks.push(currentCode.trim());
      }
      continue;
    }

    if (inCode) {
      currentCode += line + '\n';
      continue;
    }

    // Headings parsing
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      headings.push({
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      });
      continue;
    }

    // List indentation depth
    const listMatch = line.match(/^(\s*)([*+-]|\d+\.)\s+/);
    if (listMatch) {
      const depth = listMatch[1].length;
      if (depth > 0) {
        listDepths.push(depth);
      }
    }
  }

  return {
    metadata,
    headings,
    listDepths,
    codeBlocks,
    rawText: content,
  };
}
