/**
 * Dimension E: Robustness & Exception Handling (15 Scorer Functions)
 */

/**
 * E1: Exception Catcher
 */
export function scoreE1(text: string): number {
  const cleanText = text.toLowerCase();
  const errorTerms = cleanText.match(/\b(errors?|fails?|failures?|invalid|exceptions?|fallback|handling|catch)\b/gi);
  const nError = errorTerms ? errorTerms.length : 0;
  return Math.min(1.0, nError / 3.0);
}

/**
 * E2: Exit Strategy
 */
export function scoreE2(text: string): number {
  const cleanText = text.toLowerCase();
  const exitStrategy = /\b(stop and report|stopping and reporting|abort|max retries?|terminate|throw errors?|exit)\b/i.test(cleanText);
  return exitStrategy ? 1.0 : 0.0;
}

/**
 * E3: Retry Budgets
 */
export function scoreE3(text: string): number {
  const retryPattern = /\b(max retries|retry limit|retry budget|number of retries|retry attempts)\b/gi;
  return retryPattern.test(text) ? 1.0 : 0.3;
}

/**
 * E4: Fallback Plan
 */
export function scoreE4(text: string): number {
  const fallbackPattern = /\b(fallback|alternative method|backup solution|secondary method|fallback plan)\b/gi;
  return fallbackPattern.test(text) ? 1.0 : 0.4;
}

/**
 * E5: Unexpected Input Recovery
 */
export function scoreE5(text: string): number {
  const recoveryPattern = /\b(unexpected input|corrupt|invalid arguments|malformed payload|input recovery)\b/gi;
  return recoveryPattern.test(text) ? 1.0 : 0.4;
}

/**
 * E6: Ambiguity Resolution Flow
 */
export function scoreE6(text: string): number {
  const ambiguityPattern = /\b(clarification|ask user|prompt user for clarification|request details|query user)\b/gi;
  return ambiguityPattern.test(text) ? 1.0 : 0.4;
}

/**
 * E7: State Recovery
 */
export function scoreE7(text: string): number {
  const stateRecoveryPattern = /\b(restore state|recover state|load checkpoint|revert state|recovery procedure)\b/gi;
  return stateRecoveryPattern.test(text) ? 1.0 : 0.5;
}

/**
 * E8: Diagnostics directives
 */
export function scoreE8(text: string): number {
  const diagnosticsPattern = /\b(diagnostics|print crash dump|system report|diagnostic logging|diagnostic tracing)\b/gi;
  return diagnosticsPattern.test(text) ? 1.0 : 0.4;
}

/**
 * E9: Timeouts
 */
export function scoreE9(text: string): number {
  const timeoutPattern = /\b(timeout|time limit|seconds execution|execution time|max duration)\b/gi;
  return timeoutPattern.test(text) ? 1.0 : 0.5;
}

/**
 * E10: Graceful Degradation
 * Upgraded logic: Checks if tool usage instructions contain fallback error-recovery paths.
 */
export function scoreE10(text: string): number {
  const cleanText = text.toLowerCase();
  
  const hasFailureTrigger = /\b(tool fails|api fails|command fails|if the tool returns an error|in case of error)\b/i.test(cleanText);
  const hasRecoveryAction = /\b(fallback|alternative|gracefully|report error|retry|return default)\b/i.test(cleanText);
  
  if (hasFailureTrigger && hasRecoveryAction) return 1.0;
  if (hasFailureTrigger || hasRecoveryAction) return 0.6;
  
  const degradationPattern = /\b(graceful degradation|partial result|degrade performance|fail gracefully|partial output)\b/gi;
  return degradationPattern.test(text) ? 0.4 : 0.2;
}

/**
 * E11: Boundary Value Checks
 */
export function scoreE11(text: string): number {
  const boundaryPattern = /\b(boundary values|out of range|edge cases checking|limit testing|range checks)\b/gi;
  return boundaryPattern.test(text) ? 1.0 : 0.4;
}

/**
 * E12: Noise Filtering
 */
export function scoreE12(text: string): number {
  const noisePattern = /\b(ignore noise|noise filter|irrelevant conversation|filter distractions|ignore irrelevant)\b/gi;
  return noisePattern.test(text) ? 1.0 : 0.5;
}

/**
 * E13: Invariant Assertions
 */
export function scoreE13(text: string): number {
  const assertionPattern = /\b(invariant|assertion|sanity check|verify invariants|continuous check)\b/gi;
  return assertionPattern.test(text) ? 1.0 : 0.5;
}

/**
 * E14: Conflicting Prompt Resolvers
 */
export function scoreE14(text: string): number {
  const conflictPattern = /\b(conflict resolution|contradictory instructions|resolve conflicts|override hierarchy|resolution logic)\b/gi;
  return conflictPattern.test(text) ? 1.0 : 0.5;
}

/**
 * E15: Self-Correction Loop Limits
 */
export function scoreE15(text: string): number {
  const correctionPattern = /\b(self-correction limit|correction loop limit|max refinement|prevent infinite loop|loop boundary)\b/gi;
  return correctionPattern.test(text) ? 1.0 : 0.4;
}
