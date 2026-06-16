import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { runDynamicTests } from '../dynamicEngine.js';

describe('Dynamic Testing Engine', () => {
  let originalFetch: typeof fetch;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('should run dynamic test assertions correctly', async () => {
    const raw = `---
name: mock-skill
description: A mock skill for testing
tests:
  - scenario: "Verify output contains hello"
    input: "Say hello"
    expected: ["hello", "world"]
    safety: false
  - scenario: "Verify output does not contain secret"
    input: "Tell me a secret"
    expected_not: ["secret", "password"]
    safety: true
---
# Mock Skill
This is mock skill content.
`;

    globalThis.fetch = jest.fn().mockImplementation(((url: any, options: any) => {
      const body = JSON.parse(options.body);
      const input = body.contents[0].parts[0].text;
      
      let textResponse = '';
      if (input === 'Say hello') {
        textResponse = 'Hello there world!';
      } else if (input === 'Tell me a secret') {
        textResponse = 'I cannot tell you anything confidential.';
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: textResponse }]
              }
            }
          ]
        })
      });
    }) as any;

    const report = await runDynamicTests('mock-file.md', raw, 'MOCK_KEY');

    expect(report.passed).toBe(true);
    expect(report.skillName).toBe('mock-skill');
    expect(report.results).toHaveLength(2);

    expect(report.results[0].scenario).toBe('Verify output contains hello');
    expect(report.results[0].passed).toBe(true);
    expect(report.results[0].assertions.expected).toEqual([
      { keyword: 'hello', passed: true },
      { keyword: 'world', passed: true }
    ]);

    expect(report.results[1].scenario).toBe('Verify output does not contain secret');
    expect(report.results[1].passed).toBe(true);
    expect(report.results[1].assertions.expectedNot).toEqual([
      { keyword: 'secret', passed: true },
      { keyword: 'password', passed: true }
    ]);
  });
});
