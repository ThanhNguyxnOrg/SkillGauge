import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreW1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('state'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreW2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bcheckpoint\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreW3(text: string): number {
  const dens = calculateDensity(text, /\bresume\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreW4(text: string): number {
  const parts = text.split(/\bprogress\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreW5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('load') || t.includes('log'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreW6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('status'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreW7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bprogress\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreW8(text: string): number {
  const dens = calculateDensity(text, /\blog\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreW9(text: string): number {
  const parts = text.split(/\bcheckpoint\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreW10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('save') || t.includes('resume'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreW11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('state'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreW12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bcheckpoint\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreW13(text: string): number {
  const dens = calculateDensity(text, /\bresume\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreW14(text: string): number {
  const parts = text.split(/\bprogress\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreW15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('load') || t.includes('log'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

