import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance
} from './scientificUtils.js';

export function scoreZ1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('shot'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreZ2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bfew\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreZ3(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreZ4(text: string): number {
  const parts = text.split(/\bcase\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreZ5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('show') || t.includes('sample'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreZ6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('instance'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreZ7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bcase\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreZ8(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreZ9(text: string): number {
  const parts = text.split(/\bfew\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreZ10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('example') || t.includes('zero'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreZ11(text: string): number {
  return scoreZ1(text); // dedup: canonical scoreZ1
}

export function scoreZ12(text: string): number {
  return scoreZ2(text); // dedup: canonical scoreZ2
}

export function scoreZ13(text: string): number {
  return scoreZ3(text); // dedup: canonical scoreZ3
}

export function scoreZ14(text: string): number {
  return scoreZ4(text); // dedup: canonical scoreZ4
}

export function scoreZ15(text: string): number {
  return scoreZ5(text); // dedup: canonical scoreZ5
}


