import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreO1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('hide'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreO2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bencrypt\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreO3(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreO4(text: string): number {
  const parts = text.split(/\bcensor\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreO5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('obfuscate') || t.includes('secret'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreO6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('redact'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreO7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bcensor\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreO8(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreO9(text: string): number {
  const parts = text.split(/\bencrypt\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreO10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('mask') || t.includes('hash'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreO11(text: string): number {
  return scoreO1(text); // dedup: canonical scoreO1
}

export function scoreO12(text: string): number {
  return scoreO2(text); // dedup: canonical scoreO2
}

export function scoreO13(text: string): number {
  return scoreO3(text); // dedup: canonical scoreO3
}

export function scoreO14(text: string): number {
  return scoreO4(text); // dedup: canonical scoreO4
}

export function scoreO15(text: string): number {
  return scoreO5(text); // dedup: canonical scoreO5
}

