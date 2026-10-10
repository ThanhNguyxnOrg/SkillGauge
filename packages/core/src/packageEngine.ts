import { auditSkill, AuditReport } from './engine.js';

export interface VirtualFile {
  path: string;
  content: string;
}

export interface PackageReport {
  packageScore: number;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  integrityScore: number;
  redundancyPenalty: number;
  /** Same value as redundancyPenalty; the old name misleads (it is a retention factor ≈1.0). */
  retentionFactor: number;
  individualAudits: { path: string; report: AuditReport }[];
}

export function auditPackage(files: VirtualFile[]): PackageReport {
  const skills = files.filter(f => {
    if (!f.path.endsWith('.md')) return false;
    const content = f.content.trim();
    return content.startsWith('---') && content.includes('name:') && content.includes('description:');
  });

  const individualAudits = skills.map(skill => {
    return {
      path: skill.path,
      report: auditSkill(skill.content)
    };
  });

  // Integrity: only real markdown link targets count as references (prose mentions are not refs).
  // shortcut: frontmatter references:/scripts: lists not parsed yet; add when skills use them.
  let totalRefs = 0;
  let brokenRefs = 0;

  for (const skill of skills) {
    const linkTargets = [...skill.content.matchAll(/\[.*?\]\((.*?)\)/g)].map(m => m[1]).filter(t => /\.(json|yaml|yml|md|ts|js)$/i.test(t.trim()));
    for (const target of linkTargets) {
      totalRefs++;
      const clean = target.trim().toLowerCase().split('#')[0];
      const exists = files.some(f => f.path.toLowerCase().endsWith(clean));
      if (!exists) {
        brokenRefs++;
      }
    }
  }
  const integrityScore = totalRefs === 0 ? 1.0 : 1.0 - brokenRefs / totalRefs;

  // Calculate duplication / redundancy penalty
  let totalLines = 0;
  const lineCountMap = new Map<string, number>();

  for (const skill of skills) {
    const lines = skill.content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 5 && !l.startsWith('#'));
    for (const line of lines) {
      totalLines++;
      lineCountMap.set(line, (lineCountMap.get(line) || 0) + 1);
    }
  }

  let duplicatedLines = 0;
  for (const [line, count] of lineCountMap.entries()) {
    if (count > 1) {
      duplicatedLines += count - 1;
    }
  }
  const duplicationRatio = totalLines === 0 ? 0 : duplicatedLines / totalLines;
  const redundancyPenalty = 1.0 - Math.pow(duplicationRatio, 2);

  // Headline and tier move together: both use the mean (sum rewarded adding mediocre skills).
  const totalOverallScore = individualAudits.reduce((acc, current) => acc + current.report.overallScore, 0);
  const meanOverallScore = individualAudits.length === 0 ? 0.0 : totalOverallScore / individualAudits.length;
  const packageScore = meanOverallScore * integrityScore * redundancyPenalty;

  // Determine the Quality Tier based on the average overall score
  const avgOverallScore = meanOverallScore;
  const packageAverage = avgOverallScore * integrityScore * redundancyPenalty;

  // Same percentile tiers as single-skill scoring (population P90 34.39 / P50 30.60 on 2026-10-10).
  let tier: 'Tier 1' | 'Tier 2' | 'Tier 3' = 'Tier 3';
  if (packageAverage >= 34.39) {
    tier = 'Tier 1';
  } else if (packageAverage >= 30.60) {
    tier = 'Tier 2';
  }

  return {
    packageScore,
    tier,
    integrityScore,
    redundancyPenalty,
    retentionFactor: redundancyPenalty,
    individualAudits
  };
}
