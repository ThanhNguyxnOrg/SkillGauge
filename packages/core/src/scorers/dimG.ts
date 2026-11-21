import { ParsedMarkdown } from '../types.js';

/**
 * Dimension G: Syntax, Structure & Metadata (15 Scorer Functions)
 */

/**
 * G1: Frontmatter Integrity
 */
export function scoreG1(parsed: ParsedMarkdown): number {
  return parsed.metadata && Object.keys(parsed.metadata).length > 0 ? 1.0 : 0.0;
}

/**
 * G2: Required Frontmatter Fields (name + substantive description)
 */
export function scoreG2(parsed: ParsedMarkdown): number {
  if (!parsed.metadata) return 0.0;
  const name = parsed.metadata.name ? String(parsed.metadata.name).trim() : '';
  const desc = parsed.metadata.description ? String(parsed.metadata.description).trim() : '';
  if (!name || !desc) return 0.0;
  if (desc.length < 12) return 0.6;
  return 1.0;
}

/**
 * G3: Heading Hierarchy Correctness
 * Checks for structured headings and penalizes skipped heading levels (e.g. H1 -> H3).
 */
export function scoreG3(parsed: ParsedMarkdown): number {
  if (parsed.headings.length === 0) return 0.5;
  if (parsed.headings.length === 1) return 0.85;

  let structuralJumps = 0;
  for (let i = 1; i < parsed.headings.length; i++) {
    const prev = parsed.headings[i - 1].level;
    const curr = parsed.headings[i].level;
    if (curr - prev > 1) {
      structuralJumps++;
    }
  }
  return Math.max(0.3, 1.0 - 0.25 * structuralJumps);
}

/**
 * G4: List Syntax Validity (prose only)
 */
export function scoreG4(parsed: ParsedMarkdown): number {
  const lines = parsed.proseText.split(/\r?\n/).map(l => l.trim());
  let invalidLists = 0;
  for (const line of lines) {
    if (/^([*+-]|\d+\.)\s*([*+-]|\d+\.)\s+/.test(line)) {
      invalidLists++;
    }
  }
  return Math.max(0.5, 1.0 - 0.15 * invalidLists);
}

/**
 * G5: Code Block Language Spec (uses parser-extracted fence languages)
 */
export function scoreG5(parsed: ParsedMarkdown): number {
  const langs = parsed.codeBlockLangs || [];
  if (langs.length === 0) return 1.0;

  let missingLang = 0;
  for (const lang of langs) {
    if (!lang || lang.trim() === '') {
      missingLang++;
    }
  }
  return Math.max(0.3, 1.0 - missingLang / langs.length);
}

/**
 * G6: Broken Link Detector (prose only)
 */
export function scoreG6(parsed: ParsedMarkdown): number {
  const links = [...parsed.proseText.matchAll(/\[[^\]]*\]\(([^)]*)\)/g)].map(m => m[1]);
  if (links.length === 0) return 1.0;

  let broken = 0;
  for (const link of links) {
    const trimmed = link.trim();
    if (trimmed === '' || trimmed.includes('broken-link') || /\bTODO\b/.test(trimmed)) {
      broken++;
    }
  }
  return 1.0 - broken / links.length;
}

/**
 * G7: Empty Section Penalty (Fixed: uses parser-extracted sections; allows parent headings followed immediately by subheadings)
 */
export function scoreG7(parsed: ParsedMarkdown): number {
  const sections = parsed.sections || [];
  if (sections.length === 0) return 0.7;

  let emptySections = 0;
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const next = sections[i + 1];
    // A parent heading immediately introducing a deeper sub-section (e.g. # Title \n ## Overview) is valid
    if (next && next.level > sec.level && sec.body.trim().length === 0) {
      continue;
    }
    const words = sec.body.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      emptySections++;
    }
  }

  return Math.max(0.4, 1.0 - emptySections / sections.length);
}

/**
 * G8: HTML Entity / Tag Validation (prose only; ignores inline code and math comparisons like `a < b` or `< 5`)
 */
export function scoreG8(parsed: ParsedMarkdown): number {
  const text = parsed.proseText.replace(/`[^`\n]+`/g, ' ');
  // Flag unclosed/malformed angle brackets attached to tag-like names (not `< 5`, `<=`, or valid `<tag>`)
  const malformed = text.match(/<[a-zA-Z][a-zA-Z0-9_\-]*\s[^>]*$/gm);
  const count = malformed ? malformed.length : 0;
  return Math.max(0.5, 1.0 - 0.15 * count);
}

/**
 * G9: Formatting Consistency
 */
export function scoreG9(parsed: ParsedMarkdown): number {
  const excessiveBlanks = parsed.bodyText.match(/\n{4,}/g);
  const count = excessiveBlanks ? excessiveBlanks.length : 0;
  return Math.max(0.6, 1.0 - 0.1 * count);
}

/**
 * G10: UTF-8 Encoding Compliance
 */
export function scoreG10(parsed: ParsedMarkdown): number {
  return parsed.rawText.includes('\uFFFD') ? 0.0 : 1.0;
}

/**
 * G11: YAML Schema Validation
 */
export function scoreG11(parsed: ParsedMarkdown): number {
  if (!parsed.metadata) return 1.0;
  const tests = parsed.metadata.tests;
  if (tests === undefined) return 1.0;
  if (!Array.isArray(tests)) return 0.0;
  return tests.length > 0 ? 1.0 : 0.5;
}

/**
 * G12: Code Block Closure Integrity (uses parser state directly)
 */
export function scoreG12(parsed: ParsedMarkdown): number {
  return parsed.unclosedCodeBlock ? 0.2 : 1.0;
}

/**
 * G13: Inline Code Block Density (prose only, fenced code excluded)
 */
export function scoreG13(parsed: ParsedMarkdown): number {
  const text = parsed.proseText;
  const matches = text.match(/`[^`\n]+`/g);
  const count = matches ? matches.length : 0;
  const wordCount = text.split(/\s+/).filter(Boolean).length || 1;
  const ratio = count / wordCount;
  return ratio > 0.18 ? Math.max(0.35, 1.0 - (ratio - 0.18) * 4) : 1.0;
}

/**
 * G14: URL Protocol Safety (ignores localhost/127.0.0.1 dev links)
 */
export function scoreG14(parsed: ParsedMarkdown): number {
  const insecure = parsed.proseText.match(/\[[^\]]*\]\(http:\/\/(?!localhost\b|127\.0\.0\.1\b)[^)]*\)/gi);
  return insecure ? Math.max(0.4, 1.0 - 0.2 * insecure.length) : 1.0;
}

/**
 * G15: Blockquote Nesting Depth (prose only)
 */
export function scoreG15(parsed: ParsedMarkdown): number {
  const matches = parsed.proseText.match(/^>\s*>\s*>/gm);
  return matches ? Math.max(0.3, 1.0 - 0.25 * matches.length) : 1.0;
}
