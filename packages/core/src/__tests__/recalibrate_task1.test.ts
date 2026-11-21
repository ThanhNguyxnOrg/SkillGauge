import { auditSkill, DIM_FAIL_BAR } from '../engine.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadSkill(rel: string): string {
  const p = path.resolve(process.cwd(), '..', '..', rel);
  return fs.readFileSync(p, 'utf-8');
}

describe('Recalibrate Task 1: 7-dim weighted scoring & percentile tiers', () => {
  it('top production skill reaches Tier 1 on 0..100 scale', () => {
    const c = loadSkill('skills/ecc/windows-desktop-e2e.md');
    const r = auditSkill(c);
    expect(r.overallScore).toBeGreaterThan(86.0);
    expect(r.tier).toBe('Tier 1');
  });

  it('DIM_FAIL_BAR flags weak dimensions accurately without H-Z noise', () => {
    const minimal = '---\nname: tiny\ndescription: Minimal test skill for bar check\n---\n# Tiny\nJust do the thing.\n';
    const r = auditSkill(minimal);
    expect(r.dimensions.dimC).toBeLessThan(DIM_FAIL_BAR);
    expect(r.explanation).toMatch(/Needs improvements in:/);
    // Should never mention removed synthetic dims H..Z
    expect(r.explanation).not.toMatch(/\b[H-Z]\b/);
  });

  it('raw aliases exposed under b*_raw with back-compat', () => {
    const r = auditSkill('---\nname: x\ndescription: y\n---\n# T\nBody.\n');
    expect(r.scores['b1_raw']).toBeDefined();
    expect(r.scores['friction']).toBeDefined();
    expect(r.scores['antiGaming']).toBeDefined();
  });
});
