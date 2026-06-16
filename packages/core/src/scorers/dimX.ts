import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreX1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('tag'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreX2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\battribute\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreX3(text: string): number {
  const dens = calculateDensity(text, /\bnode\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreX4(text: string): number {
  const parts = text.split(/\bdom\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreX5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('html') || t.includes('tree'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreX6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('parse'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreX7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bdom\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreX8(text: string): number {
  const dens = calculateDensity(text, /\btree\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreX9(text: string): number {
  const parts = text.split(/\battribute\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreX10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('xml') || t.includes('node'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreX11(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('tag'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.5);
}

export function scoreX12(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\battribute\b/i);
  if (dist === -1) return 0.2;
  return Math.max(0.1, 1.0 - (dist / 44.0));
}

export function scoreX13(text: string): number {
  const dens = calculateDensity(text, /\bnode\b/gi);
  return Math.min(1.0, dens * 23);
}

export function scoreX14(text: string): number {
  const parts = text.split(/\bdom\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 29.0));
}

export function scoreX15(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('html') || t.includes('tree'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 2.0);
}

