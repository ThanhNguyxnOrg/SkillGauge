import { parseMarkdown } from './parsers/markdown.js';
import * as dimA from './scorers/dimA.js';
import * as dimB from './scorers/dimB.js';
import * as dimC from './scorers/dimC.js';
import * as dimD from './scorers/dimD.js';
import * as dimE from './scorers/dimE.js';
import * as dimF from './scorers/dimF.js';
import * as dimG from './scorers/dimG.js';
import { evaluateAntiGaming, AntiGamingResult } from './scorers/antiGaming.js';

// Weighted 7-dimension static scoring (sum = 1.00).
// Every dimension is normalized to [0, 1] (dimScore / 15) before weighting.
export const DIMENSION_WEIGHTS = {
  dimA: 0.22, // Instruction Quality & Clarity
  dimB: 0.16, // Context & Memory Management
  dimC: 0.14, // Safety, Alignment & Security
  dimD: 0.10, // Tool-Use & MCP Clarity
  dimE: 0.14, // Robustness & Exception Handling
  dimF: 0.10, // Operational & Inference Economy
  dimG: 0.14, // Syntax, Structure & Metadata
} as const;

// Percentile tiers calibrated from the live 630-skill corpus under v2 weighted 7-dim engine
// (min 65.24, P50 80.35, P90 86.65, max 92.89). Single source of truth; packageEngine imports these.
export const TIER_P90 = 86.65;
export const TIER_P50 = 80.35;

export const DIM_FAIL_BAR = 9.0; // 60% of 15.0

export interface AuditReport {
  name?: string;
  overallScore: number;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  dimensions: {
    dimA: number; // Quality & Clarity
    dimB: number; // Context & Memory
    dimC: number; // Safety & Alignment
    dimD: number; // Tool-Use & MCP
    dimE: number; // Robustness
    dimF: number; // Economy
    dimG: number; // Structure & Syntax
    [key: string]: number;
  };
  scores: { [key: string]: number };
  antiGaming?: AntiGamingResult;
  explanation?: string;
}

