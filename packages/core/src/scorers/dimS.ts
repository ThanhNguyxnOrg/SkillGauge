import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance
} from './scientificUtils.js';

export function scoreS1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('exec'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreS2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bshell\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreS3(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreS4(text: string): number {
  const parts = text.split(/\bstdout\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreS5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('system') || t.includes('stderr'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreS6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('terminal'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreS7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bstdout\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreS8(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreS9(text: string): number {
  const parts = text.split(/\bshell\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreS10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('bash') || t.includes('run'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreS11(text: string): number {
  return scoreS1(text); // dedup: canonical scoreS1
}

export function scoreS12(text: string): number {
  return scoreS2(text); // dedup: canonical scoreS2
}

export function scoreS13(text: string): number {
  return scoreS3(text); // dedup: canonical scoreS3
}

export function scoreS14(text: string): number {
  return scoreS4(text); // dedup: canonical scoreS4
}

export function scoreS15(text: string): number {
  return scoreS5(text); // dedup: canonical scoreS5
}


