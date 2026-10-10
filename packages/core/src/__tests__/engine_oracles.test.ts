import { auditSkill, TIER_P90, TIER_P50 } from '../engine.js';
import * as fs from 'fs';
import * as path from 'path';

const fx = (n: string) => fs.readFileSync(path.resolve(__dirname, 'fixtures', n), 'utf-8');

describe('Oracle fixtures (P2P goldens must stay green, F2P gamed must stay red)', () => {
  it('golden-reviewer stays Tier 2+', () => {
    const r = auditSkill(fx('golden-reviewer.md'));
    expect(['Tier 1', 'Tier 2']).toContain(r.tier);
  });
  it('golden-deployer stays Tier 1', () => {
    expect(auditSkill(fx('golden-deployer.md')).tier).toBe('Tier 1');
  });
  it('gamed-gibberish stays Tier 3', () => {
    expect(auditSkill(fx('gamed-gibberish.md')).tier).toBe('Tier 3');
  });
  it('gamed-stuffer advantage over best golden stays bounded (residual Goodhart tripwire)', () => {
    // Static-only scoring cannot fully defeat keyword stuffing; this pins the
    // current boundary so future changes cannot silently widen it. Execution
    // track (spec, deferred) is the real fix.
    const gold = auditSkill(fx('golden-deployer.md')).overallScore;
    const game = auditSkill(fx('gamed-stuffer.md')).overallScore;
    expect(game - gold).toBeLessThan(2.0);
  });
  it('tier constants track the leaderboard population (drift pin)', () => {
    const db = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', '..', 'leaderboard.json'), 'utf-8'));
    const scores = db.skills.map((s: any) => s.overallScore).sort((a: number, b: number) => a - b);
    const p50 = scores[Math.floor(scores.length * 0.5)];
    const p90 = scores[Math.floor(scores.length * 0.9)];
    expect(Math.abs(TIER_P50 - p50)).toBeLessThan(1.0);
    expect(Math.abs(TIER_P90 - p90)).toBeLessThan(1.0);
  });
});
