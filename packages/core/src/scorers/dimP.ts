import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreP1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('gdpr'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreP2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bdata\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreP3(text: string): number {
  const dens = calculateDensity(text, /\bprivate\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreP4(text: string): number {
  const parts = text.split(/\bprotect\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreP5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('anonymous') || t.includes('leak'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreP6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('secure'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreP7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bprotect\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreP8(text: string): number {
  const dens = calculateDensity(text, /\bleak\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreP9(text: string): number {
  const parts = text.split(/\bdata\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreP10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('pii') || t.includes('private'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreP11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('gdpr'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreP12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bdata\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreP13(text: string): number {
  const dens = calculateDensity(text, /\bprivate\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreP14(text: string): number {
  const parts = text.split(/\bprotect\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreP15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('anonymous') || t.includes('leak'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

