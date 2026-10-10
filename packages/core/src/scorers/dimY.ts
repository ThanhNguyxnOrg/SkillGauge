import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreY1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('time'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreY2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\byear\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreY3(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreY4(text: string): number {
  const parts = text.split(/\btimestamp\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreY5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('current') || t.includes('epoch'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreY6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('now'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreY7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\btimestamp\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreY8(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreY9(text: string): number {
  const parts = text.split(/\byear\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreY10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('date') || t.includes('month'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreY11(text: string): number {
  return scoreY1(text); // dedup: canonical scoreY1
}

export function scoreY12(text: string): number {
  return scoreY2(text); // dedup: canonical scoreY2
}

export function scoreY13(text: string): number {
  return scoreY3(text); // dedup: canonical scoreY3
}

export function scoreY14(text: string): number {
  return scoreY4(text); // dedup: canonical scoreY4
}

export function scoreY15(text: string): number {
  return scoreY5(text); // dedup: canonical scoreY5
}

