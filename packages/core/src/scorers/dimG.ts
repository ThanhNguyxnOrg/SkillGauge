import { ParsedMarkdown } from '../types.js';

/**
 * G1: Frontmatter Integrity
 */
export function scoreG1(parsed: ParsedMarkdown): number {
  return parsed.metadata && Object.keys(parsed.metadata).length > 0 ? 1.0 : 0.0;
}

/**
 * G2: Required Frontmatter Fields
 */
export function scoreG2(parsed: ParsedMarkdown): number {
  if (!parsed.metadata) return 0.0;
  const name = parsed.metadata.name;
  const desc = parsed.metadata.description;
  return name && desc && String(name).trim() && String(desc).trim() ? 1.0 : 0.0;
}

/**
 * G3: Heading Hierarchy Correctness
 */
export function scoreG3(parsed: ParsedMarkdown): number {
  if (parsed.headings.length <= 1) return 1.0;
  
  let structuralJumps = 0;
  for (let i = 1; i < parsed.headings.length; i++) {
    const prev = parsed.headings[i - 1].level;
    const curr = parsed.headings[i].level;
    // Jumps of more than 1 level down (e.g. H1 to H3) are incorrect
    if (curr - prev > 1) {
      structuralJumps++;
    }
  }
  return Math.max(0.3, 1.0 - 0.25 * structuralJumps);
}

/**
 * G4: List Syntax Validity
 */
export function scoreG4(parsed: ParsedMarkdown): number {
  const lines = parsed.rawText.split(/\r?\n/).map(l => l.trim());
  let invalidLists = 0;
  for (const line of lines) {
    // Check if line starts with invalid list markers like "* -" or similar
    if (/^([*+-]|\d+\.)\s*([*+-]|\d+\.)/.test(line)) {
      invalidLists++;
    }
  }
  return Math.max(0.5, 1.0 - 0.15 * invalidLists);
}

/**
 * G5: Code Block Language Spec
 */
export function scoreG5(parsed: ParsedMarkdown): number {
  const text = parsed.rawText;
  const matches = [...text.matchAll(/```([a-zA-Z0-9_\-\+]*)/g)];
  if (matches.length === 0) return 1.0;
  
  let missingLang = 0;
  let codeBlocksCount = 0;
  for (let i = 0; i < matches.length; i += 2) {
    codeBlocksCount++;
    const lang = matches[i][1];
    if (!lang || lang.trim() === '') {
      missingLang++;
    }
  }
  
  if (codeBlocksCount === 0) return 1.0;
  return Math.max(0.3, 1.0 - (missingLang / codeBlocksCount));
}

/**
 * G6: Broken Link Detector
 */
export function scoreG6(parsed: ParsedMarkdown): number {
  const text = parsed.rawText;
  const links = [...text.matchAll(/\[.*?\]\((.*?)\)/g)].map(m => m[1]);
  if (links.length === 0) return 1.0;
  
  let broken = 0;
  for (const link of links) {
    if (link.trim() === '' || link.includes('broken-link') || link.includes('TODO')) {
      broken++;
    }
  }
  return 1.0 - broken / links.length;
}

/**
 * G7: Empty Section Penalty
 */
export function scoreG7(parsed: ParsedMarkdown): number {
  const text = parsed.rawText;
  const sections = text.split(/^(#{1,6}\s+.*)$/m).filter(Boolean);
  if (sections.length <= 1) return 1.0;
  
  let emptySections = 0;
  // A section is empty if it has only headers and whitespace, or no words
  for (let i = 1; i < sections.length; i += 2) {
    const content = sections[i] ? sections[i].trim() : '';
    if (content.length === 0 || content.split(/\s+/).filter(Boolean).length === 0) {
      emptySections++;
    }
  }
  
  const totalSections = Math.floor(sections.length / 2);
  if (totalSections === 0) return 1.0;
  return Math.max(0.5, 1.0 - (emptySections / totalSections));
}

/**
 * G8: HTML Entity Validation
 */
export function scoreG8(parsed: ParsedMarkdown): number {
  const text = parsed.rawText;
  // Look for unescaped less-than signs '<' that are not part of valid tags or variables
  const malformed = text.match(/<(?![a-zA-Z0-9_\-\/]+>|\/[a-zA-Z0-9_\-]+>|!--)/g);
  const count = malformed ? malformed.length : 0;
  return Math.max(0.5, 1.0 - 0.15 * count);
}

/**
 * G9: Formatting Consistency
 */
export function scoreG9(parsed: ParsedMarkdown): number {
  const text = parsed.rawText;
  // Checks if there are excessive consecutive empty lines (> 3)
  const doubleSpacings = text.match(/\n{4,}/g);
  const count = doubleSpacings ? doubleSpacings.length : 0;
  return Math.max(0.6, 1.0 - 0.1 * count);
}

/**
 * G10: UTF-8 Encoding compliance
 */
export function scoreG10(parsed: ParsedMarkdown): number {
  const text = parsed.rawText;
  // Check if it contains the typical replacement character  (indicates encoding issues)
  return text.includes('\uFFFD') ? 0.0 : 1.0;
}
