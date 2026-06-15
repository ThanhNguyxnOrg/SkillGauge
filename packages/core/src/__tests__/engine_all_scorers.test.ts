import { auditSkill } from '../engine.js';

describe('SkillGauge 15 Scorers Engine', () => {
  it('should audit a markdown file using all 15 scorers and output the score', () => {
    const raw = `---
name: math-solver
description: Solves complex math equations
---
# Math Solver
## Objective
Solve mathematical equations accurately.

## Rules
You must always ensure that variables are parsed carefully.
Do not output raw formatting.
Avoid writing code blocks in invalid JSON formats.
Never ignore user overrides.

## Process
1. Clean parameter inputs inside XML tags like <input>{{user_query}}</input>.
2. Run validation scripts.

## Examples
Example 1:
Input: 1+1
Output: 2
`;
    const report = auditSkill(raw);
    expect(report.overallScore).toBeDefined();
    expect(report.scores.negConstraint).toBeDefined();
    expect(report.scores.position).toBeDefined();
    expect(report.scores.exampleRatio).toBeDefined();
  });
});
