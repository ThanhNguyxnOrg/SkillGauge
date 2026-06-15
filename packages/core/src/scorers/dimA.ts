import { ParsedMarkdown } from '../types.js';

// Helper to count word occurrences
export function getWords(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

// Helper to split sentences
function getSentences(text: string): string[] {
  return text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 2);
}

/**
 * A1: Imperative Verb Density
 */
export function scoreA1(text: string): number {
  const words = getWords(text);
  if (words.length === 0) return 0.0;
  
  // List of common action imperatives in prompt instructions
  const imperatives = /\b(do|run|check|verify|ensure|validate|use|implement|parse|extract|compute|process|save|log|avoid|never|must|shall|strictly|write|read|format|output|reject|close|squash|merge|commit|push|add)\b/gi;
  const matches = text.match(imperatives);
  const count = matches ? matches.length : 0;
  return Math.min(1.0, count / (words.length * 0.06 + 0.0001));
}

/**
 * A2: Passive Voice Penalty
 */
export function scoreA2(text: string): number {
  // Matches e.g., "is processed", "was written", "be done"
  const passivePattern = /\b(is|are|was|were|be|been|get|gets|got)\s+([a-z]+ed|written|taken|done|made|run|built|chosen|seen|given|set)\b/gi;
  const matches = text.match(passivePattern);
  const count = matches ? matches.length : 0;
  return Math.max(0.1, Math.exp(-0.25 * count));
}

/**
 * A3: Qualifier Ambiguity
 */
export function scoreA3(text: string): number {
  const weakPattern = /\b(maybe|sometimes|usually|optionally|try to|should|could|if possible|mostly|likely|probably|flexible)\b/gi;
  const strongPattern = /\b(must|never|shall|required|strictly|prevent|ensure|verify|do not|always)\b/gi;
  
  const weakMatches = text.match(weakPattern);
  const strongMatches = text.match(strongPattern);
  
  const w = weakMatches ? weakMatches.length : 0;
  const s = strongMatches ? strongMatches.length : 0;
  
  if (w === 0 && s === 0) return 0.8;
  return s / (s + 2.0 * w);
}

/**
 * A4: Adverb Bloat
 */
export function scoreA4(text: string): number {
  const adverbs = text.match(/\b([a-z]+ly)\b/gi) || [];
  // Filter out words that end in 'ly' but are not typically booster adverbs
  const nonBoosters = new Set(['only', 'apply', 'early', 'assembly', 'multiply', 'reply', 'rely', 'family', 'daily', 'weekly', 'monthly', 'yearly', 'friendly', 'highly', 'strictly']);
  const count = adverbs.filter(adv => !nonBoosters.has(adv.toLowerCase())).length;
  
  return Math.max(0.1, Math.exp(-0.15 * count));
}

/**
 * A5: Readability Index (Flesch-Kincaid)
 */
export function scoreA5(text: string): number {
  const words = getWords(text);
  const sentences = getSentences(text);
  if (words.length === 0 || sentences.length === 0) return 1.0;
  
  // Syllables estimation based on vowel groups
  let syllables = 0;
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    const vowelGroups = cleanWord.match(/[aeiouy]+/g);
    syllables += vowelGroups ? vowelGroups.length : 1;
  }
  
  const fk = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
  
  // Target Flesch-Kincaid Reading Ease between 50 and 85
  if (fk >= 50 && fk <= 85) return 1.0;
  return Math.max(0.2, 1.0 - 0.02 * Math.max(0, Math.abs(fk - 67.5) - 17.5));
}

/**
 * A6: Sentence Length Variance
 */
