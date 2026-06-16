import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreT1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('then'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreT2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bnext\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreT3(text: string): number {
  const dens = calculateDensity(text, /\bfinally\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreT4(text: string): number {
  const parts = text.split(/\border\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreT5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('after') || t.includes('step'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreT6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('sequence'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreT7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\border\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreT8(text: string): number {
  const dens = calculateDensity(text, /\bstep\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreT9(text: string): number {
  const parts = text.split(/\bnext\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreT10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('first') || t.includes('finally'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreT11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('then'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreT12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bnext\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreT13(text: string): number {
  const dens = calculateDensity(text, /\bfinally\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreT14(text: string): number {
  const parts = text.split(/\border\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreT15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('after') || t.includes('step'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

