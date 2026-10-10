import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreM1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('coordinate'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreM2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bdelegate\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreM3(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreM4(text: string): number {
  const parts = text.split(/\bsupervisor\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreM5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('message') || t.includes('orchestrate'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreM6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('worker'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreM7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bsupervisor\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreM8(text: string): number {
  return 0.5; // neutral: density rewards repetition-gaming (b1)
}

export function scoreM9(text: string): number {
  const parts = text.split(/\bdelegate\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreM10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('agent') || t.includes('pass'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreM11(text: string): number {
  return scoreM1(text); // dedup: canonical scoreM1
}

export function scoreM12(text: string): number {
  return scoreM2(text); // dedup: canonical scoreM2
}

export function scoreM13(text: string): number {
  return scoreM3(text); // dedup: canonical scoreM3
}

export function scoreM14(text: string): number {
  return scoreM4(text); // dedup: canonical scoreM4
}

export function scoreM15(text: string): number {
  return scoreM5(text); // dedup: canonical scoreM5
}

