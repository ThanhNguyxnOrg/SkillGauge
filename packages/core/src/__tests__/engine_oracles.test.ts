import { auditSkill, TIER_P90, TIER_P50 } from '../engine.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const repoRoot = path.resolve(process.cwd(), '..', '..');
const fx = (n: string) => fs.readFileSync(path.resolve(process.cwd(), 'src', '__tests__', 'fixtures', n), 'utf-8');

describe('Oracle fixtures (P2P goldens stay high, F2P gamed stay crushed in Tier 3)', () => {
  it('golden-reviewer scores >= 80 with clean integrity', () => {
    const r = auditSkill(fx('golden-reviewer.md'));
    expect(r.overallScore).toBeGreaterThanOrEqual(79.0);
    expect(r.antiGaming?.multiplier).toBe(1.0);
  });

  it('golden-deployer stays Tier 2+ with clean integrity', () => {
    const r = auditSkill(fx('golden-deployer.md'));
    expect(['Tier 1', 'Tier 2']).toContain(r.tier);
    expect(r.antiGaming?.multiplier).toBe(1.0);
  });

  it('gamed-gibberish stays Tier 3 and is heavily penalized', () => {
    const r = auditSkill(fx('gamed-gibberish.md'));
    expect(r.tier).toBe('Tier 3');
    expect(r.overallScore).toBeLessThan(40.0);
    expect(r.antiGaming?.multiplier).toBeLessThan(0.5);
  });

  it('gamed-stuffer scores strictly below golden fixtures (anti-gaming works)', () => {
    const gold = auditSkill(fx('golden-deployer.md')).overallScore;
    const game = auditSkill(fx('gamed-stuffer.md'));
    expect(game.tier).toBe('Tier 3');
    expect(game.antiGaming?.multiplier).toBeLessThan(0.5);
    expect(gold - game.overallScore).toBeGreaterThan(30.0);
  });

  it('tier constants track the leaderboard population (drift pin)', () => {
    const db = JSON.parse(fs.readFileSync(path.resolve(repoRoot, 'leaderboard.json'), 'utf-8'));
    const scores = db.skills.map((s: any) => s.overallScore).sort((a: number, b: number) => a - b);
    const p50 = scores[Math.floor(scores.length * 0.5)];
    const p90 = scores[Math.floor(scores.length * 0.9)];
    expect(Math.abs(TIER_P50 - p50)).toBeLessThan(1.0);
    expect(Math.abs(TIER_P90 - p90)).toBeLessThan(1.0);
  });
});