export function scoreA6(text: string): number {
  const sentences = getSentences(text);
  if (sentences.length <= 1) return 0.5;
  
  const lengths = sentences.map(s => getWords(s).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / lengths.length;
  
  return Math.min(1.0, variance / 25.0);
}

/**
 * A7: Structural Symmetry
 */
export function scoreA7(text: string): number {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const bulletStyles = new Set<string>();
  
  for (const line of lines) {
    if (line.startsWith('* ')) bulletStyles.add('*');
    if (line.startsWith('- ')) bulletStyles.add('-');
    if (line.startsWith('+ ')) bulletStyles.add('+');
  }
  
  if (bulletStyles.size <= 1) return 1.0;
  return Math.max(0.1, 1.0 - 0.3 * (bulletStyles.size - 1));
}

/**
 * A8: Noun Concreteness
 */
export function scoreA8(text: string): number {
  const words = getWords(text);
  const concreteList = new Set(['file', 'directory', 'folder', 'token', 'string', 'integer', 'boolean', 'array', 'object', 'json', 'yaml', 'schema', 'function', 'api', 'cli', 'parameter', 'argument', 'exit', 'error', 'repo', 'branch', 'pr', 'commit']);
  const abstractList = new Set(['intelligence', 'capability', 'efficiency', 'goodness', 'helpfulness', 'creativity', 'thoughtfulness', 'beauty', 'greatness', 'betterment', 'possibility', 'flexibility', 'intention']);
  
  let concrete = 0;
  let abstract = 0;
  
  for (const w of words) {
    const cleanWord = w.replace(/[^a-z]/g, '');
    if (concreteList.has(cleanWord)) concrete++;
    if (abstractList.has(cleanWord)) abstract++;
  }
  
  if (concrete === 0 && abstract === 0) return 0.9;
  return concrete / (concrete + abstract + 0.0001);
}

/**
 * A9: Goal Specificity
 */
export function scoreA9(text: string): number {
  const formatKeywords = /\b(json|yaml|xml|csv|markdown table|structured output|output format)\b/gi;
  return formatKeywords.test(text) ? 1.0 : 0.3;
}

/**
 * A10: Pronoun Clarity
 */
export function scoreA10(text: string): number {
  const vaguePronouns = /\b(it|they|them|their|its)\b/gi;
  const matches = text.match(vaguePronouns);
  const count = matches ? matches.length : 0;
  return Math.max(0.2, Math.exp(-0.05 * count));
}

/**
 * A11: Semantic Drift Guard
 */
export function scoreA11(text: string): number {
  // Checks if modal contradictions exist in close proximity
  const rules = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let driftCount = 0;
  
  for (let i = 0; i < rules.length; i++) {
    const current = rules[i].toLowerCase();
    for (let j = i + 1; j < Math.min(rules.length, i + 5); j++) {
      const target = rules[j].toLowerCase();
      if (
        (current.includes('always') && target.includes('never')) ||
        (current.includes('must') && target.includes('must not')) ||
        (current.includes('should') && target.includes('should not'))
      ) {
        driftCount++;
      }
    }
  }
  return Math.max(0.2, 1.0 - 0.2 * driftCount);
}

/**
 * A12: Jargon Density
 */
export function scoreA12(text: string): number {
  const words = getWords(text);
  if (words.length === 0) return 1.0;
  
  // Count acronyms or technical jargon (all caps or camelCase / pascalCase)
  const jargonMatches = text.match(/\b([A-Z]{3,}|[a-z]+[A-Z][a-zA-Z]*)\b/g);
  const count = jargonMatches ? jargonMatches.length : 0;
  const density = count / words.length;
  
  if (density <= 0.10) return 1.0;
  return Math.max(0.2, 1.0 - 0.5 * (density - 0.10));
}

/**
 * A13: Positive Directive Balance
 */
export function scoreA13(text: string): number {
  const positive = text.match(/\b(must|always|ensure|required|shall)\b/gi) || [];
  const negative = text.match(/\b(not|never|avoid|don't|prohibited|stop)\b/gi) || [];
  
  const p = positive.length;
  const n = negative.length;
  
  if (p === 0 && n === 0) return 1.0;
  return p / (p + n);
}

/**
 * A14: Scope Boundary Clarity
 */
export function scoreA14(text: string): number {
  const boundaries = /\b(prohibited|outside scope|do not|never|strictly prohibited|ignore|exclude|out of bounds)\b/gi;
  return boundaries.test(text) ? 1.0 : 0.5;
}

/**
 * A15: Temporal Consistency
 */
export function scoreA15(text: string): number {
  const temporal = /\b(first|second|then|finally|next|after|before|step \d+)\b/gi;
  return temporal.test(text) ? 1.0 : 0.4;
}
