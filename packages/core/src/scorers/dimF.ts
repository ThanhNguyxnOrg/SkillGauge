import { ParsedMarkdown } from '../types.js';

/**
 * Dimension F: Operational & Inference Economy (15 Scorer Functions)
 */

function getText(input: string | ParsedMarkdown): string {
  return typeof input === 'string' ? input : input.bodyText;
}

/**
 * F1: Chain-of-Thought Infinite Loop Penalty
 */
export function scoreF1(input: string | ParsedMarkdown): number {
  const cleanText = getText(input).toLowerCase();
  const loopTerms = cleanText.match(/\b(retry infinitely|loop back|repeat indefinitely|infinite loops?|recurse forever)\b/gi);
  const nLoop = loopTerms ? loopTerms.length : 0;
  return Math.max(0.1, 1.0 - 0.25 * nLoop);
}

/**
 * F2: Output Verbosity Control
 */
export function scoreF2(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(be brief|concise|succinct|short answers?|limit verbosity|do not write prose|minimal output|keep it short|terse|compact)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * F3: Token & Context Pruning Directives
 */
export function scoreF3(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(remove filler|prune|compact|distill|minimal|only read|avoid reading|don't read|targeted|focused)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * F4: Early Exit Criteria
 */
export function scoreF4(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(early exit|stop once|exit when|terminate early|stop immediately|short-circuit|return early|done when|completion criteria)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * F5: Caching Directives
 */
export function scoreF5(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(caching|cache|memoize|memoization|ttl|etag|cache hit|invalidation)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * F6: Batching Directives
 */
export function scoreF6(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(batching|batch|in groups|bulk|combine|coalesce|single query|n\+1)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * F7: Context Compression Rules
 */
export function scoreF7(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(compress|summarize|summary|synthesis|distill|condense|digest)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * F8: Computation Reuse
 */
export function scoreF8(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(reuse|reusable|share state|shared|deduplicate|avoid duplicate|already exists|helper)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * F9: Model Tier Routing
 */
export function scoreF9(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(model routing|fallback model|cheap model|expensive model|smaller model|haiku|flash|lightweight|tier)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * F10: Redundant Work Blocker
 */
export function scoreF10(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(avoid redundant|prune search|avoid repetition|do not repeat|don't repeat|unnecessary|no-op|skip if)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * F11: Bounded Iteration & Structured Representation
 */
export function scoreF11(input: string | ParsedMarkdown): number {
  const cleanText = getText(input).toLowerCase();

  const hasLoopLimit = /\b(max attempts?|max retries|up to \d+ times|limit your|exit loop|stop refining|bounded)\b/i.test(cleanText);
  const hasExitCondition = /\b(if satisfied|once corrected|stop if|exit condition|until successful|when passing|when green)\b/i.test(cleanText);

  if (hasLoopLimit && hasExitCondition) return 1.0;
  if (hasLoopLimit || hasExitCondition) return 0.75;

  const minimalistPattern = /\b(minimalist|markdown table|bullet list|no prose|concise|structured|checklist)\b/gi;
  return minimalistPattern.test(cleanText) ? 0.65 : 0.45;
}

/**
 * F12: Formatting Discipline
 */
export function scoreF12(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(formatting|plain text|no markdown|valid json|strict format|exact format|table|code block|template)\b/gi;
  return pattern.test(text) ? 1.0 : 0.6;
}

/**
 * F13: Clarity & Simplicity Guidelines
 */
export function scoreF13(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(simple|simplif|plain english|clear|readable|explicit|direct|straightforward|yagni|minimal)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * F14: Non-Interactive / Automation Directives
 */
export function scoreF14(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(non-interactive|batch mode|unattended|automated|ci\/cd|headless|--yes|-y|scriptable|deterministic)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * F15: Lazy / On-Demand Loading Guidelines
 */
export function scoreF15(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(lazy|on demand|on-demand|defer|only when needed|as needed|incremental|progressive)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}
