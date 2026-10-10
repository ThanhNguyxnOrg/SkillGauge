import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance
} from './scientificUtils.js';

export function scoreK1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('rag'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreK2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bretrieve\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreK3(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreK4(text: string): number {
  const parts = text.split(/\bembed\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreK5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('vector') || t.includes('database'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreK6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('query'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreK7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bembed\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreK8(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreK9(text: string): number {
  const parts = text.split(/\bretrieve\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreK10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('search') || t.includes('context'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreK11(text: string): number {
  return scoreK1(text); // dedup: canonical scoreK1
}

export function scoreK12(text: string): number {
  return scoreK2(text); // dedup: canonical scoreK2
}

export function scoreK13(text: string): number {
  return scoreK3(text); // dedup: canonical scoreK3
}

export function scoreK14(text: string): number {
  return scoreK4(text); // dedup: canonical scoreK4
}

export function scoreK15(text: string): number {
  return scoreK5(text); // dedup: canonical scoreK5
}


