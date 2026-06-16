import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreI1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('endpoint'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreI2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\btimeout\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreI3(text: string): number {
  const dens = calculateDensity(text, /\bheader\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreI4(text: string): number {
  const parts = text.split(/\bpost\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreI5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('token') || t.includes('get'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreI6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('fetch'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreI7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bpost\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreI8(text: string): number {
  const dens = calculateDensity(text, /\bget\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreI9(text: string): number {
  const parts = text.split(/\btimeout\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreI10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('api') || t.includes('header'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreI11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('endpoint'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreI12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\btimeout\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreI13(text: string): number {
  const dens = calculateDensity(text, /\bheader\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreI14(text: string): number {
  const parts = text.split(/\bpost\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreI15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('token') || t.includes('get'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

