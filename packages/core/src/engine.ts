import { parseMarkdown } from './parsers/markdown.js';
import * as dimA from './scorers/dimA.js';
import * as dimB from './scorers/dimB.js';
import * as dimC from './scorers/dimC.js';
import * as dimD from './scorers/dimD.js';
import * as dimE from './scorers/dimE.js';
import * as dimF from './scorers/dimF.js';
import * as dimG from './scorers/dimG.js';

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
  };
  scores: { [key: string]: number };
  explanation?: string;
}

export function auditSkill(content: string): AuditReport {
  const parsed = parseMarkdown(content);
  const text = parsed.rawText;

  const scores: { [key: string]: number } = {};

  // Dimension A: Quality & Clarity (15)
  scores['A1'] = dimA.scoreA1(text);
  scores['A2'] = dimA.scoreA2(text);
  scores['A3'] = dimA.scoreA3(text);
  scores['A4'] = dimA.scoreA4(text);
  scores['A5'] = dimA.scoreA5(text);
  scores['A6'] = dimA.scoreA6(text);
  scores['A7'] = dimA.scoreA7(text);
  scores['A8'] = dimA.scoreA8(text);
  scores['A9'] = dimA.scoreA9(text);
  scores['A10'] = dimA.scoreA10(text);
  scores['A11'] = dimA.scoreA11(text);
  scores['A12'] = dimA.scoreA12(text);
  scores['A13'] = dimA.scoreA13(text);
  scores['A14'] = dimA.scoreA14(text);
  scores['A15'] = dimA.scoreA15(text);

  // Dimension B: Context & Memory (15)
  scores['B1'] = dimB.scoreB1(text);
  scores['B2'] = dimB.scoreB2(text);
  scores['B3'] = dimB.scoreB3(text);
  scores['B4'] = dimB.scoreB4(parsed);
  scores['B5'] = dimB.scoreB5(text);
  scores['B6'] = dimB.scoreB6(text);
  scores['B7'] = dimB.scoreB7(text);
  scores['B8'] = dimB.scoreB8(text);
  scores['B9'] = dimB.scoreB9(text);
  scores['B10'] = dimB.scoreB10(text);
  scores['B11'] = dimB.scoreB11(text);
  scores['B12'] = dimB.scoreB12(text);
  scores['B13'] = dimB.scoreB13(text);
  scores['B14'] = dimB.scoreB14(text);
  scores['B15'] = dimB.scoreB15(text);

  // Dimension C: Safety & Alignment (15)
  scores['C1'] = dimC.scoreC1(text);
  scores['C2'] = dimC.scoreC2(text);
  scores['C3'] = dimC.scoreC3(text);
  scores['C4'] = dimC.scoreC4(text);
  scores['C5'] = dimC.scoreC5(text);
  scores['C6'] = dimC.scoreC6(text);
  scores['C7'] = dimC.scoreC7(text);
  scores['C8'] = dimC.scoreC8(text);
  scores['C9'] = dimC.scoreC9(text);
  scores['C10'] = dimC.scoreC10(text);
  scores['C11'] = dimC.scoreC11(text);
  scores['C12'] = dimC.scoreC12(text);
  scores['C13'] = dimC.scoreC13(text);
  scores['C14'] = dimC.scoreC14(text);
  scores['C15'] = dimC.scoreC15(text);

  // Dimension D: Tool-Use & MCP (15)
  scores['D1'] = dimD.scoreD1(text);
  scores['D2'] = dimD.scoreD2(text);
  scores['D3'] = dimD.scoreD3(text);
  scores['D4'] = dimD.scoreD4(text);
  scores['D5'] = dimD.scoreD5(text);
  scores['D6'] = dimD.scoreD6(text);
  scores['D7'] = dimD.scoreD7(text);
  scores['D8'] = dimD.scoreD8(text);
  scores['D9'] = dimD.scoreD9(text);
  scores['D10'] = dimD.scoreD10(text);
  scores['D11'] = dimD.scoreD11(text);
  scores['D12'] = dimD.scoreD12(text);
  scores['D13'] = dimD.scoreD13(text);
  scores['D14'] = dimD.scoreD14(text);
  scores['D15'] = dimD.scoreD15(text);

  // Dimension E: Robustness (15)
  scores['E1'] = dimE.scoreE1(text);
  scores['E2'] = dimE.scoreE2(text);
  scores['E3'] = dimE.scoreE3(text);
  scores['E4'] = dimE.scoreE4(text);
  scores['E5'] = dimE.scoreE5(text);
  scores['E6'] = dimE.scoreE6(text);
  scores['E7'] = dimE.scoreE7(text);
  scores['E8'] = dimE.scoreE8(text);
  scores['E9'] = dimE.scoreE9(text);
  scores['E10'] = dimE.scoreE10(text);
  scores['E11'] = dimE.scoreE11(text);
  scores['E12'] = dimE.scoreE12(text);
  scores['E13'] = dimE.scoreE13(text);
  scores['E14'] = dimE.scoreE14(text);
  scores['E15'] = dimE.scoreE15(text);

  // Dimension F: Economy (15)
  scores['F1'] = dimF.scoreF1(text);
  scores['F2'] = dimF.scoreF2(text);
  scores['F3'] = dimF.scoreF3(text);
  scores['F4'] = dimF.scoreF4(text);
  scores['F5'] = dimF.scoreF5(text);
  scores['F6'] = dimF.scoreF6(text);
  scores['F7'] = dimF.scoreF7(text);
  scores['F8'] = dimF.scoreF8(text);
  scores['F9'] = dimF.scoreF9(text);
  scores['F10'] = dimF.scoreF10(text);
  scores['F11'] = dimF.scoreF11(text);
  scores['F12'] = dimF.scoreF12(text);
  scores['F13'] = dimF.scoreF13(text);
  scores['F14'] = dimF.scoreF14(text);
  scores['F15'] = dimF.scoreF15(text);

  // Dimension G: Structure & Syntax (10)
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

  // Compute Dimension Sums
  const dimAMetrics = ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','A12','A13','A14','A15'];
  const dimBMetrics = ['B1','B2','B3','B4','B5','B6','B7','B8','B9','B10','B11','B12','B13','B14','B15'];
  const dimCMetrics = ['C1','C2','C3','C4','C5','C6','C7','C8','C9','C10','C11','C12','C13','C14','C15'];
  const dimDMetrics = ['D1','D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','D14','D15'];
  const dimEMetrics = ['E1','E2','E3','E4','E5','E6','E7','E8','E9','E10','E11','E12','E13','E14','E15'];
  const dimFMetrics = ['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','F13','F14','F15'];
  const dimGMetrics = ['G1','G2','G3','G4','G5','G6','G7','G8','G9','G10'];

  const getSum = (keys: string[]) => keys.reduce((acc, k) => acc + scores[k], 0);

  const dimensions = {
    dimA: getSum(dimAMetrics),
    dimB: getSum(dimBMetrics),
    dimC: getSum(dimCMetrics),
    dimD: getSum(dimDMetrics),
    dimE: getSum(dimEMetrics),
    dimF: getSum(dimFMetrics),
    dimG: getSum(dimGMetrics)
  };

  // Compute Overall Score as the Sum of all 100 scores
  const allMetricKeys = Object.keys(scores);
  let scoreSum = 0;
  for (const k of allMetricKeys) {
    scoreSum += scores[k];
  }
  const overallScore = scoreSum;

  // Map old aliases for backward compatibility with 1.0 test suite (normalized to 0-1)
  scores['efficacy'] = dimensions.dimA / 15.0;
  scores['friction'] = scores['B1'];
  scores['compactness'] = scores['B4'];
  scores['guardrails'] = scores['E1'];
  scores['schema'] = scores['B8'];
  scores['cohesion'] = dimensions.dimG / 10.0;
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
  if (overallScore >= 85.0) {
    tier = 'Tier 1';
  } else if (overallScore >= 60.0) {
    tier = 'Tier 2';
  }

  // Generate brief feedback on the lowest-scoring dimensions (threshold: 70% of max weight)
  const explanationParts: string[] = [];
  if (dimensions.dimA < 10.5) explanationParts.push('Needs improvements in instruction quality/clarity (A).');
  if (dimensions.dimB < 10.5) explanationParts.push('High token footprint or poor context management (B).');
  if (dimensions.dimC < 7.5) explanationParts.push('Critical safety or injection protection guardrails missing (C).');
  if (dimensions.dimD < 10.5) explanationParts.push('Lacks parameter schema descriptions or tool definitions (D).');
  if (dimensions.dimE < 9.0) explanationParts.push('Poor fallback plan or crash recovery guards (E).');

  return {
    name: parsed.metadata?.name ? String(parsed.metadata.name) : undefined,
    overallScore,
    tier,
    dimensions,
    scores,
    explanation: explanationParts.join(' ') || 'Passes quality specifications.'
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${finalApiKey}`;
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
    if (newOverallScore >= 85.0) {
      tier = 'Tier 1';
    } else if (newOverallScore >= 60.0) {
      tier = 'Tier 2';
    }

    return {
      ...baseReport,
      overallScore: newOverallScore,
      tier,
      explanation: `${baseReport.explanation ? baseReport.explanation + ' | ' : ''}LLM Quality: ${resultJson.explanation || 'Done'}`
    };
  } catch (error: any) {
    return {
      ...baseReport,
      explanation: `${baseReport.explanation ? baseReport.explanation + ' | ' : ''}LLM Quality Check failed: ${error.message}`
    };
  }
}
