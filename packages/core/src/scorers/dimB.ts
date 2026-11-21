import { ParsedMarkdown } from '../types.js';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'to', 'for', 'in', 'on', 'at', 'of', 'by',
  'with', 'is', 'are', 'was', 'were', 'be', 'been', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its',
  'our', 'their', 'as', 'so', 'then', 'there', 'here', 'when', 'how', 'why', 'who'
]);

const HTML_VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr'
]);

function getBody(input: string | ParsedMarkdown): string {
  return typeof input === 'string' ? input : input.bodyText;
}

function getProse(input: string | ParsedMarkdown): string {
  return typeof input === 'string' ? input : input.proseText;
}

function getRaw(input: string | ParsedMarkdown): string {
  return typeof input === 'string' ? input : input.rawText;
}

function getWords(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * B1: Token Friction Weight
 * Sweet spot: 80..2000 tokens -> 1.0. Penalizes under-specified (< 60) and bloated (> 2000) prompts.
 */
export function scoreB1(input: string | ParsedMarkdown): number {
  const words = getWords(getBody(input)).length;
  const tokens = Math.ceil(words * 1.3);

  if (tokens < 60) {
    return Math.max(0.2, (tokens / 60) * 0.7);
  }
  if (tokens <= 2000) return 1.0;
  return Math.max(0.25, 1.0 - 0.75 * Math.min(1.0, (tokens - 2000) / 4500));
}

/**
 * B2: Information Density
 * Content-word ratio in prose, normalized against natural English (~65% content words = 1.0).
 */
export function scoreB2(input: string | ParsedMarkdown): number {
  const words = getWords(getProse(input));
  if (words.length === 0) return 0.0;
  const contentWords = words.filter(w => !STOP_WORDS.has(w.replace(/[^a-z]/g, ''))).length;
  const ratio = contentWords / words.length;
  return Math.min(1.0, ratio / 0.65);
}

/**
 * B3: Lost-in-the-Middle Guard (Fixed denominator)
 * Penalizes only when critical directives are disproportionately concentrated in the middle [0.35..0.65].
 */
export function scoreB3(input: string | ParsedMarkdown): number {
  const prose = getProse(input);
  const sentences = prose.split(/[.!?\n]/).map(s => s.trim()).filter(Boolean);
  if (sentences.length < 4) return 1.0;

  const critical = /\b(must|never|strictly|prohibited|do not|required|shall|rules|objective|important|critical)\b/gi;
  let totalCritical = 0;
  let middlePenaltySum = 0;

  sentences.forEach((sentence, index) => {
    if (critical.test(sentence)) {
      critical.lastIndex = 0;
      totalCritical++;
      const pos = index / sentences.length;
      const distToMiddle = Math.abs(pos - 0.5);
      if (distToMiddle < 0.15) {
        middlePenaltySum += (0.15 - distToMiddle) / 0.15;
      }
    }
  });

  if (totalCritical === 0) return 0.85;
  const middleConcentration = middlePenaltySum / totalCritical;
  if (middleConcentration <= 0.35) return 1.0;
  return Math.max(0.3, 1.0 - (middleConcentration - 0.35) * 1.1);
}

/**
 * B4: Nested List Depth (Fixed: uses true logical nesting levels, not raw space count)
 */
export function scoreB4(parsed: ParsedMarkdown): number {
  const levels = parsed.listNestingLevels || [];
  if (levels.length === 0) return 1.0;
  const maxLevel = Math.max(...levels);
  if (maxLevel <= 3) return 1.0;
  return Math.max(0.2, 1.0 - 0.2 * (maxLevel - 3));
}

/**
 * B5: Reference Validity
 * Validates syntactic cleanliness of relative file links in prose.
 */
export function scoreB5(input: string | ParsedMarkdown): number {
  const prose = getProse(input);
  const links = [...prose.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)]
    .map(m => m[1].trim())
    .filter(t => !/^https?:\/\//i.test(t) && !t.startsWith('#') && !t.startsWith('mailto:'));

  if (links.length === 0) return 1.0;

  let broken = 0;
  for (const link of links) {
    if (link.includes('//') || link.includes('\\') || link.includes(' ')) {
      broken++;
    }
  }
  return 1.0 - broken / links.length;
}

/**
 * B6: Code & Example Density
 * Targets 8%..55% code/example ratio for practical agent skills.
 */
export function scoreB6(input: string | ParsedMarkdown): number {
  const body = getBody(input);
  const totalWords = getWords(body).length;
  if (totalWords === 0) return 0.5;

  let codeWords = 0;
  if (typeof input !== 'string' && input.codeBlocks.length > 0) {
    for (const block of input.codeBlocks) {
      codeWords += getWords(block).length;
    }
  } else {
    const codeMatches = body.match(/```[\s\S]*?```/g) || [];
    for (const block of codeMatches) {
      codeWords += getWords(block).length;
    }
  }

  const ratio = codeWords / totalWords;
  if (ratio >= 0.08 && ratio <= 0.55) return 1.0;
  if (ratio < 0.08) return 0.55 + (ratio / 0.08) * 0.45;
  return Math.max(0.25, 1.0 - 1.5 * (ratio - 0.55));
}

/**
 * B7: XML Wrapper Tag Matching (Fixed: prose-only, ignores inline code, void HTML tags & TS generics)
 */
export function scoreB7(input: string | ParsedMarkdown): number {
  const prose = getProse(input).replace(/`[^`\n]+`/g, ' ');
  // Ignore TypeScript/Java generics like Array<string>, Map<string, number>, Promise<void>
  const withoutGenerics = prose.replace(/\b[A-Z][a-zA-Z0-9_]*<[^>\n]+>/g, ' ');

  const openTags = [...withoutGenerics.matchAll(/<([a-z][a-zA-Z0-9_\-]*)(?:\s[^>]*)?>/g)]
    .map(m => m[1].toLowerCase())
    .filter(t => !HTML_VOID_TAGS.has(t));
  const closeTags = [...withoutGenerics.matchAll(/<\/([a-z][a-zA-Z0-9_\-]*)>/g)]
    .map(m => m[1].toLowerCase())
    .filter(t => !HTML_VOID_TAGS.has(t));

  if (openTags.length === 0 && closeTags.length === 0) return 1.0;

  const tagCounts = new Map<string, number>();
  for (const t of openTags) {
    tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
  }
  for (const t of closeTags) {
    tagCounts.set(t, (tagCounts.get(t) || 0) - 1);
  }

  let mismatches = 0;
  for (const val of tagCounts.values()) {
    if (val !== 0) mismatches += Math.abs(val);
  }
  return mismatches === 0 ? 1.0 : Math.max(0.2, 1.0 - 0.2 * mismatches);
}

/**
 * B8: Schema & Input/Output Contract Completeness
 */
export function scoreB8(input: string | ParsedMarkdown): number {
  const text = getBody(input).toLowerCase();
  const declaresSchema = /\b(schema|json|yaml|parameters?|fields?|interface|type)\b/.test(text);
  if (!declaresSchema) return 0.75;

  const hasProperties = /\b(properties|params|fields|keys|columns|arguments)\b/.test(text);
  const hasRequired = /\b(required|mandatory|optional|must include)\b/.test(text);
  const hasDesc = /\b(description|format|example|type|structure)\b/.test(text);

  let score = 0.4;
  if (hasProperties) score += 0.2;
  if (hasRequired) score += 0.2;
  if (hasDesc) score += 0.2;
  return score;
}

/**
 * B9: Context Pruning & Scope Hygiene Directives
 */
export function scoreB9(input: string | ParsedMarkdown): number {
  const text = getProse(input);
  const pruneKeywords = /\b(forget|clear memory|ignore past|reset history|flush context|prune|focus only|relevant files|minimal context|progressive disclosure|load on demand|scope|compact)\b/gi;
  return pruneKeywords.test(text) ? 1.0 : 0.55;
}

/**
 * B10: Variable Allocation (Fixed: verifies {{var}} is documented outside the template tag itself)
 */
export function scoreB10(input: string | ParsedMarkdown): number {
  const raw = getRaw(input);
  const vars = [...new Set([...raw.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)].map(m => m[1]))];
  if (vars.length === 0) return 0.9;

  // Strip all {{var}} template occurrences before checking whether the variable is documented
  const stripped = raw.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, ' ').toLowerCase();
  let defined = 0;
  for (const v of vars) {
    const vLower = v.toLowerCase();
    const spaced = vLower.replace(/_/g, ' ');
    if (stripped.includes(vLower) || stripped.includes(spaced)) {
      defined++;
    }
  }
  return defined / vars.length;
}

/**
 * B11: Observability & Reporting Directives
 */
export function scoreB11(input: string | ParsedMarkdown): number {
  const text = getProse(input);
  const logMatches = text.match(/\b(log|logs|record state|print status|diagnostic|report|summary|explain|trace|output)\b/gi);
  const count = logMatches ? logMatches.length : 0;
  return Math.min(1.0, 0.4 + count * 0.2);
}

/**
 * B12: Checkpoint & Verification Directives
 */
export function scoreB12(input: string | ParsedMarkdown): number {
  const text = getProse(input);
  const checkMatches = text.match(/\b(save|checkpoint|check-point|commit|record progress|verify|validate|test|confirm|assert|review)\b/gi);
  const count = checkMatches ? checkMatches.length : 0;
  return Math.min(1.0, 0.4 + count * 0.2);
}

/**
 * B13: Redundancy Line Penalty (prose only)
 */
export function scoreB13(input: string | ParsedMarkdown): number {
  const lines = getProse(input)
    .split(/\r?\n/)
    .map(l => l.trim().toLowerCase())
    .filter(l => l.length > 12 && !/^[-|:\s]+$/.test(l));
  if (lines.length === 0) return 1.0;
  const uniqueLines = new Set(lines);
  const dupCount = lines.length - uniqueLines.size;
  return Math.max(0.15, 1.0 - (dupCount / lines.length) * 2.0);
}

/**
 * B14: Stop-Word Saturation (prose only; natural English <= 42% stop words = 1.0)
 */
export function scoreB14(input: string | ParsedMarkdown): number {
  const words = getWords(getProse(input));
  if (words.length === 0) return 1.0;

  let stopWordsCount = 0;
  for (const w of words) {
    const cleanWord = w.replace(/[^a-z]/g, '');
    if (STOP_WORDS.has(cleanWord)) stopWordsCount++;
  }

  const ratio = stopWordsCount / words.length;
  if (ratio <= 0.42) return 1.0;
  return Math.max(0.2, 1.0 - (ratio - 0.42) * 2.5);
}

/**
 * B15: Context & Budget Awareness
 */
export function scoreB15(input: string | ParsedMarkdown): number {
  const text = getProse(input);
  const historyKeywords = /\b(context window|history limit|max turns|token budget|session context|concise|brief|focused|limit|bounded|chunk|cap|budget)\b/gi;
  return historyKeywords.test(text) ? 1.0 : 0.55;
}