export function auditSkill(content: string): AuditReport {
  const parsed = parseMarkdown(content);
  const scores: { [key: string]: number } = {};

  // Dimension A: Instruction Quality & Clarity (15)
  scores['A1'] = dimA.scoreA1(parsed);
  scores['A2'] = dimA.scoreA2(parsed);
  scores['A3'] = dimA.scoreA3(parsed);
  scores['A4'] = dimA.scoreA4(parsed);
  scores['A5'] = dimA.scoreA5(parsed);
  scores['A6'] = dimA.scoreA6(parsed);
  scores['A7'] = dimA.scoreA7(parsed);
  scores['A8'] = dimA.scoreA8(parsed);
  scores['A9'] = dimA.scoreA9(parsed);
  scores['A10'] = dimA.scoreA10(parsed);
  scores['A11'] = dimA.scoreA11(parsed);
  scores['A12'] = dimA.scoreA12(parsed);
  scores['A13'] = dimA.scoreA13(parsed);
  scores['A14'] = dimA.scoreA14(parsed);
  scores['A15'] = dimA.scoreA15(parsed);

  // Dimension B: Context & Memory Management (15)
  scores['B1'] = dimB.scoreB1(parsed);
  scores['B2'] = dimB.scoreB2(parsed);
  scores['B3'] = dimB.scoreB3(parsed);
  scores['B4'] = dimB.scoreB4(parsed);
  scores['B5'] = dimB.scoreB5(parsed);
  scores['B6'] = dimB.scoreB6(parsed);
  scores['B7'] = dimB.scoreB7(parsed);
  scores['B8'] = dimB.scoreB8(parsed);
  scores['B9'] = dimB.scoreB9(parsed);
  scores['B10'] = dimB.scoreB10(parsed);
  scores['B11'] = dimB.scoreB11(parsed);
  scores['B12'] = dimB.scoreB12(parsed);
  scores['B13'] = dimB.scoreB13(parsed);
  scores['B14'] = dimB.scoreB14(parsed);
  scores['B15'] = dimB.scoreB15(parsed);

  // Dimension C: Safety, Alignment & Security (15)
  scores['C1'] = dimC.scoreC1(parsed);
  scores['C2'] = dimC.scoreC2(parsed);
  scores['C3'] = dimC.scoreC3(parsed);
  scores['C4'] = dimC.scoreC4(parsed);
  scores['C5'] = dimC.scoreC5(parsed);
  scores['C6'] = dimC.scoreC6(parsed);
  scores['C7'] = dimC.scoreC7(parsed);
  scores['C8'] = dimC.scoreC8(parsed);
  scores['C9'] = dimC.scoreC9(parsed);
  scores['C10'] = dimC.scoreC10(parsed);
  scores['C11'] = dimC.scoreC11(parsed);
  scores['C12'] = dimC.scoreC12(parsed);
  scores['C13'] = dimC.scoreC13(parsed);
  scores['C14'] = dimC.scoreC14(parsed);
  scores['C15'] = dimC.scoreC15(parsed);

  // Dimension D: Tool-Use & MCP Clarity (15)
  scores['D1'] = dimD.scoreD1(parsed);
  scores['D2'] = dimD.scoreD2(parsed);
  scores['D3'] = dimD.scoreD3(parsed);
  scores['D4'] = dimD.scoreD4(parsed);
  scores['D5'] = dimD.scoreD5(parsed);
  scores['D6'] = dimD.scoreD6(parsed);
  scores['D7'] = dimD.scoreD7(parsed);
  scores['D8'] = dimD.scoreD8(parsed);
  scores['D9'] = dimD.scoreD9(parsed);
  scores['D10'] = dimD.scoreD10(parsed);
  scores['D11'] = dimD.scoreD11(parsed);
  scores['D12'] = dimD.scoreD12(parsed);
  scores['D13'] = dimD.scoreD13(parsed);
  scores['D14'] = dimD.scoreD14(parsed);
  scores['D15'] = dimD.scoreD15(parsed);

  // Dimension E: Robustness & Exception Handling (15)
  scores['E1'] = dimE.scoreE1(parsed);
  scores['E2'] = dimE.scoreE2(parsed);
  scores['E3'] = dimE.scoreE3(parsed);
  scores['E4'] = dimE.scoreE4(parsed);
  scores['E5'] = dimE.scoreE5(parsed);
  scores['E6'] = dimE.scoreE6(parsed);
  scores['E7'] = dimE.scoreE7(parsed);
  scores['E8'] = dimE.scoreE8(parsed);
  scores['E9'] = dimE.scoreE9(parsed);
  scores['E10'] = dimE.scoreE10(parsed);
  scores['E11'] = dimE.scoreE11(parsed);
  scores['E12'] = dimE.scoreE12(parsed);
  scores['E13'] = dimE.scoreE13(parsed);
  scores['E14'] = dimE.scoreE14(parsed);
  scores['E15'] = dimE.scoreE15(parsed);

  // Dimension F: Operational & Inference Economy (15)
  scores['F1'] = dimF.scoreF1(parsed);
  scores['F2'] = dimF.scoreF2(parsed);
  scores['F3'] = dimF.scoreF3(parsed);
  scores['F4'] = dimF.scoreF4(parsed);
  scores['F5'] = dimF.scoreF5(parsed);
  scores['F6'] = dimF.scoreF6(parsed);
  scores['F7'] = dimF.scoreF7(parsed);
  scores['F8'] = dimF.scoreF8(parsed);
  scores['F9'] = dimF.scoreF9(parsed);
  scores['F10'] = dimF.scoreF10(parsed);
  scores['F11'] = dimF.scoreF11(parsed);
  scores['F12'] = dimF.scoreF12(parsed);
  scores['F13'] = dimF.scoreF13(parsed);
  scores['F14'] = dimF.scoreF14(parsed);
  scores['F15'] = dimF.scoreF15(parsed);

  // Dimension G: Syntax, Structure & Metadata (15)
  scores['G1'] = dimG.scoreG1(parsed);
  scores['G2'] = dimG.scoreG2(parsed);
  scores['G3'] = dimG.scoreG3(parsed);
  scores['G4'] = dimG.scoreG4(parsed);
  scores['G5'] = dimG.scoreG5(parsed);
  scores['G6'] = dimG.scoreG6(parsed);
  scores['G7'] = dimG.scoreG7(parsed);
  scores['G8'] = dimG.scoreG8(parsed);
  scores['G9'] = dimG.scoreG9(parsed);
  scores['G10'] = dimG.scoreG10(parsed);
  scores['G11'] = dimG.scoreG11(parsed);
  scores['G12'] = dimG.scoreG12(parsed);
  scores['G13'] = dimG.scoreG13(parsed);
  scores['G14'] = dimG.scoreG14(parsed);
  scores['G15'] = dimG.scoreG15(parsed);

  const sumDim = (prefix: string) => {
    let total = 0;
    for (let i = 1; i <= 15; i++) total += scores[`${prefix}${i}`];
    return total;
  };

  const dimensions = {
    dimA: sumDim('A'),
    dimB: sumDim('B'),
    dimC: sumDim('C'),
    dimD: sumDim('D'),
    dimE: sumDim('E'),
    dimF: sumDim('F'),
    dimG: sumDim('G'),
  };

  // Weighted 0..100 score across the 7 real dimensions
  const weightedRaw = (
    (dimensions.dimA / 15.0) * DIMENSION_WEIGHTS.dimA +
    (dimensions.dimB / 15.0) * DIMENSION_WEIGHTS.dimB +
    (dimensions.dimC / 15.0) * DIMENSION_WEIGHTS.dimC +
    (dimensions.dimD / 15.0) * DIMENSION_WEIGHTS.dimD +
    (dimensions.dimE / 15.0) * DIMENSION_WEIGHTS.dimE +
    (dimensions.dimF / 15.0) * DIMENSION_WEIGHTS.dimF +
    (dimensions.dimG / 15.0) * DIMENSION_WEIGHTS.dimG
  ) * 100.0;

  // Static anti-gaming & naturalness multiplier
  const antiGaming = evaluateAntiGaming(parsed);
  const overallScore = Math.max(0.0, Math.min(100.0, weightedRaw * antiGaming.multiplier));

  // Diagnostic & backward-compatible aliases
  scores['antiGaming'] = antiGaming.multiplier;
  scores['stuffingScore'] = antiGaming.stuffingScore;
  scores['coherenceScore'] = antiGaming.coherenceScore;
  scores['structureScore'] = antiGaming.structureScore;

  scores['b1_raw'] = scores['B1'];
  scores['b4_raw'] = scores['B4'];
  scores['b11_raw'] = scores['B11'];
  scores['efficacy'] = dimensions.dimA / 15.0;
  scores['friction'] = scores['B1'];
  scores['compactness'] = scores['B4'];
  scores['guardrails'] = scores['E1'];
  scores['schema'] = scores['B8'];
  scores['cohesion'] = dimensions.dimG / 15.0;
  scores['ambiguity'] = scores['A3'];
  scores['memory'] = scores['B11'];
  scores['protection'] = scores['C2'];
  scores['negConstraint'] = scores['A13'];
  scores['saturationRisk'] = scores['B14'];
  scores['isolation'] = scores['B7'];
  scores['position'] = scores['B3'];
  scores['variableSafety'] = scores['B10'];
  scores['exampleRatio'] = scores['B6'];

  let tier: 'Tier 1' | 'Tier 2' | 'Tier 3' = 'Tier 3';
  if (overallScore >= TIER_P90) {
    tier = 'Tier 1';
  } else if (overallScore >= TIER_P50) {
    tier = 'Tier 2';
  }

  const failedDims: string[] = [];
  if (dimensions.dimA < DIM_FAIL_BAR) failedDims.push('A');
  if (dimensions.dimB < DIM_FAIL_BAR) failedDims.push('B');
  if (dimensions.dimC < DIM_FAIL_BAR) failedDims.push('C');
  if (dimensions.dimD < DIM_FAIL_BAR) failedDims.push('D');
  if (dimensions.dimE < DIM_FAIL_BAR) failedDims.push('E');
  if (dimensions.dimF < DIM_FAIL_BAR) failedDims.push('F');
  if (dimensions.dimG < DIM_FAIL_BAR) failedDims.push('G');

  const notes: string[] = [];
  if (failedDims.length > 0) {
    notes.push(`Needs improvements in: ${failedDims.join(', ')}.`);
  }
  if (antiGaming.flags.length > 0) {
    notes.push(`Integrity alerts (×${antiGaming.multiplier.toFixed(2)}): ${antiGaming.flags.join('; ')}.`);
  }
  const explanation = notes.length > 0 ? notes.join(' ') : 'Passes quality specifications.';

  return {
    name: parsed.metadata?.name ? String(parsed.metadata.name) : undefined,
    overallScore,
    tier,
    dimensions,
    scores,
    antiGaming,
    explanation
  };
}

