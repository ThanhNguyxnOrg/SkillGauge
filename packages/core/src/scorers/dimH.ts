import {
  tokenize, calculateShannonEntropy, calculateTTR,
  calculateStandardDeviation, calculateSemanticDependencyDistance,
  calculateDensity, calculateRLCR, calculateActionVerbMatrix
} from './scientificUtils.js';

export function scoreH1(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('approval'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.3);
}

export function scoreH2(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\bmanual\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 24.0));
}

export function scoreH3(text: string): number {
  const dens = calculateDensity(text, /\bescalate\b/gi);
  return Math.min(1.0, dens * 13);
}

export function scoreH4(text: string): number {
  const parts = text.split(/\breview\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 19.0));
}

export function scoreH5(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('wait') || t.includes('handover'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 4.0);
}

export function scoreH6(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('override'));
  const ttr = calculateTTR(filtered);
  return Math.min(1.0, ttr * 1.4);
}

export function scoreH7(text: string): number {
  const dist = calculateSemanticDependencyDistance(text, /\b(if|when)\b/i, /\breview\b/i);
  if (dist === -1) return 0.5; // neutral when pair absent
  return Math.max(0.1, 1.0 - (dist / 34.0));
}

export function scoreH8(text: string): number {
  const dens = calculateDensity(text, /\bhandover\b/gi);
  return Math.min(1.0, dens * 18);
}

export function scoreH9(text: string): number {
  const parts = text.split(/\bmanual\b/i).filter(p => p.trim().length > 0);
  const lengths = parts.map(p => tokenize(p).length);
  const stdDev = calculateStandardDeviation(lengths);
  if (stdDev === 0) return 0.5;
  return Math.max(0.1, 1.0 - (stdDev / 24.0));
}

export function scoreH10(text: string): number {
  const filtered = tokenize(text).filter(t => t.includes('human') || t.includes('escalate'));
  const entropy = calculateShannonEntropy(filtered);
  return Math.min(1.0, entropy / 3.0);
}

export function scoreH11(text: string): number {
  return scoreH1(text); // dedup: canonical scoreH1
}

export function scoreH12(text: string): number {
  return scoreH2(text); // dedup: canonical scoreH2
}

export function scoreH13(text: string): number {
  return scoreH3(text); // dedup: canonical scoreH3
}

export function scoreH14(text: string): number {
  return scoreH4(text); // dedup: canonical scoreH4
}

export function scoreH15(text: string): number {
  return scoreH5(text); // dedup: canonical scoreH5
}

