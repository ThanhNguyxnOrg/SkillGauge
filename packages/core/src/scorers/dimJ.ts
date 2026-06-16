import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreJ1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('parse'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreJ2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bstringify\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreJ3(text: string): number {
  const dens = calculateDensity(text, /\bobject\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreJ4(text: string): number {
  const parts = text.split(/\bnull\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreJ5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('schema') || t.includes('boolean'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreJ6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('property'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreJ7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bnull\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreJ8(text: string): number {
  const dens = calculateDensity(text, /\bboolean\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreJ9(text: string): number {
  const parts = text.split(/\bstringify\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreJ10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('json') || t.includes('object'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreJ11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('parse'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreJ12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bstringify\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreJ13(text: string): number {
  const dens = calculateDensity(text, /\bobject\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreJ14(text: string): number {
  const parts = text.split(/\bnull\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreJ15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('schema') || t.includes('boolean'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

