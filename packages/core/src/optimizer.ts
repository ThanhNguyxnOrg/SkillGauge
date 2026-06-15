import { auditSkill } from './engine.js';

/**
 * Clean up text using heuristics (fallback mode if no LLM key is provided)
 */
export function optimizeTextHeuristics(content: string): string {
  // 1. Clean up YAML frontmatter formatting if present
  let result = content;

  // 2. Remove common filler phrases / bloat to reduce friction and saturation risk
  const fillPhrases = [
    /please note that/gi,
    /remember to/gi,
    /feel free to/gi,
    /in order to/gi,
    /make sure to/gi,
    /simply/gi,
    /just/gi,
    /highly recommended/gi,
    /best effort/gi,
  ];
  for (const regex of fillPhrases) {
    result = result.replace(regex, '');
  }

  // 3. Resolve ambiguity: replace weak words with strong words
  const weakToStrong: { [key: string]: string } = {
    'try to': 'must',
    'should': 'must',
    'could': 'shall',
    'maybe': 'always',
    'sometimes': 'always',
    'usually': 'required',
    'if possible': 'strictly',
    'ideally': 'strictly',
    'optionally': 'strictly',
    'mostly': 'strictly',
    'likely': 'strictly',
    'probably': 'strictly'
  };

  for (const [weak, strong] of Object.entries(weakToStrong)) {
    const regex = new RegExp(`\\b${weak}\\b`, 'gi');
    result = result.replace(regex, strong);
  }

  // 4. Clean up multiple empty lines
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim() + '\n';
}

/**
 * Distills and compresses a skill markdown content using Gemini API or heuristics fallback.
 */
export async function optimizeSkill(content: string, apiKey?: string): Promise<string> {
  const finalApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!finalApiKey) {
    // Fallback to rules-based optimization
    return optimizeTextHeuristics(content);
  }

  // Use Gemini API to compress the content
  try {
    const prompt = `You are an expert AI prompt engineer and compressor.
Your task is to optimize the following agent skill markdown content to:
1. Maximize the SkillGauge metrics (reduce verbose prose, use direct imperatives, eliminate nested lists).
2. Avoid weak words (should, could, maybe, try to, if possible, etc.) and replace them with strong constraints (must, never, shall, strictly, etc.).
3. Ensure examples/few-shot section constitutes 15% to 40% of total tokens. Do not delete essential semantic details.
4. Keep XML wrapping tags intact.
5. Retain YAML frontmatter fields.

Respond ONLY with the complete, updated, and optimized skill markdown file. No explanations, no markdown wrapper around the markdown itself.

Original Skill Content:
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
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.statusText}`);
    }

    const data: any = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up codeblock fence wrappers if Gemini wrapped the markdown
    if (text.startsWith('```markdown')) {
      text = text.substring(11);
      if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3);
      }
    } else if (text.startsWith('```')) {
      text = text.substring(3);
      if (text.endsWith('```')) {
        text = text.substring(0, text.length - 3);
      }
    }

    text = text.trim();
    if (text) {
      // Evaluate if optimization improved or kept the score reasonable
      const originalReport = auditSkill(content);
      const newReport = auditSkill(text);

      if (newReport.overallScore >= originalReport.overallScore || newReport.tier === 'Tier 1') {
        return text + '\n';
      }
    }
  } catch (error) {
    // Fall back silently to rules-based optimization
    console.warn('LLM Optimization failed, falling back to heuristics:', error);
  }

  return optimizeTextHeuristics(content);
}
