import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreV1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('avoid'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreV2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bword\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreV3(text: string): number {
  const dens = calculateDensity(text, /\blanguage\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreV4(text: string): number {
  const parts = text.split(/\bphrase\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreV5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('term') || t.includes('jargon'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreV6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('say'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreV7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bphrase\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreV8(text: string): number {
  const dens = calculateDensity(text, /\bjargon\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreV9(text: string): number {
  const parts = text.split(/\bword\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreV10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('use') || t.includes('language'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreV11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('avoid'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreV12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bword\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreV13(text: string): number {
  const dens = calculateDensity(text, /\blanguage\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreV14(text: string): number {
  const parts = text.split(/\bphrase\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreV15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('term') || t.includes('jargon'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

