export interface LeaderboardEntry {
  hash: string;
  name: string;
  repository: string;
}

/**
 * Pure duplicate decision (CLI keeps process.exit; logic lives here so it is testable).
 * Same content hash blocks only under a different identity (clean name + repository);
 * unchanged files (same hash, name, repo) pass so full-glob CI runs stay green.
 */
export function isDuplicateEntry(
  dbSkills: LeaderboardEntry[],
  hash: string,
  displayName: string,
  repoName: string
): boolean {
  return dbSkills.some((s) => {
    if (s.hash !== hash) return false;
    const sCleanName = String(s.name).replace('🌟 ', '');
    return !(sCleanName === displayName && s.repository === repoName);
  });
}

export interface WarnTarget {
  file: string;
  content: string;
}

function lineSet(c: string): Set<string> {
  return new Set(
    c.replace(/<!--[\s\S]*?-->/g, '').split(/\r?\n/).map(l => l.trim().toLowerCase()).filter(l => l.length > 5)
  );
}

/**
 * Pairwise near-duplicate warnings (Jaccard > 0.9 on normalized lines); warn-only.
 */
export function nearDupeWarnings(targets: WarnTarget[]): string[] {
  const out: string[] = [];
  const seen: { file: string; lines: Set<string> }[] = [];
  for (const t of targets) {
    const mine = lineSet(t.content);
    for (const prev of seen) {
      let inter = 0;
      for (const l of mine) if (prev.lines.has(l)) inter++;
      const sim = inter / Math.max(1, mine.size + prev.lines.size - inter);
      if (sim > 0.9) {
        out.push(`${t.file} ~ ${prev.file} (${sim.toFixed(2)})`);
      }
    }
    seen.push({ file: t.file, lines: mine });
  }
  return out;
}
