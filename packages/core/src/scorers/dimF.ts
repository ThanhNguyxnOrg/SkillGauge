/**
 * Dimension F: Operational & Inference Economy (15 Scorer Functions)
 */

/**
 * F1: Chain-of-Thought Loop Penalty
 */
export function scoreF1(text: string): number {
  const cleanText = text.toLowerCase();
  const loopTerms = cleanText.match(/\b(retry infinitely|loop back|repeat indefinitely|infinite loops?|recurse forever)\b/gi);
  const nLoop = loopTerms ? loopTerms.length : 0;
  return Math.max(0.1, 1.0 - 0.25 * nLoop);
}

/**
 * F2: Output Verbosity Control
 */
export function scoreF2(text: string): number {
  const verbosityPattern = /\b(be brief|succinct|short answers|limit verbosity|do not write prose|minimal output)\b/gi;
  return verbosityPattern.test(text) ? 1.0 : 0.3;
}

/**
 * F3: Token Pruning directives
 */
export function scoreF3(text: string): number {
  const pruningPattern = /\b(remove filler|prune tokens|compact wording|token pruning|distill prompt)\b/gi;
  return pruningPattern.test(text) ? 1.0 : 0.5;
}

/**
 * F4: Early Exit Criteria
 */
export function scoreF4(text: string): number {
  const earlyExitPattern = /\b(early exit|stop once found|exit when solved|terminate early|stop processing immediately)\b/gi;
  return earlyExitPattern.test(text) ? 1.0 : 0.5;
}

/**
 * F5: Query Cache Directives
 */
export function scoreF5(text: string): number {
  const cachingPattern = /\b(caching|cache query|store calculation|query caching|cache hits?)\b/gi;
  return cachingPattern.test(text) ? 1.0 : 0.5;
}

/**
 * F6: Batching Directives
 */
export function scoreF6(text: string): number {
  const batchingPattern = /\b(batching|in batch|batch processing|process in groups|grouped items)\b/gi;
  return batchingPattern.test(text) ? 1.0 : 0.5;
}

/**
 * F7: Context Compression Rules
 */
export function scoreF7(text: string): number {
  const compressionPattern = /\b(compress context|summarize history|context synthesis|reduce context history|summarize chat)\b/gi;
  return compressionPattern.test(text) ? 1.0 : 0.5;
}

/**
 * F8: Computation Reuse
 */
export function scoreF8(text: string): number {
  const reusePattern = /\b(computation reuse|reuse calculations|share state|reuse intermediate|caching state)\b/gi;
  return reusePattern.test(text) ? 1.0 : 0.5;
}

/**
 * F9: Model Tier Routing
 */
export function scoreF9(text: string): number {
  const routingPattern = /\b(model routing|fallback model|cheap model|expensive model|smaller model|haiku|flash)\b/gi;
  return routingPattern.test(text) ? 1.0 : 0.5;
}

/**
 * F10: Redundant Thought Blocker
 */
export function scoreF10(text: string): number {
  const thoughtBlockerPattern = /\b(thought blocker|avoid redundant reasoning|prune search space|stop reasoning|avoid repetition)\b/gi;
  return thoughtBlockerPattern.test(text) ? 1.0 : 0.5;
}

/**
 * F11: Minimalist Representation
 */
export function scoreF11(text: string): number {
  const minimalistPattern = /\b(minimalist|markdown table|bullet list|no prose|concise structure)\b/gi;
  return minimalistPattern.test(text) ? 1.0 : 0.5;
}

/**
 * F12: Inline Formatting Pruning
 */
export function scoreF12(text: string): number {
  const formattingPattern = /\b(formatting restrictions|no bolding|restrict markdown styling|plain text output|no formatting)\b/gi;
  return formattingPattern.test(text) ? 1.0 : 0.6;
}

/**
 * F13: Vocabulary Simplification
 */
export function scoreF13(text: string): number {
  const vocabPattern = /\b(simplified vocabulary|avoid complex words|common terminology|simple verbs|plain english)\b/gi;
  return vocabPattern.test(text) ? 1.0 : 0.5;
}

/**
 * F14: Non-Interactive Mode Directives
 */
export function scoreF14(text: string): number {
  const nonInteractivePattern = /\b(non-interactive|batch mode|unattended execution|no confirmation|automated run)\b/gi;
  return nonInteractivePattern.test(text) ? 1.0 : 0.5;
}

/**
 * F15: Lazy Evaluation Guidelines
 */
export function scoreF15(text: string): number {
  const lazyEvalPattern = /\b(lazy evaluation|postpone calculation|evaluate on demand|defer execution|lazy load)\b/gi;
  return lazyEvalPattern.test(text) ? 1.0 : 0.5;
}
