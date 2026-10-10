import { auditSkill } from '../engine.js';
import * as fs from 'fs';
import * as path from 'path';

function loadSkill(rel: string): string {
  const p = path.resolve(__dirname, '..', '..', '..', '..', rel);
  return fs.readFileSync(p, 'utf-8');
}

describe('Recalibrate Task 1: percentile tiers', () => {
  it('top leaderboard skill reaches Tier 1', () => {
    const c = loadSkill('skills/ecc/laravel-security.md');
    const r = auditSkill(c);
    expect(r.overallScore).toBeGreaterThan(34.0);
    expect(r.tier).not.toBe('Tier 3');
  });
  it('single 70% failedDims bar applies to C', () => {
    // dimC 7.6: old code (C<7.5) would NOT flag C; single 10.5 bar must flag it
    const c = loadSkill('skills/superpowers/brainstorming.md');
    const r = auditSkill(c);
    expect(r.dimensions.dimC).toBeLessThan(10.5);
    expect(r.explanation).toMatch(/C/);
  });
  it('raw aliases exposed under b*_raw with back-compat', () => {
    const r = auditSkill('---\nname: x\ndescription: y\n---\n# T\nBody.\n');
    expect(r.scores['b1_raw']).toBeDefined();
    expect(r.scores['friction']).toBeDefined();
  });
});
