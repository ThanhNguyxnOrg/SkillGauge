import { parse as parseYaml } from 'yaml';
import { MarkdownSection, ParsedMarkdown, SkillMetadata } from '../types.js';

export function parseMarkdown(content: string): ParsedMarkdown {
  const metadata: SkillMetadata = {};
  const headings: { level: number; text: string }[] = [];
  const listDepths: number[] = [];
  const listNestingLevels: number[] = [];
  const codeBlocks: string[] = [];
  const codeBlockLangs: string[] = [];
  const sections: MarkdownSection[] = [];

  const bodyLines: string[] = [];
  const proseLines: string[] = [];

  let yamlContent = '';
  let inYaml = false;
  let yamlDone = false;
  let inCode = false;
  let codeFenceMarker = '```';
  let currentCode = '';
  let currentSection: MarkdownSection | null = null;
  let indentStack: number[] = [];

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Frontmatter parsing (only at the very start of the document)
    if (!yamlDone && trimmed === '---') {
      if (!inYaml && yamlContent === '' && bodyLines.every(l => l.trim() === '')) {
        inYaml = true;
        continue;
      } else if (inYaml) {
        inYaml = false;
        yamlDone = true;
        try {
          const parsedYaml = parseYaml(yamlContent);
          if (parsedYaml && typeof parsedYaml === 'object') {
            Object.assign(metadata, parsedYaml);
          }
        } catch {}
        continue;
      }
    }

    if (inYaml) {
      yamlContent += line + '\n';
      continue;
    }

    if (!yamlDone && trimmed !== '') {
      yamlDone = true;
    }

    bodyLines.push(line);

    // Code blocks parsing (supports ``` and ~~~ fences)
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})([a-zA-Z0-9_\-\+\.]*)/);
    if (fenceMatch) {
      if (!inCode) {
        inCode = true;
        codeFenceMarker = fenceMatch[1][0].repeat(fenceMatch[1].length);
        codeBlockLangs.push((fenceMatch[2] || '').trim());
        currentCode = '';
        if (currentSection) {
          currentSection.body += line + '\n';
        }
        continue;
      } else if (
        trimmed.startsWith(codeFenceMarker) &&
        trimmed.slice(codeFenceMarker.length).trim() === ''
      ) {
        inCode = false;
        codeBlocks.push(currentCode.trim());
        if (currentSection) {
          currentSection.body += line + '\n';
        }
        continue;
      }
    }

    if (inCode) {
      currentCode += line + '\n';
      if (currentSection) {
        currentSection.body += line + '\n';
      }
      continue;
    }

    proseLines.push(line);

    // Headings parsing
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      headings.push({ level, text });
      currentSection = { heading: text, level, body: '' };
      sections.push(currentSection);
      indentStack = [];
      continue;
    }

    if (currentSection) {
      currentSection.body += line + '\n';
    }

    // List indentation depth & true logical nesting level
    const listMatch = line.match(/^(\s*)([*+-]|\d+\.)\s+/);
    if (listMatch) {
      const spaces = listMatch[1].replace(/\t/g, '  ').length;
      if (spaces > 0) {
        listDepths.push(spaces);
      }
      // Track logical nesting stack
      while (indentStack.length > 0 && spaces <= indentStack[indentStack.length - 1]) {
        indentStack.pop();
      }
      if (indentStack.length === 0 || spaces > indentStack[indentStack.length - 1]) {
        indentStack.push(spaces);
      }
      listNestingLevels.push(indentStack.length);
    } else if (trimmed === '') {
      indentStack = [];
    }
  }

  return {
    metadata,
    headings,
    listDepths,
    listNestingLevels,
    codeBlocks,
    codeBlockLangs,
    unclosedCodeBlock: inCode,
    sections,
    bodyText: bodyLines.join('\n'),
    proseText: proseLines.join('\n'),
    rawText: content,
  };
}
