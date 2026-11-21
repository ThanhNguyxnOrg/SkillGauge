import { ParsedMarkdown } from '../types.js';

function getProse(input: string | ParsedMarkdown): string {
  return typeof input === 'string' ? input : input.proseText;
}

/** Strip inline code spans and markdown URLs so technical identifiers do not skew prose NLP. */
function stripInlineCodeAndUrls(text: string): string {
  return text
    .replace(/`[^`\n]+`/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' ');
}

// Helper to count word occurrences
export function getWords(text: string): string[] {
  return text.toLowerCase().split(/\s+/).filter(Boolean);
}

// Helper to split prose into meaningful sentences (excluding markdown heading markers)
function getSentences(text: string): string[] {
  const cleaned = text
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '');
  return cleaned
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => getWords(s).length >= 3);
}

/**
 * A1: Imperative Verb Density
 * Measures actionable imperative directives in prose; caps and penalizes unnatural stuffing (>25%).
 */
export function scoreA1(input: string | ParsedMarkdown): number {
  const prose = stripInlineCodeAndUrls(getProse(input));
  const words = getWords(prose);
  if (words.length === 0) return 0.0;

  const imperatives = /\b(do|run|check|verify|ensure|validate|use|implement|parse|extract|compute|process|save|log|avoid|never|must|shall|strictly|write|read|format|output|reject|close|squash|merge|commit|push|add|inspect|test|build|deploy|review|audit|create|update|delete|return|report|detect|fix|handle|apply|configure|prefer|follow|keep|limit|start|stop|enforce|require|confirm|emit|render)\b/gi;
  const matches = prose.match(imperatives);
  const count = matches ? matches.length : 0;
  const density = count / words.length;

  // Unnatural keyword stuffing (> 25% of all words are imperatives)
  if (density > 0.25) {
    return Math.max(0.2, 1.0 - (density - 0.25) * 3.0);
  }
  return Math.min(1.0, density / 0.045);
}

/**
 * A2: Passive Voice Penalty (length-normalized by sentence count)
 */
export function scoreA2(input: string | ParsedMarkdown): number {
  const prose = stripInlineCodeAndUrls(getProse(input));
  const sentences = getSentences(prose);
  const passivePattern = /\b(is|are|was|were|be|been|get|gets|got)\s+([a-z]+ed|written|taken|done|made|run|built|chosen|seen|given|set)\b/gi;
  const matches = prose.match(passivePattern);
  const count = matches ? matches.length : 0;
  const ratio = count / Math.max(1, sentences.length);
  return Math.max(0.2, Math.exp(-1.2 * ratio));
}

/**
 * A3: Qualifier Ambiguity
 * Evaluates strong vs weak modal qualifiers in prose.
 */
export function scoreA3(input: string | ParsedMarkdown): number {
  const prose = stripInlineCodeAndUrls(getProse(input));
  const weakPattern = /\b(maybe|sometimes|usually|optionally|try to|should|could|if possible|mostly|likely|probably|flexible|ideally)\b/gi;
  const strongPattern = /\b(must|never|shall|required|strictly|prevent|ensure|verify|do not|always|avoid|require)\b/gi;

  const w = (prose.match(weakPattern) || []).length;
  const s = (prose.match(strongPattern) || []).length;

  if (w === 0 && s === 0) return 0.75;
  return (s + 0.5) / (s + 2.0 * w + 0.5);
}

/**
 * A4: Adverb Bloat (length-normalized; excludes legitimate technical adverbs)
 */
export function scoreA4(input: string | ParsedMarkdown): number {
  const prose = stripInlineCodeAndUrls(getProse(input));
  const words = getWords(prose);
  if (words.length === 0) return 1.0;

  const adverbs = prose.match(/\b([a-z]{3,}ly)\b/gi) || [];
  const allowedTechnical = new Set([
    'only', 'apply', 'early', 'assembly', 'multiply', 'reply', 'rely', 'family',
    'daily', 'weekly', 'monthly', 'yearly', 'friendly', 'strictly', 'explicitly',
    'automatically', 'directly', 'properly', 'safely', 'correctly', 'immediately',
    'accurately', 'consistently', 'independently', 'dynamically', 'statically',
    'locally', 'globally', 'recursively', 'incrementally', 'sequentially',
    'concurrently', 'asynchronously', 'synchronously', 'gracefully', 'silently',
    'cleanly', 'readily', 'primarily', 'specifically', 'exclusively', 'atomically',
    'deterministically', 'idempotently', 'lazily', 'eagerly', 'firstly', 'secondly', 'finally'
  ]);
  const bloatCount = adverbs.filter(adv => !allowedTechnical.has(adv.toLowerCase())).length;
  const ratio = bloatCount / words.length;
  if (ratio <= 0.015) return 1.0;
  return Math.max(0.2, Math.exp(-15.0 * (ratio - 0.015)));
}

/**
 * A5: Readability Index (Flesch-Kincaid on prose without code/URLs)
 * Technical instructions naturally sit in FK 35..85.
 */
export function scoreA5(input: string | ParsedMarkdown): number {
  const prose = stripInlineCodeAndUrls(getProse(input));
  const words = getWords(prose).filter(w => /[a-z]/i.test(w));
  const sentences = getSentences(prose);
  if (words.length < 5 || sentences.length === 0) return 0.6;

  let syllables = 0;
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (!cleanWord) continue;
    const vowelGroups = cleanWord.match(/[aeiouy]+/g);
    syllables += Math.max(1, vowelGroups ? vowelGroups.length : 1);
  }

  const fk = 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
  if (fk >= 35 && fk <= 85) return 1.0;
  const dist = fk < 35 ? 35 - fk : fk - 85;
  return Math.max(0.25, 1.0 - 0.015 * dist);
}

/**
 * A6: Sentence Length Variance
 * Healthy cadence between concise imperatives and explanatory rules.
 */
export function scoreA6(input: string | ParsedMarkdown): number {
  const prose = stripInlineCodeAndUrls(getProse(input));
  const sentences = getSentences(prose);
  if (sentences.length <= 1) return 0.4;

  const lengths = sentences.map(s => getWords(s).length);
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / lengths.length;

  // Optimal variance >= 12 (reasonable sentence diversity); extreme run-on mean > 40 penalized
  if (mean > 40) return Math.max(0.2, 1.0 - (mean - 40) * 0.03);
  return Math.min(1.0, Math.max(0.3, variance / 16.0));
}

/**
 * A7: Structural Symmetry
 * Consistent bullet list markers in prose (code blocks excluded).
 */
export function scoreA7(input: string | ParsedMarkdown): number {
  const prose = getProse(input);
  const lines = prose.split(/\r?\n/).map(l => l.trim());
  const bulletStyles = new Set<string>();

  for (const line of lines) {
    if (line.startsWith('* ')) bulletStyles.add('*');
    else if (line.startsWith('- ')) bulletStyles.add('-');
    else if (line.startsWith('+ ')) bulletStyles.add('+');
  }

  if (bulletStyles.size <= 1) return 1.0;
  return Math.max(0.2, 1.0 - 0.3 * (bulletStyles.size - 1));
}

/**
 * A8: Noun Concreteness
 * Ratio of concrete engineering nouns vs abstract fluff words.
 */
export function scoreA8(input: string | ParsedMarkdown): number {
  const prose = getProse(input);
  const words = getWords(prose);
  const concreteList = new Set([
    'file', 'files', 'directory', 'folder', 'token', 'tokens', 'string', 'integer',
    'boolean', 'array', 'object', 'json', 'yaml', 'schema', 'function', 'api', 'cli',
    'parameter', 'argument', 'exit', 'error', 'errors', 'repo', 'branch', 'pr', 'commit',
    'test', 'tests', 'command', 'commands', 'endpoint', 'query', 'table', 'index',
    'config', 'env', 'log', 'logs', 'output', 'input', 'payload', 'response', 'request',
    'component', 'module', 'package', 'script', 'hook', 'state', 'cache', 'key', 'secret',
    'header', 'status', 'code', 'path', 'url', 'diff', 'build', 'lint', 'type', 'interface',
    'class', 'method', 'database', 'migration', 'container', 'pod', 'service', 'step', 'steps',
    'rollback', 'artifact', 'widget', 'sql', 'http', 'mcp', 'tool', 'tools'
  ]);
  const abstractList = new Set([
    'intelligence', 'capability', 'efficiency', 'goodness', 'helpfulness', 'creativity',
    'thoughtfulness', 'beauty', 'greatness', 'betterment', 'possibility', 'flexibility',
    'intention', 'synergy', 'excellence', 'perfection', 'awesomeness'
  ]);

  let concrete = 0;
  let abstract = 0;

  for (const w of words) {
    const cleanWord = w.replace(/[^a-z]/g, '');
    if (concreteList.has(cleanWord)) concrete++;
    if (abstractList.has(cleanWord)) abstract++;
  }

  if (concrete === 0 && abstract === 0) return 0.6;
  return concrete / (concrete + abstract * 2.0 + 0.0001);
}

/**
 * A9: Goal & Output Specificity
 * Checks whether deliverable/output format or verification target is explicitly defined.
 */
export function scoreA9(input: string | ParsedMarkdown): number {
  const text = getProse(input);
  const formatKeywords = /\b(json|yaml|xml|csv|markdown table|structured output|output format|report|checklist|diff|patch|summary|deliverable|expected output|return format|response format|emit|render|produce)\b/gi;
  const matches = text.match(formatKeywords);
  const count = matches ? matches.length : 0;
  if (count >= 2) return 1.0;
  if (count === 1) return 0.75;
  return 0.35;
}

/**
 * A10: Pronoun Clarity (length-normalized)
 */
export function scoreA10(input: string | ParsedMarkdown): number {
  const prose = stripInlineCodeAndUrls(getProse(input));
  const words = getWords(prose);
  if (words.length === 0) return 1.0;

  const vaguePronouns = /\b(it|they|them|their|its)\b/gi;
  const count = (prose.match(vaguePronouns) || []).length;
  const ratio = count / words.length;

  if (ratio <= 0.025) return 1.0;
  return Math.max(0.25, Math.exp(-12.0 * (ratio - 0.025)));
}

/**
 * A11: Semantic Drift & Contradiction Guard
 * Flags stacked modal gibberish ("shall must", "never always") and direct same-sentence/same-subject contradictions.
 */
export function scoreA11(input: string | ParsedMarkdown): number {
  const prose = stripInlineCodeAndUrls(getProse(input));
  let issues = 0;

  // 1. Stacked contradictory/nonsense modals
  const stackedModals = /\b(shall\s+must|must\s+shall|never\s+always|always\s+never|must\s+not\s+must|should\s+not\s+should)\b/gi;
  issues += (prose.match(stackedModals) || []).length * 2;

  // 2. Direct same-line modal contradiction on the same action verb
  const lines = prose.split(/\r?\n/).map(l => l.trim().toLowerCase()).filter(Boolean);
  for (const line of lines) {
    if (/\bmust\s+([a-z]{3,})\b/.test(line) && /\bmust\s+not\s+([a-z]{3,})\b/.test(line)) {
      const m1 = line.match(/\bmust\s+([a-z]{3,})\b/);
      const m2 = line.match(/\bmust\s+not\s+([a-z]{3,})\b/);
      if (m1 && m2 && m1[1] === m2[1]) issues++;
    }
    if (/\balways\s+([a-z]{3,})\b/.test(line) && /\bnever\s+([a-z]{3,})\b/.test(line)) {
      const m1 = line.match(/\balways\s+([a-z]{3,})\b/);
      const m2 = line.match(/\bnever\s+([a-z]{3,})\b/);
      if (m1 && m2 && m1[1] === m2[1]) issues++;
    }
  }

  return Math.max(0.2, 1.0 - 0.2 * issues);
}

/**
 * A12: Jargon Density (prose only, excluding backticked code identifiers)
 */
export function scoreA12(input: string | ParsedMarkdown): number {
  const prose = stripInlineCodeAndUrls(getProse(input));
  const words = getWords(prose);
  if (words.length === 0) return 1.0;

  const jargonMatches = prose.match(/\b([A-Z]{4,}|[a-z]+[A-Z][a-zA-Z]*)\b/g);
  const count = jargonMatches ? jargonMatches.length : 0;
  const density = count / words.length;

  if (density <= 0.12) return 1.0;
  return Math.max(0.3, 1.0 - 1.5 * (density - 0.12));
}

/**
 * A13: Directive Balance (Positive DOs + Negative Guardrails)
 * Good agent skills combine clear positive rules with explicit negative constraints.
 */
export function scoreA13(input: string | ParsedMarkdown): number {
  const prose = stripInlineCodeAndUrls(getProse(input));
  const positive = (prose.match(/\b(must|always|ensure|required|shall|prefer|verify|use)\b/gi) || []).length;
  const negative = (prose.match(/\b(not|never|avoid|don't|prohibited|stop|do not|anti-pattern)\b/gi) || []).length;

  const total = positive + negative;
  if (total === 0) return 0.5;
  const posRatio = positive / total;

  // Ideal balance: both positive rules and negative guardrails present (35%..85% positive)
  if (positive > 0 && negative > 0 && posRatio >= 0.35 && posRatio <= 0.85) return 1.0;
  if (positive > 0 && negative === 0) return 0.8;
  if (posRatio > 0.85) return 0.85;
  // Too negative (< 35% positive)
  return Math.max(0.35, 0.35 + posRatio);
}

/**
 * A14: Scope Boundary Clarity
 * Verifies explicit out-of-scope, anti-pattern, or prohibition boundaries.
 */
export function scoreA14(input: string | ParsedMarkdown): number {
  const prose = getProse(input);
  const boundaries = /\b(prohibited|outside scope|out of scope|do not|don't|never|avoid|anti-pattern|when not to|strictly prohibited|ignore|exclude|out of bounds|must not|skip)\b/gi;
  const count = (prose.match(boundaries) || []).length;
  if (count >= 2) return 1.0;
  if (count === 1) return 0.75;
  return 0.4;
}

/**
 * A15: Workflow & Temporal Ordering
 * Checks for explicit sequential steps or phased execution.
 */
export function scoreA15(input: string | ParsedMarkdown): number {
  const prose = getProse(input);
  const temporal = /\b(first|second|then|finally|next|after|before|step\s*\d+|phase\s*\d+|stage\s*\d+|workflow|in order)\b/gi;
  const hasNumberedSteps = /^\s*1\.\s+.+\n[\s\S]*^\s*2\.\s+/m.test(prose);
  if (hasNumberedSteps || (prose.match(temporal) || []).length >= 2) return 1.0;
  if (temporal.test(prose)) return 0.75;
  return 0.45;
}
