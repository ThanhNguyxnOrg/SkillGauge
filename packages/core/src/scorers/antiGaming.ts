import { ParsedMarkdown } from '../types.js';

export interface AntiGamingResult {
  /** Multiplier applied to weighted static score, in [0.35, 1.0]. */
  multiplier: number;
  /** 0..1 score (1.0 = no keyword stuffing detected). */
  stuffingScore: number;
  /** 0..1 score (1.0 = natural grammatical prose). */
  coherenceScore: number;
  /** 0..1 score (1.0 = well-structured multi-section skill). */
  structureScore: number;
  /** Human-readable flags explaining any penalty applied. */
  flags: string[];
}

const AUDIT_BUZZWORDS = new Set([
  'must', 'never', 'shall', 'strictly', 'always', 'ensure', 'verify', 'validate',
  'extract', 'parse', 'run', 'perform', 'implement', 'compute', 'process', 'save',
  'log', 'avoid', 'write', 'read', 'format', 'output', 'reject', 'close',
  'prohibited', 'override', 'overrides', 'abort', 'terminate', 'exit', 'retries',
  'retry', 'fallback', 'timeout', 'checkpoint', 'review', 'approval', 'escalate',
  'handover', 'manual', 'reveal', 'leakage', 'persona', 'jailbreak', 'exfiltrate',
  'cache', 'reuse', 'compress', 'batch', 'minimalist', 'routing', 'haiku', 'flash',
  'temperature', 'seed', 'stochastic', 'encrypt', 'censor', 'obfuscate', 'redact',
  'mask', 'json', 'yaml', 'xml', 'csv', 'schema', 'properties', 'params', 'required'
]);

const GRAMMAR_GLUE = new Set([
  'the', 'a', 'an', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
  'as', 'into', 'when', 'if', 'that', 'this', 'is', 'are', 'be', 'can', 'will',
  'and', 'or', 'but', 'before', 'after', 'each', 'every', 'all', 'any', 'your'
]);

/**
 * Evaluates static anti-gaming & structural naturalness signals.
 * Designed to catch keyword stuffing, gibberish modal stacking, and zero-structure dumps
 * without penalizing legitimate, well-written production skills.
 */
export function evaluateAntiGaming(parsed: ParsedMarkdown): AntiGamingResult {
  const flags: string[] = [];
  const prose = parsed.proseText
    .replace(/`[^`\n]+`/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '');

  const rawWords = prose
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);

  if (rawWords.length < 10) {
    return {
      multiplier: 0.75,
      stuffingScore: 1.0,
      coherenceScore: 0.8,
      structureScore: 0.5,
      flags: ['Skill body is unusually short (< 10 prose words)']
    };
  }

  // 1. Buzzword run detection: 4+ consecutive audit buzzwords without connective grammar
  let maxBuzzRun = 0;
  let currentBuzzRun = 0;
  let longBuzzRuns = 0;
  let buzzCount = 0;
  let glueCount = 0;

  for (const w of rawWords) {
    const clean = w.replace(/[^a-z]/g, '');
    if (GRAMMAR_GLUE.has(clean)) glueCount++;
    if (AUDIT_BUZZWORDS.has(clean)) {
      buzzCount++;
      currentBuzzRun++;
      if (currentBuzzRun > maxBuzzRun) maxBuzzRun = currentBuzzRun;
      if (currentBuzzRun === 4) longBuzzRuns++;
    } else {
      currentBuzzRun = 0;
    }
  }

  const buzzRatio = buzzCount / rawWords.length;
  const glueRatio = glueCount / rawWords.length;

  let stuffingScore = 1.0;
  if (longBuzzRuns >= 2 || maxBuzzRun >= 6) {
    stuffingScore -= Math.min(0.45, 0.15 * longBuzzRuns + (maxBuzzRun >= 6 ? 0.15 : 0));
    flags.push(`Keyword-stuffing pattern detected (${longBuzzRuns} buzzword runs, max run ${maxBuzzRun})`);
  }
  if (buzzRatio > 0.30) {
    stuffingScore -= Math.min(0.35, (buzzRatio - 0.30) * 1.4);
    flags.push(`Unnaturally high audit-keyword density (${(buzzRatio * 100).toFixed(0)}%)`);
  }
  stuffingScore = Math.max(0.25, stuffingScore);

  // 2. Prose coherence & grammar naturalness
  let coherenceScore = 1.0;

  // Stacked contradictory/nonsense modals or gibberish suffixes ("quicklyly")
  const gibberishHits = (
    prose.match(/\b(shall\s+must|must\s+shall|never\s+always|always\s+never|[a-z]+lyly)\b/gi) || []
  ).length;
  if (gibberishHits > 0) {
    coherenceScore -= Math.min(0.45, gibberishHits * 0.15);
    flags.push(`Nonsensical modal/token stacking detected (${gibberishHits} hits)`);
  }

  // Real English prose almost always has >= 10% connective/grammar glue words,
  // whereas terse tables/checklists can be concise. Only penalize low cohesion
  // when paired with keyword stuffing or modal gibberish signals.
  if (rawWords.length >= 40 && glueRatio < 0.09 && (buzzRatio > 0.20 || longBuzzRuns >= 1 || gibberishHits > 0)) {
    coherenceScore -= Math.min(0.35, (0.09 - glueRatio) * 4.5);
    flags.push(`Low grammatical cohesion with keyword stuffing (connective ratio ${(glueRatio * 100).toFixed(1)}%)`);
  }

  // 3-gram repetition check (catches copy-paste stuffing)
  if (rawWords.length >= 30) {
    const trigrams = new Map<string, number>();
    let repeatedTrigrams = 0;
    for (let i = 0; i < rawWords.length - 2; i++) {
      const tri = `${rawWords[i]} ${rawWords[i + 1]} ${rawWords[i + 2]}`;
      const c = (trigrams.get(tri) || 0) + 1;
      trigrams.set(tri, c);
      if (c > 2) repeatedTrigrams++;
    }
    const triRepRatio = repeatedTrigrams / (rawWords.length - 2);
    if (triRepRatio > 0.12) {
      coherenceScore -= Math.min(0.25, (triRepRatio - 0.12) * 1.5);
      flags.push(`Excessive phrase repetition detected`);
    }
  }
  coherenceScore = Math.max(0.3, coherenceScore);

  // 3. Structural substance (headings, lists, or code blocks vs wall-of-text)
  let structureScore = 1.0;
  const hasMultipleHeadings = parsed.headings.length >= 2;
  const hasListOrCode = parsed.listNestingLevels.length > 0 || parsed.codeBlocks.length > 0;
  if (rawWords.length >= 80 && !hasMultipleHeadings && !hasListOrCode) {
    structureScore = 0.8;
    flags.push('Unstructured wall of text (missing subheadings, lists, or code examples)');
  }

  const rawMultiplier = stuffingScore * coherenceScore * structureScore;
  const multiplier = Math.max(0.35, Math.min(1.0, rawMultiplier));

  return {
    multiplier,
    stuffingScore,
    coherenceScore,
    structureScore,
    flags
  };
}
