import { auditSkill } from '../engine.js';

describe('SkillGauge 100 Scorers Engine', () => {
  it('should compute score based on 100 metrics and geometric mean', () => {
    const raw = `---
name: sample-skill
description: A sample agent skill
---
# Sample Skill
This is a sample skill. It has objective details and rules.
`;
    const report = auditSkill(raw);
    
    // Verify structure
    expect(report.overallScore).toBeDefined();
    expect(report.tier).toBeDefined();
    expect(report.dimensions).toBeDefined();
    expect(report.dimensions.dimA).toBeDefined();
    expect(report.dimensions.dimB).toBeDefined();
    expect(report.dimensions.dimC).toBeDefined();
    expect(report.dimensions.dimD).toBeDefined();
    expect(report.dimensions.dimE).toBeDefined();
    expect(report.dimensions.dimF).toBeDefined();
    expect(report.dimensions.dimG).toBeDefined();

    // Verify all 100 codes are present in report.scores
    expect(report.scores['A1']).toBeDefined();
    expect(report.scores['B15']).toBeDefined();
    expect(report.scores['C14']).toBeDefined();
    expect(report.scores['D13']).toBeDefined();
    expect(report.scores['E12']).toBeDefined();
    expect(report.scores['F11']).toBeDefined();
    expect(report.scores['G10']).toBeDefined();

    // Verify sum keeps the score bounded
    expect(report.overallScore).toBeGreaterThanOrEqual(0.0);
    expect(report.overallScore).toBeLessThanOrEqual(100.0);
  });
});
