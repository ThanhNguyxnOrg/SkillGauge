import { parseMarkdown } from './parsers/markdown.js';

export interface DynamicTestResult {
  scenario: string;
  input: string;
  passed: boolean;
  output: string;
  assertions: {
    expected?: { keyword: string; passed: boolean }[];
    expectedNot?: { keyword: string; passed: boolean }[];
  };
  error?: string;
}

export interface SkillDynamicTestReport {
  skillName: string;
  filePath: string;
  passed: boolean;
  results: DynamicTestResult[];
}

/**
 * Runs dynamic LLM tests on a skill file content using Gemini API
 */
export async function runDynamicTests(
  filePath: string,
  content: string,
  apiKey: string
): Promise<SkillDynamicTestReport> {
  const parsed = parseMarkdown(content);
  const skillName = parsed.metadata.name || 'Unnamed Skill';
  const systemPrompt = parsed.rawText;
  
  const testScenarios = parsed.metadata.tests || [];
  const results: DynamicTestResult[] = [];
  let allPassed = true;

  for (const ts of testScenarios) {
    const scenario = ts.scenario || 'Unnamed Scenario';
    const input = ts.input || '';
    const expectedList: string[] = Array.isArray(ts.expected) ? ts.expected : ts.expected ? [String(ts.expected)] : [];
    const expectedNotList: string[] = Array.isArray(ts.expected_not) ? ts.expected_not : ts.expected_not ? [String(ts.expected_not)] : [];

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: input }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API call failed with status: ${response.status} ${response.statusText}`);
      }

      const resJson: any = await response.json();
      const output = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const lowerOutput = output.toLowerCase();

      const expectedAssertions = expectedList.map(kw => {
        const passed = lowerOutput.includes(kw.toLowerCase());
        return { keyword: kw, passed };
      });

      const expectedNotAssertions = expectedNotList.map(kw => {
        const passed = !lowerOutput.includes(kw.toLowerCase());
        return { keyword: kw, passed };
      });

      const scenarioPassed = 
        expectedAssertions.every(a => a.passed) && 
        expectedNotAssertions.every(a => a.passed);

      if (!scenarioPassed) {
        allPassed = false;
      }

      results.push({
        scenario,
        input,
        passed: scenarioPassed,
        output,
        assertions: {
          expected: expectedAssertions,
          expectedNot: expectedNotAssertions
        }
      });
    } catch (err: any) {
      allPassed = false;
      results.push({
        scenario,
        input,
        passed: false,
        output: '',
        assertions: {},
        error: err.message || 'Unknown error calling Gemini API'
      });
    }
  }

  return {
    skillName,
    filePath,
    passed: testScenarios.length > 0 ? allPassed : true,
    results
  };
}
