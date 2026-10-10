import { auditPackage } from '../packageEngine.js';
import { optimizeTextHeuristics } from '../optimizer.js';

const mk = (name: string, body: string) => ({
  path: `skills/t/${name}.md`,
  content: `---\nname: ${name}\ndescription: d ${name}\n---\n# ${name}\n${body}\n`
});

describe('Recalibrate Task 4: package + optimizer', () => {
  it('packageScore is mean-based, not sum-based', () => {
    const files = [mk('a', 'You must validate output. First step one then finally.'), mk('b', 'You must validate output. First step one then finally.')];
    const r = auditPackage(files);
    const mean = r.individualAudits.reduce((x, y) => x + y.report.overallScore, 0) / r.individualAudits.length;
    // Sum-basis would be ~2x mean; mean-basis tracks mean through penalties
    expect(r.packageScore).toBeCloseTo(mean * r.integrityScore * r.retentionFactor, 2);
    expect(r.packageScore).toBeLessThan(mean * 1.5);
  });
  it('optimizer never rewrites inside code fences', () => {
    const src = '---\nname: x\ndescription: y\n---\n# T\n```\njust simply do it\n```\n';
    expect(optimizeTextHeuristics(src)).toContain('just simply');
  });
  it('optimizer keeps usually outside code (no semantic rewrite)', () => {
    const src = '---\nname: x\ndescription: y\n---\n# T\nIt usually works.\n';
    expect(optimizeTextHeuristics(src)).toContain('usually');
  });
});
