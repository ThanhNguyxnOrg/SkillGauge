# Recalibrate Static Linter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recalibrate SkillGauge scoring so tiers distribute, gaming loses to real skills, and docs reproduce code.

**Architecture:** Minimal edits in `packages/core` scorers + engine, CLI flag for LLM path, docs relabel; then re-audit 411 skills preserving author/submittedAt.

**Tech Stack:** TypeScript, Jest (ts-jest), npm workspaces, Node 26.

**Spec:** `docs/specs/2026-10-09-recalibrate-design.md`

## Global Constraints

- No new dependencies.
- Keep 390 metric keys (H1-H15 per dim) so `engine.ts` loops don't break.
- Keep `overallScore = (Σ/390)·100` formula; only tiers/labels change.
- Preserve `author`/`submittedAt` on leaderboard re-audit.
- Never rewrite content inside ``` fences or frontmatter in optimizer.
- UI label: static signal, not task success.

## Review Focus

- Gaming-stuffed skill scoring above real skill (e.g. brainstorming 29.05) — expect stuffed < real after fix.
- Skill with zero H-Z keywords getting near-zero dims — expect neutral ~0.5 defaults, not 0.2 punishment.
- Same file audited via file path vs directory path differing — expect identical score with `--llm` off.
- `packageScore` headline rising while tier falls when adding mediocre skill — expect both move together (mean).
- Duplicate same-repo same-hash passing `check-duplicate` — expect exit 2.

---

### Task 1: Percentile tiers + failedDims + aliases

**Files:**
- Modify: `packages/core/src/engine.ts:221,240-289`
- Test: `packages/core/src/__tests__/engine_all_scorers.test.ts`

**Interfaces:**
- Consumes: `auditSkill(content: string): AuditReport` (existing).
- Produces: `tier` from percentile thresholds exported as `TIER_P90`, `TIER_P50` (numbers); `failedDims` single 70% bar; aliases renamed `b1_raw/b4_raw/b11_raw` (keep old keys as deprecated aliases for 1 release to avoid breaking web bundle).

- [ ] **Step 1: Write the failing test**

```ts
it('tiers distribute on fixture set', () => {
  const scores = fixtures.map(f => auditSkill(f.content).overallScore);
  const p90 = percentile(scores, 90), p50 = percentile(scores, 50);
  expect(p90).toBeLessThan(60);
  expect(auditSkill(topFixture).tier).not.toBe('Tier 3');
});
it('single failedDims bar', () => {
  expect(failedDimsFor({dimC: 7.6})).toContain('C');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w packages/core 2>&1 | Select-Object -Last 15`
Expected: FAIL (tier always Tier 3, thresholds 85/60)

- [ ] **Step 3: Implement percentile tiers in `packages/core/src/engine.ts`**

Compute P90/P50 from `leaderboard.json` 411 scores via script (one-off, commit thresholds as constants + comment with date/count); replace 85/60; unify failedDims to `<10.5`; rename aliases with backward-compat keys.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -w packages/core 2>&1 | Select-Object -Last 10`
Expected: PASS, 7 suites green

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/engine.ts packages/core/src/__tests__/engine_all_scorers.test.ts
git commit -m "fix(core): percentile tiers, single failedDims bar"
```

### Task 2: H-triple dedup + neutral defaults

**Files:**
- Modify: `packages/core/src/scorers/dimH.ts` (pattern), then `dimI.ts`-`dimZ.ts` (same 5-line delegate each)
- Test: `packages/core/src/__tests__/engine_all_scorers.test.ts`

**Interfaces:**
- Consumes: `scoreH1..H10` canonical implementations.
- Produces: `scoreH11=scoreH1`, `scoreH12=scoreH2(/24)`, `scoreH13=scoreH3(x13)`, `scoreH14=scoreH4(/19)`, `scoreH15=scoreH5(/4)`; same for I-Z; missing-pair default 0.2→0.5.

- [ ] **Step 1: Write the failing test**

```ts
it('H-triple delegates', () => {
  expect(scoreH11('approval approval')).toBe(scoreH1('approval approval'));
  expect(scoreH13('escalate')).toBe(scoreH3('escalate'));
});
it('gaming loses to real', () => {
  expect(auditSkill(gaming).overallScore).toBeLessThan(auditSkill(realBrainstorming).overallScore);
});
it('off-topic skill neutral', () => {
  expect(auditSkill('plain skill no keywords').dimensions.dimH).toBeGreaterThan(5);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -w packages/core 2>&1 | Select-Object -Last 10`
Expected: FAIL (H11≠H1, gaming 36.89 > real 29.05)

- [ ] **Step 3: Implement delegates + default 0.5 in `dimH.ts`-`dimZ.ts`**

Five one-line delegates per file; change `return 0.2` missing-pair to `return 0.5` (keep empty-set 0, single-block 0.5). Add `// shortcut: TTR-vs-density contradiction kept, upgrade with execution track` where both apply.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -w packages/core 2>&1 | Select-Object -Last 10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/scorers/dim*.ts packages/core/src/__tests__/engine_all_scorers.test.ts
git commit -m "fix(core): dedup H-triple, neutral missing-keyword defaults"
```

### Task 3: One engine + CLI `--llm` flag

**Files:**
- Modify: `packages/core/src/engine.ts:294-368`, `packages/cli/src/index.ts:143,173,253`
- Test: manual parity check (no new suite; assert in existing CLI smoke via script)

**Interfaces:**
- Consumes: `auditSkill`, `auditSkillAsync`.
- Produces: CLI `--llm` flag (default off); file and dir paths both use sync unless flag; verbose label `390 raw signals`.

- [ ] **Step 1: Write the failing check**

```ts
// tmp-parity.mjs: audit same file via file-path fn and package fn, expect equal
```

- [ ] **Step 2: Run check to verify it fails**

Run: `node tmp-parity.mjs`
Expected: FAIL (differ when GEMINI_API_KEY set / async path)

- [ ] **Step 3: Implement `--llm` flag in `packages/cli/src/index.ts`, log multiplier in `engine.ts`**

Default sync; when `--llm`, call async + append `LLM multiplier=x.xx` to explanation.

- [ ] **Step 4: Run check to verify it passes**

Run: `node tmp-parity.mjs; rm tmp-parity.mjs`
Expected: PASS (equal with flag off)

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/engine.ts packages/cli/src/index.ts
git commit -m "fix(cli): single engine by default, --llm opt-in with disclosed multiplier"
```

### Task 4: Package mean + optimizer guard + same-repo duplicate

**Files:**
- Modify: `packages/core/src/packageEngine.ts:36,69-77`, `packages/core/src/optimizer.ts:27-45`, `packages/cli/src/index.ts:382-388`
- Test: `packages/core/src/__tests__/packageEngine.test.ts`, `packages/core/src/__tests__/optimizer.test.ts`

**Interfaces:**
- Consumes: `auditSkill`.
- Produces: `packageScore` = mean (not sum); `retentionFactor` (renamed, same formula); integrity counts only `[]()` links + `references:`/`scripts:`; optimizer skips fences/frontmatter, drops `usually/mostly/likely/probably→strictly` map; duplicate flags same-hash any repo + Jaccard>0.9 warn.

- [ ] **Step 1: Write the failing tests**

```ts
it('packageScore equals mean', () => { expect(pkg.packageScore).toBeCloseTo(mean, 2); });
it('optimizer keeps code blocks', () => { expect(optimize('```\njust simply\n```')).toContain('just simply'); });
it('same-repo duplicate exits 2', async () => { /* CLI check-duplicate on copied file */ });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -w packages/core 2>&1 | Select-Object -Last 10`
Expected: FAIL (sum≠mean, code rewritten, same-repo passes)

- [ ] **Step 3: Implement fixes in the three files**

Minimal edits per spec §2.4; Jaccard helper ~20 lines inline in CLI (no dep).

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -w packages/core 2>&1 | Select-Object -Last 10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/packageEngine.ts packages/core/src/optimizer.ts packages/cli/src/index.ts packages/core/src/__tests__/
git commit -m "fix: package mean, optimizer code guard, same-repo duplicate"
```

### Task 5: Honest docs + re-audit migration

**Files:**
- Modify: `README.md`, `CONTRIBUTING.md`, `docs/scientific_metrics.md`, `packages/web/src/App.tsx:99`
- Run: `re-audit-all.yml` equivalent locally, regenerate `leaderboard.json` + web bundle

**Interfaces:**
- Consumes: new engine + thresholds from Task 1.
- Produces: relabeled docs (390 static signals, Reading Ease, tiered formulas, explicit floors, G 15 metrics, no unverifiable cites); migrated `leaderboard.json` with preserved author/submittedAt.

- [ ] **Step 1: Write checklist from spec §2.5 as assertions (grep)**

Run: `grep -rn "100-criteria" README.md packages/web/src/App.tsx` etc.
Expected: hits found (pre-fix)

- [ ] **Step 2: Edit docs/web labels + formulas**

Copy constants verbatim from code; delete G11 `tests` schema; fix G header 10→15.

- [ ] **Step 3: Re-audit locally**

Run: `npm run build; node packages/cli/dist/index.js update-leaderboard --target "skills/**/*.md" --db leaderboard.json --readme README.md --author ThanhNguyxn`
Expected: tiers distribute (T1/T2 nonzero), gaming fixture < real fixtures

- [ ] **Step 4: Run full verification**

Run: `npm test 2>&1 | Select-Object -Last 10`
Expected: 7 suites PASS; `git status` shows only intended files

- [ ] **Step 5: Commit**

```bash
git add README.md CONTRIBUTING.md docs/scientific_metrics.md packages/web/src/App.tsx leaderboard.json
git commit -m "docs: honest 390-signal labels, re-audited leaderboard"
```
