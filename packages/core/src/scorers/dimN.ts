import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreN1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('temperature'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreN2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bseed\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreN3(text: string): number {
  const dens = calculateDensity(text, /\bsample\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreN4(text: string): number {
  const parts = text.split(/\bvary\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreN5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('chance') || t.includes('diverse'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreN6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('stochastic'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreN7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bvary\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreN8(text: string): number {
  const dens = calculateDensity(text, /\bdiverse\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreN9(text: string): number {
  const parts = text.split(/\bseed\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreN10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('random') || t.includes('sample'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreN11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('temperature'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreN12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bseed\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreN13(text: string): number {
  const dens = calculateDensity(text, /\bsample\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreN14(text: string): number {
  const parts = text.split(/\bvary\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreN15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('chance') || t.includes('diverse'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

