import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreR1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('fallback'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreR2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\brecover\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreR3(text: string): number {
  const dens = calculateDensity(text, /\bcatch\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreR4(text: string): number {
  const parts = text.split(/\bgraceful\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreR5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('fail') || t.includes('restart'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreR6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('timeout'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreR7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bgraceful\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreR8(text: string): number {
  const dens = calculateDensity(text, /\brestart\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreR9(text: string): number {
  const parts = text.split(/\brecover\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreR10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('retry') || t.includes('catch'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreR11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('fallback'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreR12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\brecover\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreR13(text: string): number {
  const dens = calculateDensity(text, /\bcatch\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreR14(text: string): number {
  const parts = text.split(/\bgraceful\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreR15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('fail') || t.includes('restart'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

