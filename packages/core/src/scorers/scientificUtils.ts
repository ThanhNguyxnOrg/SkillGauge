/**
 * Scientific Mathematical Formulas for Agent Skill Analysis
 * Contains statistical and NLP-based calculations.
 */

/**
 * Computes the Shannon Entropy of an array of tokens (Information Density).
 * H(X) = -sum( P(x) * log2(P(x)) )
 */
export function calculateShannonEntropy(tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const counts: Record<string, number> = {};
  for (const token of tokens) {
    counts[token] = (counts[token] || 0) + 1;
  }
  let entropy = 0;
  const total = tokens.length;
  for (const key in counts) {
    const p = counts[key] / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Computes the Type-Token Ratio (TTR) for lexical diversity.
 */
export function calculateTTR(tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const unique = new Set(tokens);
  return unique.size / tokens.length;
}

/**
 * Computes population variance (sigma^2).
 */
export function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squareDiffs = numbers.map(n => Math.pow(n - mean, 2));
  return squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

/**
 * Computes standard deviation (sigma).
 */
export function calculateStandardDeviation(numbers: number[]): number {
  return Math.sqrt(calculateVariance(numbers));
}

/**
 * Measures Average Semantic Dependency Distance between trigger words and action words.
 * Smaller distance = tighter logical coupling.
 */
export function calculateSemanticDependencyDistance(text: string, triggers: RegExp, actions: RegExp): number {
  const words = text.toLowerCase().split(/\s+/);
  let triggerIndices: number[] = [];
  let actionIndices: number[] = [];

  words.forEach((w, i) => {
    if (triggers.test(w)) triggerIndices.push(i);
    if (actions.test(w)) actionIndices.push(i);
  });

  if (triggerIndices.length === 0 || actionIndices.length === 0) return -1; // No dependency pair found

  let totalDist = 0;
  let pairs = 0;
  
  // Greedy closest match for distance calculation
  for (const ti of triggerIndices) {
    let closestDist = Infinity;
    for (const ai of actionIndices) {
      if (ai > ti) { // Action typically follows trigger
        closestDist = Math.min(closestDist, ai - ti);
      }
    }
    if (closestDist !== Infinity) {
      totalDist += closestDist;
      pairs++;
    }
  }
  
  return pairs > 0 ? totalDist / pairs : -1;
}

/**
 * Computes density of matches against total token count.
 */
export function calculateDensity(text: string, regex: RegExp): number {
  const words = text.split(/\s+/);
  if (words.length === 0) return 0;
  const matches = text.match(regex);
  const matchCount = matches ? matches.length : 0;
  return matchCount / words.length;
}

/**
 * ReAct Loop Constriction Ratio (RLCR)
 * Evaluates ratio of bounding/exit words versus reasoning steps.
 */
export function calculateRLCR(text: string): number {
  const exits = text.match(/\b(exit|stop|return|max|limit|end|final)\b/gi)?.length || 0;
  const reasoning = text.match(/\b(think|observe|step|loop|process|analyze)\b/gi)?.length || 0;
  if (reasoning === 0) return 1.0; // If no loop, it's safe
  return Math.min(1.0, exits / reasoning);
}

/**
 * Computes the Imperative Verb Ratio (Verbs starting sentences).
 */
export function calculateActionVerbMatrix(text: string): number {
  const sentences = text.split(/[.!?\n]+/).map(s => s.trim()).filter(s => s.length > 0);
  if (sentences.length === 0) return 0;
  
  let imperativeCount = 0;
  const imperativeRegex = /^(extract|analyze|evaluate|execute|find|use|return|stop|generate|create|format|output|write|read|calculate)\b/i;
  
  for (const s of sentences) {
    if (imperativeRegex.test(s)) imperativeCount++;
  }
  return imperativeCount / sentences.length;
}

/**
 * Simple Tokenizer
 */
export function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(t => t.length > 0);
}
