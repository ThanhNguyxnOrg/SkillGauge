import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreQ1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('fast'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreQ2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bcache\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreQ3(text: string): number {
  const dens = calculateDensity(text, /\blimit\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreQ4(text: string): number {
  const parts = text.split(/\bspeed\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreQ5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('minimize') || t.includes('budget'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreQ6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('efficient'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreQ7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bspeed\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreQ8(text: string): number {
  const dens = calculateDensity(text, /\bbudget\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreQ9(text: string): number {
  const parts = text.split(/\bcache\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreQ10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('optimize') || t.includes('limit'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreQ11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('fast'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreQ12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bcache\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreQ13(text: string): number {
  const dens = calculateDensity(text, /\blimit\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreQ14(text: string): number {
  const parts = text.split(/\bspeed\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreQ15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('minimize') || t.includes('budget'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

