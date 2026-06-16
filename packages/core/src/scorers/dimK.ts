import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreK1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('rag'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreK2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bretrieve\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreK3(text: string): number {
  const dens = calculateDensity(text, /\bcontext\b/gi);
  return Math.min(1.0, dens * 13);
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
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreK8(text: string): number {
  const dens = calculateDensity(text, /\bdatabase\b/gi);
  return Math.min(1.0, dens * 18);
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
  const filtered = tokenize(text).filter(t => t.includes('rag'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreK12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bretrieve\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreK13(text: string): number {
  const dens = calculateDensity(text, /\bcontext\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreK14(text: string): number {
  const parts = text.split(/\bembed\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreK15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('vector') || t.includes('database'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

