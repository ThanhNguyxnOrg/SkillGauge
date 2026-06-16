import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreL1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('then'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreL2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\belse\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreL3(text: string): number {
  const dens = calculateDensity(text, /\bloop\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreL4(text: string): number {
  const parts = text.split(/\bcalculate\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreL5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('evaluate') || t.includes('algorithm'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreL6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('compute'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreL7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bcalculate\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreL8(text: string): number {
  const dens = calculateDensity(text, /\balgorithm\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreL9(text: string): number {
  const parts = text.split(/\belse\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreL10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('if') || t.includes('loop'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreL11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('then'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreL12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\belse\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreL13(text: string): number {
  const dens = calculateDensity(text, /\bloop\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreL14(text: string): number {
  const parts = text.split(/\bcalculate\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreL15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('evaluate') || t.includes('algorithm'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

