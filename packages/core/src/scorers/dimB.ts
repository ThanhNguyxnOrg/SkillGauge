import { ParsedMarkdown } from '../types.js';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'to', 'for', 'in', 'on', 'at', 'of', 'by',
  'with', 'is', 'are', 'was', 'were', 'be', 'been', 'this', 'that', 'these', 'those',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its',
  'our', 'their', 'as', 'at', 'so', 'then', 'there', 'here', 'when', 'how', 'why', 'who'
]);

function getWords(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * B1: Token Friction Weight
 */
export function scoreB1(text: string): number {
  const words = getWords(text).length;
  const tokens = Math.ceil(words * 1.3);
  const T_optimal = 600;
  const T_max = 2000;

  if (tokens <= T_optimal) return 1.0;
  return Math.max(0.1, 1.0 - 0.9 * Math.pow((tokens - T_optimal) / (T_max - T_optimal), 2));
}

/**
 * B2: Information Density
 */
export function scoreB2(text: string): number {
  const words = getWords(text);
  if (words.length === 0) return 0.0;
  const contentWords = words.filter(w => !STOP_WORDS.has(w.replace(/[^a-z]/g, ''))).length;
  return contentWords / words.length;
}

/**
 * B3: Lost-in-the-Middle Parabolic Curve
 */
export function scoreB3(text: string): number {
  // Check if critical keywords are in the middle (0.35 to 0.65) relative range of text
  const words = getWords(text);
  if (words.length === 0) return 1.0;
  
  const critical = /\b(must|never|strictly|prohibited|do not|required|shall|rules|objective)\b/gi;
  let matchesCount = 0;
  let totalPenalty = 0;
  
  const sentences = text.split(/[.!?\n]/).map(s => s.trim()).filter(Boolean);
  sentences.forEach((sentence, index) => {
    const matched = sentence.match(critical);
    if (matched) {
      const pos = index / sentences.length;
      // U-shape attention curves: penalize values in middle (0.5).
      // Max penalty at 0.5. Linear or quadratic decay:
      const distToMiddle = Math.abs(pos - 0.5); // ranges from 0 to 0.5
      if (distToMiddle < 0.15) {
        totalPenalty += (0.15 - distToMiddle) / 0.15; // 1.0 at middle, 0.0 at boundaries
        matchesCount++;
      }
    }
  });
  
  if (matchesCount === 0) return 1.0;
  return Math.max(0.2, 1.0 - (totalPenalty / matchesCount) * 0.4);
}

/**
 * B4: Nested List Depth
 */
export function scoreB4(parsed: ParsedMarkdown): number {
  if (parsed.listDepths.length === 0) return 1.0;
  const maxDepth = Math.max(...parsed.listDepths);
  if (maxDepth <= 3) return 1.0;
  return Math.max(0.1, 1.0 - 0.2 * (maxDepth - 3));
}

/**
 * B5: Reference Validity
 */
export function scoreB5(text: string): number {
  // Simple check that references match typical file formats or are syntactically valid links
  const matches = text.match(/([a-zA-Z0-9_\-\/]+\.(json|yaml|md|yml|ts|js))/g);
  if (!matches) return 1.0;
  // If there are links, verify they do not contain typical malformed chars
  let broken = 0;
  for (const m of matches) {
    if (m.includes('//') || m.includes('..') || m.includes('\\')) {
      broken++;
    }
  }
  return 1.0 - broken / matches.length;
}

/**
 * B6: Code Block Density
 */
export function scoreB6(text: string): number {
  const totalWords = getWords(text).length;
  if (totalWords === 0) return 1.0;
  
  // Count words inside code blocks
  const codeMatches = text.match(/```[\s\S]*?```/g);
  let codeWords = 0;
  if (codeMatches) {
    for (const block of codeMatches) {
      codeWords += getWords(block).length;
    }
  }
  
  const ratio = codeWords / totalWords;
  if (ratio >= 0.10 && ratio <= 0.40) return 1.0;
  if (ratio < 0.10) return 0.5 + 5.0 * ratio;
  return Math.max(0.1, 1.0 - 1.5 * (ratio - 0.40));
}

/**
 * B7: XML Wrapper Tag Matching
 */
export function scoreB7(text: string): number {
  // Scan for XML-like tags (e.g. <instructions> and </instructions>)
  const openTags = [...text.matchAll(/<([a-zA-Z0-9_\-]+)>/g)].map(m => m[1]);
  const closeTags = [...text.matchAll(/<\/([a-zA-Z0-9_\-]+)>/g)].map(m => m[1]);
  
  if (openTags.length === 0 && closeTags.length === 0) return 1.0;
  
  // Simple intersection checks
  let mismatches = 0;
  const tagCounts = new Map<string, number>();
  for (const t of openTags) {
    tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
  }
  for (const t of closeTags) {
    tagCounts.set(t, (tagCounts.get(t) || 0) - 1);
  }
  
  for (const val of tagCounts.values()) {
    if (val !== 0) {
      mismatches += Math.abs(val);
    }
  }
  return mismatches === 0 ? 1.0 : Math.max(0.1, 1.0 - 0.25 * mismatches);
}

/**
 * B8: Schema Completeness
 */
export function scoreB8(text: string): number {
  // If no schema is declared, it is clean
  if (!text.toLowerCase().includes('schema') && !text.toLowerCase().includes('type')) return 1.0;
  
  const hasProperties = text.toLowerCase().includes('properties') || text.toLowerCase().includes('params');
  const hasRequired = text.toLowerCase().includes('required');
  const hasDesc = text.toLowerCase().includes('description');
  
  let score = 0.4;
  if (hasProperties) score += 0.2;
  if (hasRequired) score += 0.2;
  if (hasDesc) score += 0.2;
  return score;
}

/**
 * B9: Context Pruning Directives
 */
export function scoreB9(text: string): number {
  const pruneKeywords = /\b(forget|clear memory|ignore past|reset history|flush context|prune)\b/gi;
  return pruneKeywords.test(text) ? 1.0 : 0.5;
}

/**
 * B10: Variable Allocation
 */
export function scoreB10(text: string): number {
  // Detect template variables like {{var}} or $VAR
  const vars = [...text.matchAll(/\{\{([a-zA-Z0-9_]+)\}\}/g)].map(m => m[1]);
  if (vars.length === 0) return 1.0;
  
  // Verify if there are description sentences for these variables
  let defined = 0;
  const lowercaseText = text.toLowerCase();
  for (const v of vars) {
    if (lowercaseText.includes(v.toLowerCase())) {
      defined++;
    }
  }
  return defined / vars.length;
}

/**
 * B11: Logging Frequency directives
 */
export function scoreB11(text: string): number {
  const logMatches = text.match(/\b(log|record state|print status|output logs?|diagnostic logs?)\b/gi);
  const count = logMatches ? logMatches.length : 0;
  return Math.min(1.0, count / 2.0);
}

/**
 * B12: Checkpoint Frequency
 */
export function scoreB12(text: string): number {
  const checkMatches = text.match(/\b(save|checkpoint|check-point|commit status|record progress)\b/gi);
  const count = checkMatches ? checkMatches.length : 0;
  return Math.min(1.0, count / 2.0);
}

/**
 * B13: Redundancy Line Penalty
 */
export function scoreB13(text: string): number {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 5);
  if (lines.length === 0) return 1.0;
  const uniqueLines = new Set(lines);
  const dupCount = lines.length - uniqueLines.size;
  return Math.max(0.1, 1.0 - (dupCount / lines.length) * 2.0);
}

/**
 * B14: Stop-Word Saturation
 */
export function scoreB14(text: string): number {
  const words = getWords(text);
  if (words.length === 0) return 1.0;
  
  let stopWordsCount = 0;
  for (const w of words) {
    const cleanWord = w.replace(/[^a-z]/g, '');
    if (STOP_WORDS.has(cleanWord)) {
      stopWordsCount++;
    }
  }
  
  const stopWordRatio = stopWordsCount / words.length;
  return Math.max(0.1, 1.0 - stopWordRatio);
}

/**
 * B15: History Size Constraints
 */
export function scoreB15(text: string): number {
  const historyKeywords = /\b(context window|history limit|max turns|token budget|session context)\b/gi;
  return historyKeywords.test(text) ? 1.0 : 0.5;
}
