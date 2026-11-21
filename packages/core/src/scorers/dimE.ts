import { ParsedMarkdown } from '../types.js';

/**
 * Dimension E: Robustness & Exception Handling (15 Scorer Functions)
 */

function getText(input: string | ParsedMarkdown): string {
  return typeof input === 'string' ? input : input.bodyText;
}

/**
 * E1: Exception Catcher
 */
export function scoreE1(input: string | ParsedMarkdown): number {
  const cleanText = getText(input).toLowerCase();
  const errorTerms = cleanText.match(/\b(errors?|fails?|failures?|invalid|exceptions?|fallback|handling|catch|broken|crash)\b/gi);
  const nError = errorTerms ? errorTerms.length : 0;
  return Math.min(1.0, 0.25 + nError * 0.25);
}

/**
 * E2: Exit & Abort Strategy
 */
export function scoreE2(input: string | ParsedMarkdown): number {
  const cleanText = getText(input).toLowerCase();
  const exitStrategy = /\b(stop and report|stopping and reporting|abort|max retries?|terminate|throw errors?|exit|halt|fail fast|return early|stop immediately|escalate|block)\b/i.test(cleanText);
  return exitStrategy ? 1.0 : 0.35;
}

/**
 * E3: Retry Budgets
 */
export function scoreE3(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(max retries|retry limit|retry budget|number of retries|retry attempts?|retry|retries|backoff)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * E4: Fallback Plan
 */
export function scoreE4(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(fallback|fall back|alternative|backup|secondary|rollback|revert|workaround)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * E5: Unexpected Input Recovery
 */
export function scoreE5(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(unexpected|corrupt|invalid|malformed|missing|empty|null|undefined|nan|edge case)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * E6: Ambiguity Resolution Flow
 */
export function scoreE6(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(clarification|clarify|ask user|ask the user|confirm with|ambiguous|unclear|unsure|request details|prompt user)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * E7: State Recovery & Idempotency
 */
export function scoreE7(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(restore state|recover|checkpoint|revert|rollback|idempotent|idempotency|transaction|atomic)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * E8: Diagnostics Directives
 */
export function scoreE8(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(diagnostics?|stack trace|crash dump|system report|debug|logging|tracing|troubleshoot|root cause|inspect)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * E9: Timeouts & Duration Limits
 */
export function scoreE9(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(timeout|time limit|seconds?|duration|deadline|hang|hung|stall)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * E10: Graceful Degradation
 */
export function scoreE10(input: string | ParsedMarkdown): number {
  const cleanText = getText(input).toLowerCase();

  const hasFailureTrigger = /\b(tool fails|api fails|command fails|if .* fails|on error|on failure|in case of error|when .* fails)\b/i.test(cleanText);
  const hasRecoveryAction = /\b(fallback|fall back|alternative|gracefully|report error|retry|return default|rollback|recover)\b/i.test(cleanText);

  if (hasFailureTrigger && hasRecoveryAction) return 1.0;
  if (hasFailureTrigger || hasRecoveryAction) return 0.7;

  const degradationPattern = /\b(graceful degradation|partial result|fail gracefully|partial output)\b/gi;
  return degradationPattern.test(cleanText) ? 0.6 : 0.4;
}

/**
 * E11: Boundary Value & Edge Case Checks
 */
export function scoreE11(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(boundary|out of range|edge cases?|corner cases?|limit testing|range check|overflow|underflow|empty list|zero)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}

/**
 * E12: Noise & Scope Filtering
 */
export function scoreE12(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(ignore noise|noise|irrelevant|unrelated|out of scope|filter|skip|do not touch)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * E13: Invariant & Sanity Assertions
 */
export function scoreE13(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(invariant|assertion|assert|sanity check|verify|smoke test|regression|guarantee)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * E14: Conflict Resolution
 */
export function scoreE14(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(conflict|contradict|precedence|priority|override hierarchy|takes precedence|instead of|prefer .* over)\b/gi;
  return pattern.test(text) ? 1.0 : 0.5;
}

/**
 * E15: Self-Correction Loop Limits
 */
export function scoreE15(input: string | ParsedMarkdown): number {
  const text = getText(input);
  const pattern = /\b(self-correction|correction loop|max refinement|infinite loop|loop boundary|max attempts?|stop after|at most \d+)\b/gi;
  return pattern.test(text) ? 1.0 : 0.45;
}
