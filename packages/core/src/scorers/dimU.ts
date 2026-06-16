import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreU1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('role'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreU2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bpersona\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreU3(text: string): number {
  const dens = calculateDensity(text, /\byou\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreU4(text: string): number {
  const parts = text.split(/\bstyle\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreU5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('character') || t.includes('voice'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreU6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('tone'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreU7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bstyle\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreU8(text: string): number {
  const dens = calculateDensity(text, /\bvoice\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreU9(text: string): number {
  const parts = text.split(/\bpersona\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreU10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('act') || t.includes('you'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreU11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('role'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreU12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bpersona\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreU13(text: string): number {
  const dens = calculateDensity(text, /\byou\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreU14(text: string): number {
  const parts = text.split(/\bstyle\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreU15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('character') || t.includes('voice'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

