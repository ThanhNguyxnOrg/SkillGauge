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

  // Calculate integrity score (references validation)
  let totalRefs = 0;
  let brokenRefs = 0;

  for (const skill of skills) {
    // Find file linkages like tools/my-tool.json
    const matches = skill.content.match(/([a-zA-Z0-9_\-\/]+\.(json|yaml|md))/g);
    if (matches) {
      for (const match of matches) {
        totalRefs++;
        const targetPath = match.toLowerCase();
        const exists = files.some(f => f.path.toLowerCase().endsWith(targetPath));
        if (!exists) {
          brokenRefs++;
        }
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

  // Compute aggregate package score as the sum of overall scores of all skills
  const totalOverallScore = individualAudits.reduce((acc, current) => acc + current.report.overallScore, 0);
  const packageScore = totalOverallScore * integrityScore * redundancyPenalty;

  // Determine the Quality Tier based on the average overall score
  const avgOverallScore = individualAudits.length === 0 ? 0.0 : totalOverallScore / individualAudits.length;
  const packageAverage = avgOverallScore * integrityScore * redundancyPenalty;

  let tier: 'Tier 1' | 'Tier 2' | 'Tier 3' = 'Tier 3';
  if (packageAverage >= 85.0) {
    tier = 'Tier 1';
  } else if (packageAverage >= 60.0) {
    tier = 'Tier 2';
  }

  return {
    packageScore,
    tier,
    integrityScore,
    redundancyPenalty,
    individualAudits
  };
}