/**
 * Performs a deep semantic audit using Gemini LLM if key is available, falling back to static audit.
 */
export async function auditSkillAsync(content: string, apiKey?: string): Promise<AuditReport> {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;
  const baseReport = auditSkill(content);

  if (!finalApiKey) {
    return baseReport;
  }

  try {
    const prompt = `You are a critical quality auditor of agent skill instruction files.
Analyze this agent skill markdown file. Evaluate whether it is a real, well-written, coherent, and useful production skill, or if it is just nonsensical keyword stuffing (like repeating must/never/rules, repeating lines, or using strange grammar like "shall must") meant to fool a simple keyword-matching checker.

Evaluate and return a JSON object ONLY:
{
  "coherence": <score between 0.0 and 1.0 representing grammar, sentence structure, and overall sense>,
  "depth": <score between 0.0 and 1.0 representing detail, specificity, and real usefulness>,
  "gaming_detected": <true if the file is mock/gibberish stuffed with audit keywords, false otherwise>,
  "explanation": "<brief explanation of your evaluation>"
}

Skill content to evaluate:
---
${content}
---`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${finalApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini evaluation failed: ${response.statusText}`);
    }

    const resData: any = await response.json();
    const resultJson = JSON.parse(resData.candidates?.[0]?.content?.parts?.[0]?.text || '{}');

    const coherence = typeof resultJson.coherence === 'number' ? resultJson.coherence : 1.0;
    const depth = typeof resultJson.depth === 'number' ? resultJson.depth : 1.0;
    const gamingScore = resultJson.gaming_detected === true ? 0.15 : 1.0;

    const semanticMultiplier = coherence * depth * gamingScore;
    const newOverallScore = baseReport.overallScore * semanticMultiplier;

    let tier: 'Tier 1' | 'Tier 2' | 'Tier 3' = 'Tier 3';
    if (newOverallScore >= TIER_P90) {
      tier = 'Tier 1';
    } else if (newOverallScore >= TIER_P50) {
      tier = 'Tier 2';
    }

    return {
      ...baseReport,
      overallScore: newOverallScore,
      tier,
      explanation: `${baseReport.explanation ? baseReport.explanation + ' | ' : ''}LLM multiplier=${semanticMultiplier.toFixed(2)} Quality: ${resultJson.explanation || 'Done'}`
    };
  } catch (error: any) {
    return {
      ...baseReport,
      explanation: `${baseReport.explanation ? baseReport.explanation + ' | ' : ''}LLM Quality Check failed: ${error.message}`
    };
  }
}
